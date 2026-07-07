"""
Сервис для прослушивания очереди результатов оптимизации резюме
"""
import json
import logging
import threading
import time
from typing import Optional

import pika
from pika.exceptions import AMQPConnectionError, StreamLostError

from app.core.config import get_settings
from app.models.resume import TuningStatus
from app.services.rabbitmq_client import rabbitmq_client

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

settings = get_settings()

class RabbitMQConsumer:
    """
    Потребитель RabbitMQ для прослушивания очереди результатов оптимизации резюме
    """
    def __init__(self):
        """
        Инициализация потребителя RabbitMQ
        """
        self.host = settings.RABBITMQ_HOST
        self.port = settings.RABBITMQ_PORT
        self.username = settings.RABBITMQ_USERNAME
        self.password = settings.RABBITMQ_PASSWORD
        self.queue_name = rabbitmq_client.results_queue_name
        
        self.connection = None
        self.channel = None
        self.thread = None
        self.is_running = False
        self._lock = threading.Lock()
        
        logger.info(f"Инициализация потребителя RabbitMQ: {self.host}:{self.port}, очередь: {self.queue_name}")
    
    def start(self):
        """
        Запускает прослушивание очереди в отдельном потоке
        """
        with self._lock:
            if self.is_running:
                logger.warning("Потребитель RabbitMQ уже запущен")
                return
            
            self.is_running = True
            self.thread = threading.Thread(target=self._start_consuming)
            self.thread.daemon = True
            self.thread.start()
            
            logger.info("Потребитель RabbitMQ запущен в отдельном потоке")
    
    def stop(self):
        """
        Останавливает прослушивание очереди
        """
        with self._lock:
            self.is_running = False
            
            if self.connection and self.connection.is_open:
                try:
                    self.connection.close()
                except Exception as e:
                    logger.error(f"Ошибка при закрытии соединения: {str(e)}")
        
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        
        logger.info("Потребитель RabbitMQ остановлен")
    
    def _start_consuming(self):
        """
        Запускает прослушивание очереди
        """
        while self.is_running:
            try:
                # Параметры подключения
                credentials = pika.PlainCredentials(self.username, self.password)
                connection_params = pika.ConnectionParameters(
                    host=self.host,
                    port=self.port,
                    credentials=credentials,
                    heartbeat=600,
                    blocked_connection_timeout=300,
                    socket_timeout=300
                )
                
                # Устанавливаем соединение
                self.connection = pika.BlockingConnection(connection_params)
                self.channel = self.connection.channel()
                
                # Объявляем очередь (создаем, если не существует)
                self.channel.queue_declare(queue=self.queue_name, durable=True)
                
                # Устанавливаем prefetch_count=1, чтобы не брать новые сообщения, пока не обработаем текущее
                self.channel.basic_qos(prefetch_count=1)
                
                # Настраиваем потребителя
                self.channel.basic_consume(
                    queue=self.queue_name,
                    on_message_callback=self._process_message,
                    auto_ack=False
                )
                
                logger.info(f"Начинаем прослушивание очереди {self.queue_name}")
                
                # Начинаем прослушивание с периодической проверкой соединения
                try:
                    # Инициируем обработку событий
                    self.channel.connection.process_data_events(time_limit=30)
                    
                    while self.is_running:
                        # Обрабатываем данные каждые 30 секунд и проверяем флаг остановки
                        self.channel.connection.process_data_events(time_limit=30)
                        self.channel.connection.sleep(0)  # Даём IO циклу завершиться
                except KeyboardInterrupt:
                    break
                    
            except (AMQPConnectionError, StreamLostError) as e:
                logger.error(f"Ошибка соединения с RabbitMQ: {str(e)}")
                if not self.is_running:
                    break
                logger.info("Повторная попытка подключения через 5 секунд...")
                self._sleep(5)
            except Exception as e:
                logger.error(f"Неожиданная ошибка: {str(e)}")
                if not self.is_running:
                    break
                logger.info("Повторная попытка подключения через 5 секунд...")
                self._sleep(5)
    
    def _sleep(self, seconds: int):
        """
        Спит указанное количество секунд, проверяя флаг is_running
        
        Args:
            seconds: Количество секунд для сна
        """
        for _ in range(seconds):
            if not self.is_running:
                break
            time.sleep(1)
    
    def _process_message(self, ch, method, properties, body):
        """
        Обрабатывает сообщение из очереди результатов resume-tuner.

        Ожидаемый формат тела:
        {
            "tuned_resume_id": int,
            "optimized_resume": str,
            "cover_letter": str,
            "gap_analysis_and_score": str,
            "tokens_used": int,
            "input_tokens": int,
            "output_tokens": int
        }
        """
        try:
            logger.info(f"Получено сообщение из очереди результатов: {body[:120]}...")

            result = json.loads(body)

            tuned_resume_id = result.get('tuned_resume_id')
            if tuned_resume_id is None:
                logger.error("В сообщении отсутствует tuned_resume_id — пропускаем")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

            optimized_resume = result.get('optimized_resume')
            if not optimized_resume:
                logger.error(f"optimized_resume пустой для tuned_resume_id={tuned_resume_id} — пропускаем")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

            cover_letter = result.get('cover_letter')
            gap_analysis_and_score = result.get('gap_analysis_and_score')
            tokens_used = result.get('tokens_used')

            logger.info(
                f"tuned_resume_id={tuned_resume_id} | tokens_used={tokens_used} | "
                f"in={result.get('input_tokens')} out={result.get('output_tokens')}"
            )

            from sqlalchemy import create_engine
            from sqlalchemy.orm import sessionmaker
            from app.models.resume import TunedResume, Resume
            from app.core.config import get_settings

            settings = get_settings()
            sync_engine = create_engine(settings.SYNC_DATABASE_URI)
            SyncSession = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

            with SyncSession() as session:
                tuned_resume = session.query(TunedResume).filter(
                    TunedResume.id == tuned_resume_id
                ).first()

                if tuned_resume is None:
                    logger.error(f"TunedResume id={tuned_resume_id} не найден в БД")
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                    return

                tuned_resume.tuned_text = optimized_resume
                tuned_resume.cover_letter = cover_letter
                tuned_resume.gap_analysis_and_score = gap_analysis_and_score
                tuned_resume.tokens_used = tokens_used
                tuned_resume.status = TuningStatus.COMPLETED

                session.commit()
                logger.info(f"TunedResume id={tuned_resume_id} сохранён со статусом COMPLETED")

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            logger.error(f"Ошибка при обработке сообщения: {e}", exc_info=True)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


# Создаем глобальный экземпляр потребителя
rabbitmq_consumer = RabbitMQConsumer() 