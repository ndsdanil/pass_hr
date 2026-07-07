from openai import OpenAI, AsyncOpenAI
from app.core.config import get_settings
import asyncio
import logging
import httpx
import os
import re
from loguru import logger
from app.services.rabbitmq_client import rabbitmq_client
from typing import Optional

logger = logging.getLogger(__name__)
settings = get_settings()

class OpenAIService:
    def __init__(self):
        # Создаем HTTP клиент с нужными настройками
        http_client = httpx.Client(
            timeout=120.0,  # Увеличенный таймаут
            follow_redirects=True
        )
        
        # Инициализируем OpenAI клиент с настроенным HTTP клиентом
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            http_client=http_client
        )
        logger.info("OpenAI service initialized successfully")

    async def normalize_resume_text(self, text: str) -> str:
        
        """
        Нормализует форматирование текста резюме с помощью GPT-4.
        Сохраняет оригинальное содержание, но улучшает структуру и форматирование.
        """
        logger.info("Starting resume text normalization")
        prompt = """
        Ты - проверяешь форматирование резюме. Твоя задача - восстановить съехавшую верстку резюме из текста, после извлечения из PDF.

        Правила:
        1. НЕ МЕНЯЙ содержание текста, НЕ ДОБАВЛЯЙ новый текст от себя
        2. Сохраняй все оригинальные данные
        

        Вот текст резюме для форматирования:
        {text}
        """
# 3. Восстанови структуру, используя:
#            - Правильные отступы и переносы строк
#            - Разделение на логические секции (опыт работы, образование и т.д.)
#            - Маркированные списки где это уместно
#            - Сохранение табуляции и иерархии
#            - Используй оригинальный язык резюме


        try:
            # Добавляем повторные попытки при ошибках
            max_retries = 3
            retry_delay = 2
            
            for attempt in range(max_retries):
                try:
                    logger.info(f"Attempt {attempt + 1} to normalize resume text")
                    # OpenAI клиент не является асинхронным, поэтому запускаем его в отдельном потоке
                    loop = asyncio.get_event_loop()
                    response = await loop.run_in_executor(
                        None,
                        lambda: self.client.chat.completions.create(
                            model="gpt-4o",
                            messages=[
                                {"role": "system", "content": "Ты - эксперт по форматированию резюме. Твоя задача - восстановить форматирование резюме без изменения его содержания. **Не добавляй ничего от себя**. Ответ должен быть без символов '```' в начале и конце."},
                                {"role": "user", "content": prompt.format(text=text)}
                            ],
                            temperature=0.3  # Низкая температура для более консистентных результатов
                        )
                    )
                    
                    normalized_text = response.choices[0].message.content.strip()
                    logger.info("Resume text normalized successfully")
                    return normalized_text
                except Exception as e:
                    logger.error(f"Attempt {attempt+1}/{max_retries} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        retry_delay *= 2  # Экспоненциальная задержка
                    else:
                        raise
                        
        except Exception as e:
            logger.exception(f"Error processing resume text: {str(e)}")
            # При сбое нормализации возвращаем оригинальный текст — без сообщений об ошибке пользователю
            return text

    async def generate_resume_title(self, text: str) -> str:
        """
        Генерирует подходящее название для резюме на основе его текста.
        """
        logger.info("Starting resume title generation")
        prompt = """
        Ты - эксперт по резюме. Твоя задача - придумать короткое (не более 5-7 слов) название для резюме на основе его текста.
        Название должно отражать ключевую специализацию и уровень специалиста.
        
        Примеры хороших названий:
        - Senior Python Developer
        - Junior UI/UX Designer
        - Middle Frontend React Developer
        - DevOps Engineer (5 years)
        
        Вот текст резюме:
        {text}
        
        Верни только название, без кавычек и дополнительного текста.
        """

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "Ты - эксперт по резюме. Генерируешь короткие и точные названия для резюме."},
                        {"role": "user", "content": prompt.format(text=text[:1500])}  # Берем только начало текста
                    ],
                    temperature=0.3
                )
            )
            
            title = response.choices[0].message.content.strip()
            logger.info(f"Generated resume title: {title}")
            return title
        except Exception as e:
            logger.error(f"Error generating resume title: {str(e)}")
            return "Новое резюме"  # Дефолтное название в случае ошибки

    async def optimize_resume_with_tuner(
        self, 
        resume_text: str, 
        job_description_text: str, 
        use_rabbitmq: bool = True,
        tuned_resume_id: Optional[int] = None
    ) -> dict:
        """
        Отправляет резюме и описание вакансии в API resume-tuner для оптимизации
        
        Args:
            resume_text: Текст резюме
            job_description_text: Текст описания вакансии
            use_rabbitmq: Использовать ли RabbitMQ для асинхронной обработки
            tuned_resume_id: ID записи оптимизированного резюме в базе данных
            
        Returns:
            dict: Результат оптимизации или статус отправки в очередь
        """
        try:
            # Если используем RabbitMQ
            if use_rabbitmq:
                # Отправляем сообщение в очередь RabbitMQ
                success = rabbitmq_client.send_resume_optimization_request(
                    job_description=job_description_text,
                    resume=resume_text,
                    verbose=True,
                    tuned_resume_id=tuned_resume_id
                )
                
                if success:
                    return {
                        "status": "queued",
                        "message": "Запрос на оптимизацию резюме отправлен в очередь и будет обработан асинхронно"
                    }
                else:
                    # Если не удалось отправить в RabbitMQ, пробуем через HTTP
                    logger.warning("Не удалось отправить запрос в RabbitMQ, пробуем через HTTP API")
                    return await self._optimize_resume_with_http(resume_text, job_description_text)
            else:
                # Используем HTTP API
                return await self._optimize_resume_with_http(resume_text, job_description_text)
                
        except Exception as e:
            logger.error(f"Ошибка при оптимизации резюме: {str(e)}")
            raise Exception(f"Не удалось оптимизировать резюме: {str(e)}")
    
    async def _optimize_resume_with_http(self, resume_text: str, job_description_text: str) -> dict:
        """
        Отправляет резюме и описание вакансии в HTTP API resume-tuner для оптимизации
        
        Args:
            resume_text: Текст резюме
            job_description_text: Текст описания вакансии
            
        Returns:
            dict: Результат оптимизации
        """
        try:
            # Определяем URL сервера resume-tuner
            resume_tuner_url = os.getenv("RESUME_TUNER_URL", "http://resume-tuner:8001")
            
            # Подготавливаем данные для запроса
            data = {
                "resume": resume_text,
                "job_description": job_description_text
            }
            
            # Отправляем POST-запрос на сервер resume-tuner
            async with httpx.AsyncClient(timeout=120) as client:
                response = await client.post(
                    resume_tuner_url,
                    json=data,
                    headers={"Content-Type": "application/json"}
                )
                
                # Проверяем статус ответа
                if response.status_code == 200:
                    return response.json()
                else:
                    raise Exception(f"API resume-tuner вернул ошибку: {response.status_code}, {response.text}")
                
        except Exception as e:
            logger.error(f"Ошибка при HTTP-запросе к resume-tuner: {str(e)}")
            raise Exception(f"Не удалось оптимизировать резюме через HTTP API: {str(e)}")

openai_service = OpenAIService() 