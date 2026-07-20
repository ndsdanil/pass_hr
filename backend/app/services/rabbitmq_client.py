"""
Клиент для работы с RabbitMQ
"""
import json
import logging
import os
import uuid
import threading
import time
from typing import Dict, Any, Optional

import pika
from pika.exceptions import AMQPConnectionError, StreamLostError

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

class RabbitMQClient:
    """
    Клиент для отправки запросов в RabbitMQ
    """
    def __init__(
        self,
        host: str = None,
        port: int = None,
        username: str = None,
        password: str = None,
        queue_name: str = None
    ):
        """
        Инициализация клиента RabbitMQ
        
        Args:
            host: Хост RabbitMQ
            port: Порт RabbitMQ
            username: Имя пользователя RabbitMQ
            password: Пароль RabbitMQ
            queue_name: Имя очереди
        """
        self.host = host or os.getenv('RABBITMQ_HOST', 'localhost')
        self.port = port or int(os.getenv('RABBITMQ_PORT', '5672'))
        self.username = username or os.getenv('RABBITMQ_USERNAME', 'admin')
        self.password = password or os.getenv('RABBITMQ_PASSWORD', '')
        self.queue_name = queue_name or os.getenv('RABBITMQ_QUEUE', 'resume_tuning_queue')
        
        self.connection = None
        self.channel = None
        self._lock = threading.Lock()
        self._heartbeat_interval = 30  # Интервал отправки heartbeat в секундах (5 минут)
        self._heartbeat_thread = None
        self._stop_heartbeat = threading.Event()
        
        # Запускаем heartbeat поток при инициализации
        self._start_heartbeat_thread()
        
        logger.info(f"Инициализация клиента RabbitMQ: {self.host}:{self.port}, очередь: {self.queue_name}")
    
    def _start_heartbeat_thread(self):
        """
        Запускает поток для отправки heartbeat в RabbitMQ
        """
        if self._heartbeat_thread is not None and self._heartbeat_thread.is_alive():
            return

        self._stop_heartbeat.clear()
        self._heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        self._heartbeat_thread.start()
        logger.info("Запущен поток для поддержания соединения с RabbitMQ")
    
    def _heartbeat_loop(self):
        """
        Цикл отправки heartbeat и проверки соединения
        """
        purge_interval = 3600  # Интервал очистки очередей в секундах (1 час)
        last_purge_time = time.time()
        
        while not self._stop_heartbeat.is_set():
            try:
                # Проверяем соединение каждые 30 секунд
                for _ in range(self._heartbeat_interval // 30):
                    if self._stop_heartbeat.is_set():
                        break
                    time.sleep(30)
                
                # Проверяем и восстанавливаем соединение при необходимости
                with self._lock:
                    if self.connection is None or not self.connection.is_open:
                        logger.info("Соединение с RabbitMQ отсутствует, выполняем подключение")
                        self.connect()
                    else:
                        # Поддерживаем соединение активным
                        logger.debug("Отправка process_data_events для поддержания соединения")
                        self.connection.process_data_events()
                
                # Периодически очищаем очереди
                current_time = time.time()
                if current_time - last_purge_time > purge_interval:
                    logger.info("Выполняем плановую очистку очередей RabbitMQ")
                    self.purge_queues()
                    last_purge_time = current_time
                        
            except Exception as e:
                logger.error(f"Ошибка в цикле heartbeat: {str(e)}")
                # При ошибке пытаемся переподключиться
                with self._lock:
                    self.close()
                time.sleep(5)  # Подождем 5 секунд перед повторной попыткой
    
    def connect(self) -> bool:
        """
        Устанавливает соединение с RabbitMQ
        
        Returns:
            bool: True, если соединение установлено успешно, иначе False
        """
        try:
            # Параметры подключения
            credentials = pika.PlainCredentials(self.username, self.password)
            connection_params = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials,
                heartbeat=30,  # Отправка heartbeat каждые 30 секунд (стандартное значение)
                blocked_connection_timeout=300,  # 5 минут ожидания разблокировки
                connection_attempts=5,  # Количество попыток подключения
                retry_delay=20  # Задержка между попытками в секундах
            )
            
            # Устанавливаем соединение
            self.connection = pika.BlockingConnection(connection_params)
            self.channel = self.connection.channel()
            
            # Объявляем очередь (создаем, если не существует) без TTL параметров
            self.channel.queue_declare(
                queue=self.queue_name, 
                durable=True
            )
            
            # Объявляем очередь результатов без TTL параметров
            self.channel.queue_declare(
                queue=self.results_queue_name, 
                durable=True
            )
            
            logger.info(f"Соединение с RabbitMQ установлено: {self.host}:{self.port}")
            return True
            
        except AMQPConnectionError as e:
            logger.error(f"Ошибка соединения с RabbitMQ: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Неожиданная ошибка при подключении к RabbitMQ: {str(e)}")
            return False
    
    def close(self) -> None:
        """
        Закрывает соединение с RabbitMQ
        """
        if self.connection and self.connection.is_open:
            try:
                self.connection.close()
                logger.info("Соединение с RabbitMQ закрыто")
            except Exception as e:
                logger.error(f"Ошибка при закрытии соединения с RabbitMQ: {str(e)}")
        
        self.connection = None
        self.channel = None
    
    def send_message(self, message: Dict[str, Any], correlation_id: Optional[str] = None) -> bool:
        """
        Отправляет сообщение в очередь RabbitMQ
        
        Args:
            message: Сообщение для отправки
            correlation_id: ID корреляции для отслеживания сообщения
            
        Returns:
            bool: True, если сообщение отправлено успешно, иначе False
        """
        with self._lock:
            try:
                # Если соединение не установлено или закрыто, устанавливаем его
                if not self.connection or not self.connection.is_open:
                    if not self.connect():
                        return False
                
                # Генерируем ID корреляции, если не передан
                if correlation_id is None:
                    correlation_id = str(uuid.uuid4())
                
                # Отправляем сообщение
                self.channel.basic_publish(
                    exchange='',
                    routing_key=self.queue_name,
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # Сообщение будет сохранено на диске
                        correlation_id=correlation_id
                    ),
                    body=json.dumps(message, ensure_ascii=False)
                )
                
                logger.info(f"Сообщение отправлено в очередь {self.queue_name}, correlation_id: {correlation_id}")
                return True
                
            except (AMQPConnectionError, StreamLostError) as e:
                logger.error(f"Ошибка соединения при отправке сообщения в RabbitMQ: {str(e)}")
                self.close()  # Закрываем соединение, чтобы потом установить новое
                return False
            except Exception as e:
                logger.error(f"Ошибка при отправке сообщения в RabbitMQ: {str(e)}")
                return False
    
    def send_resume_optimization_request(
        self,
        job_description: str,
        resume: str,
        verbose: bool = False,
        tuned_resume_id: Optional[int] = None,
        correlation_id: Optional[str] = None,
        generate_cover_letter: bool = True
    ) -> bool:
        """
        Отправляет запрос на оптимизацию резюме в очередь RabbitMQ
        
        Args:
            job_description: Описание вакансии
            resume: Текст резюме
            verbose: Флаг для вывода дополнительной информации
            tuned_resume_id: ID записи оптимизированного резюме в базе данных
            correlation_id: ID корреляции для отслеживания сообщения
            generate_cover_letter: Флаг для генерации сопроводительного письма
            
        Returns:
            bool: True, если запрос отправлен успешно, иначе False
        """
        message = {
            'job_description': job_description,
            'resume': resume,
            'verbose': verbose,
            'generate_cover_letter': generate_cover_letter
        }
        
        # Добавляем ID записи оптимизированного резюме, если он передан
        if tuned_resume_id is not None:
            message['tuned_resume_id'] = tuned_resume_id
        
        return self.send_message(message, correlation_id)
    
    def stop(self):
        """
        Останавливает работу клиента RabbitMQ
        """
        logger.info("Остановка клиента RabbitMQ")
        self._stop_heartbeat.set()
        
        if self._heartbeat_thread and self._heartbeat_thread.is_alive():
            self._heartbeat_thread.join(timeout=1.0)
        
        with self._lock:
            self.close()
    
    @property
    def results_queue_name(self) -> str:
        """
        Возвращает имя очереди для результатов оптимизации резюме
        
        Returns:
            str: Имя очереди результатов
        """
        return os.getenv('RABBITMQ_RESULTS_QUEUE', 'resume_tuning_results_queue')
    
    def purge_queues(self) -> bool:
        """
        Очищает очереди от всех сообщений
        
        Returns:
            bool: True, если очереди успешно очищены, иначе False
        """
        with self._lock:
            try:
                # Если соединение не установлено или закрыто, устанавливаем его
                if not self.connection or not self.connection.is_open:
                    if not self.connect():
                        return False
                
                # Очищаем основную очередь
                self.channel.queue_purge(queue=self.queue_name)
                logger.info(f"Очередь {self.queue_name} очищена")
                
                # Очищаем очередь результатов
                self.channel.queue_purge(queue=self.results_queue_name)
                logger.info(f"Очередь {self.results_queue_name} очищена")
                
                return True
                
            except Exception as e:
                logger.error(f"Ошибка при очистке очередей: {str(e)}")
                return False


# Создаем глобальный экземпляр клиента
rabbitmq_client = RabbitMQClient() 