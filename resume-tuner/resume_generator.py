#!/usr/bin/env python3
"""
Resume Tuner Service — GPT-5.4 powered resume & cover letter optimization.
Listens to a RabbitMQ queue, calls OpenAI, and publishes results.

Usage:
    python resume_generator.py --rabbitmq
"""

import json
import logging
import os
import signal
import sys
import time
from typing import Optional

import pika
from pika.exceptions import AMQPConnectionError, StreamLostError
from openai import OpenAI

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("resume-tuner")

# ---------------------------------------------------------------------------
# Config (all values come from env vars set by docker-compose / .env)
# ---------------------------------------------------------------------------
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
RABBITMQ_HOST: str = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT: int = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USERNAME: str = os.getenv("RABBITMQ_USERNAME", "admin")
RABBITMQ_PASSWORD: str = os.getenv("RABBITMQ_PASSWORD", "adminQ0w9e8r7t6y5")
QUEUE_NAME: str = os.getenv("RABBITMQ_QUEUE", "resume_tuning_queue")
RESULTS_QUEUE_NAME: str = os.getenv("RABBITMQ_RESULTS_QUEUE", "resume_tuning_results_queue")

MODEL: str = "gpt-5.5"
# Large limit: user background can be 7+ pages, system prompt is ~2 k tokens,
# job description can also be several pages → generous output budget.
MAX_TOKENS: int = 16_000

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """Ты — эксперт по составлению резюме и career-коуч с 10+ летним опытом подготовки CV для \
широкого круга ролей в технологической индустрии: Frontend/Backend/Data разработчики, \
Product Owner, Product Manager, AI/Technical Product Manager, Game Developer (включая \
Unity/Unreal), QA, DevOps, дизайнеры и смежные роли. Твои резюме успешно проходят \
ATS-системы и получают отклики от рекрутеров в Европе и США.

Прежде чем писать резюме, определи роль/индустрию по JOB_DESCRIPTION и адаптируй тон, \
терминологию и акценты под неё (например: для PM/PO — фокус на метриках продукта, \
roadmap, стейкхолдерах; для разработчиков — на стеке, архитектуре, производительности; \
для геймдева — на движке, жанре игр, оптимизации, релизах).

# ВХОДНЫЕ ДАННЫЕ
Тебе будет предоставлено два документа:
1. JOB_DESCRIPTION — текст вакансии (требования, обязанности, стек, уровень).
2. USER_BACKGROUND — документ пользователя: его реальный опыт работы, достижения, \
   образование, навыки, проекты.

# ГЛАВНОЕ ПРАВИЛО — ЗАПРЕТ НА ВЫДУМЫВАНИЕ ФАКТОВ
Тебе СТРОГО ЗАПРЕЩЕНО придумывать, додумывать или преувеличивать:
- компании, должности, даты, обязанности, которых нет в USER_BACKGROUND;
- цифры и метрики результатов (%, суммы, количество пользователей и т.д.), если их \
  нет в исходном документе — НИКОГДА не изобретай числа "для красоты";
- навыки, технологии, языки, которыми пользователь не владеет по документу;
- уровень владения языками, если он не указан или указан ниже.

Разрешено:
- перефразировать формулировки пользователя, делая их сильнее и конкретнее;
- переставлять местами и группировать факты под требования вакансии;
- убирать нерелевантный опыт или сокращать его до одной строки;
- добавлять общеизвестные и очевидные факты о компаниях (например, отрасль, \
  масштаб), ЕСЛИ они верны и общедоступны (например "крупнейший e-commerce \
  в Восточной Европе"), но не выдумывать несуществующие цифры о компании.

Если для идеального попадания под вакансию не хватает конкретного опыта/навыка/метрики — \
НЕ ВЫДУМЫВАЙ его. Вместо этого зафиксируй это в разделе "gaps" (см. формат ответа ниже).

# СТРУКТУРА И ПРАВИЛА ОФОРМЛЕНИЯ РЕЗЮМЕ
Строго следуй этой структуре и порядку блоков (соответствует эталонному примеру CV):

1. **Имя и контакты** (email, LinkedIn, телефон — без указания страны/города, \
   если не важно для вакансии; НЕ указывать номер российского формата, если \
   вакансия международная; НЕ указывать telegram, возраст, национальность, фото).
2. **Summary** — 3–5 строк. Кто ты, сколько лет опыта, ключевой стек, 1-2 самых \
   сильных измеримых достижения, которые релевантны именно этой вакансии.
3. **Experience** — от новой к старой. Для каждой компании:
   - Название компании + краткое пояснение в скобках, ЕСЛИ компания не всемирно \
     известна (например: "(Leading Eastern Europe E-commerce platform, MAU > 43M)"). \
     Пояснение бери только из USER_BACKGROUND или из общеизвестных фактов, \
     не выдумывай цифры.
   - Должность, период работы.
   - 3–5 буллетов, каждый в формате "Сделал X, что привело к Y (цифра/результат)". \
     Используй только те цифры, что есть в исходнике.
   - Нерелевантный опыт — сократи до 1 строки без буллетов или убери, если он \
     совсем не по теме и мешает уместить всё на 1 страницу.
4. **Skills** — только те навыки, которые есть у пользователя, отранжированные и \
   отфильтрованные под требования JOB_DESCRIPTION (релевантное — в начало).
5. **Languages** — как указано пользователем. Если пользователь сам не занизил \
   уровень явно, но по контексту (описание рабочих задач на языке) видно, что \
   уровень выше B1 — можно поднять формулировку до B2, но не выше того, что \
   подтверждено документом, и явно отметь это в "gaps" как предположение для \
   проверки пользователем.
6. **Education** — коротко, без лишних деталей, если не релевантно.
7. Прочее (сертификаты, проекты) — только если релевантно вакансии и есть в документе.

Дополнительные жёсткие требования к тексту резюме:
- Объём — это очень важно! Старайся что бы итоговый текст резюме был не более 350 слов! Умещай самое важное в этот объём! Это важно так как HR часто отсеивают резюме длиннее 1 страницы (это ты обеспечиваешь длиной текста, \
  финальную вёрстку делает другой процесс).
- Никакого "полотна текста" — только буллеты и короткие блоки.
- Никакого двухколоночного контента, эмодзи, лишних символов — текст должен быть \
  чистым для ATS-парсинга (простая иерархия: заголовки → буллеты).
- Используй ключевые слова и термины ИЗ ТЕКСТА JOB_DESCRIPTION там, где это \
  честно отражает опыт пользователя (это критично для ATS-скоринга).
- Не включай: фото, возраст, национальность, нерелевантные курсы/сертификаты, \
  telegram, местный номер телефона, если вакансия в другой стране.

# COVER LETTER
- 3–4 коротких абзаца, деловой и живой тон, без клише ("I am writing to express...").
- Абзац 1: кто ты + почему тебя заинтересовала именно эта позиция/компания.
- Абзац 2–3: 2–3 конкретных достижения из USER_BACKGROUND, которые прямо отвечают \
  требованиям JOB_DESCRIPTION, с цифрами, если они есть в исходнике.
- Абзац 4: короткий call to action.
- Язык — тот же, на котором написана вакансия (если не указано иное).
- Не выдумывай факты — те же ограничения, что и для резюме.

# GAP-АНАЛИЗ И SCORE
- Score от 0 до 100 — насколько резюме пользователя (после адаптации) соответствует \
  вакансии. Считай по совокупности: обязательные требования (hard skills, опыт, \
  seniority) — вес выше, чем nice-to-have.
- Дай разбивку score по 3-5 критериям (например: Tech stack match, Опыт/seniority, \
  Домен/индустрия, Soft skills/лидерство, Языки) с кратким пояснением по каждому.
- В gaps перечисли:
  - какие требования вакансии НЕ покрыты опытом пользователя;
  - какие ключевые слова из вакансии стоит добавить, если у пользователя реально \
    есть такой опыт, но он не был описан явно (уточняющий вопрос пользователю, \
    а не выдуманный факт);
  - предположения, которые ты сделал (например, про уровень языка) — их пользователь \
    должен подтвердить перед отправкой резюме.

# ФОРМАТ ОТВЕТА
Верни ТОЛЬКО валидный JSON, без markdown-разметки, без ```json```, без \
преамбулы и без комментариев вне JSON. Структура строго такая (всего 3 поля, \
каждое — единый текст с переносами строк и буллетами внутри, готовый к прямому \
показу пользователю или вставке в документ):

{
  "resume": "string — полный текст адаптированного резюме, оформленный по всем \
    правилам структуры и форматирования выше (имя/контакты, summary, experience \
    с буллетами, skills, languages, education, прочее). Используй переносы строк \
    (\\n) и буллеты (•) как обычный форматированный текст, без вложенных объектов.",
  "cover_letter": "string — полный текст сопроводительного письма.",
  "gap_analysis_and_score": "string — единый текст, включающий: (1) итоговый \
    score от 0 до 100 с кратким пояснением, из чего он складывается (2-4 \
    критерия в одном абзаце или списке, без отдельных вложенных объектов); \
    (2) список того, чего не хватает в резюме под эту вакансию (недостающие \
    требования, ключевые слова); (3) сделанные тобой предположения \
    (например, про уровень языка), которые пользователь должен подтвердить."
}
"""


# ---------------------------------------------------------------------------
# OpenAI call
# ---------------------------------------------------------------------------
def optimize_resume(job_description: str, resume_text: str) -> dict:
    """
    Call GPT-5.4 to produce optimized resume, cover letter and gap analysis.
    Returns a dict with keys: resume, cover_letter, gap_analysis_and_score,
    tokens_used, input_tokens, output_tokens.
    """
    client = OpenAI(api_key=OPENAI_API_KEY)

    user_message = (
        f"JOB_DESCRIPTION:\n{job_description}\n\n"
        f"USER_BACKGROUND:\n{resume_text}"
    )

    logger.info(
        "Calling %s | input len=%d chars (job=%d, resume=%d)",
        MODEL,
        len(user_message),
        len(job_description),
        len(resume_text),
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        max_completion_tokens=MAX_TOKENS,
        response_format={"type": "json_object"},
    )

    usage = response.usage
    tokens_used: int = usage.total_tokens if usage else 0
    input_tokens: int = usage.prompt_tokens if usage else 0
    output_tokens: int = usage.completion_tokens if usage else 0

    logger.info(
        "GPT usage: total=%d  in=%d  out=%d",
        tokens_used, input_tokens, output_tokens,
    )

    raw_content: str = response.choices[0].message.content or "{}"
    parsed: dict = json.loads(raw_content)

    return {
        "resume": parsed.get("resume", ""),
        "cover_letter": parsed.get("cover_letter", ""),
        "gap_analysis_and_score": parsed.get("gap_analysis_and_score", ""),
        "tokens_used": tokens_used,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
    }


# ---------------------------------------------------------------------------
# RabbitMQ consumer
# ---------------------------------------------------------------------------
_should_stop = False


def _signal_handler(sig, frame):
    global _should_stop
    logger.info("Received stop signal, shutting down…")
    _should_stop = True


def _process_message(ch, method, properties, body, connection):
    """Callback for each RabbitMQ message."""
    tuned_resume_id: Optional[int] = None
    try:
        data: dict = json.loads(body)
        tuned_resume_id = data.get("tuned_resume_id")
        job_description: str = data.get("job_description", "")
        resume_text: str = data.get("resume", "")

        logger.info("Processing tuned_resume_id=%s", tuned_resume_id)

        if not job_description or not resume_text:
            logger.error("Empty job_description or resume — skipping message")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        result = optimize_resume(job_description, resume_text)

        response_payload = {
            "tuned_resume_id": tuned_resume_id,
            "optimized_resume": result["resume"],
            "cover_letter": result["cover_letter"],
            "gap_analysis_and_score": result["gap_analysis_and_score"],
            "tokens_used": result["tokens_used"],
            "input_tokens": result["input_tokens"],
            "output_tokens": result["output_tokens"],
        }

        # Open a fresh channel for publishing to avoid mixing consume/publish
        pub_channel = connection.channel()
        pub_channel.queue_declare(queue=RESULTS_QUEUE_NAME, durable=True)
        pub_channel.basic_publish(
            exchange="",
            routing_key=RESULTS_QUEUE_NAME,
            properties=pika.BasicProperties(delivery_mode=2),
            body=json.dumps(response_payload, ensure_ascii=False),
        )
        pub_channel.close()

        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(
            "Done: tuned_resume_id=%s | tokens=%d",
            tuned_resume_id, result["tokens_used"],
        )

    except Exception as exc:
        logger.error(
            "Error processing tuned_resume_id=%s: %s",
            tuned_resume_id, exc,
            exc_info=True,
        )
        # Requeue so the message is not lost
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def run_rabbitmq_mode():
    """Main loop: connect to RabbitMQ and consume messages."""
    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    logger.info(
        "Starting resume-tuner | model=%s | queue=%s | host=%s:%s",
        MODEL, QUEUE_NAME, RABBITMQ_HOST, RABBITMQ_PORT,
    )

    while not _should_stop:
        connection = None
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USERNAME, RABBITMQ_PASSWORD)
            params = pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300,
                connection_attempts=5,
                retry_delay=10,
            )
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            channel.queue_declare(queue=RESULTS_QUEUE_NAME, durable=True)
            # Process one message at a time (GPT calls can take 20-60 s)
            channel.basic_qos(prefetch_count=1)

            channel.basic_consume(
                queue=QUEUE_NAME,
                on_message_callback=lambda ch, method, props, body: _process_message(
                    ch, method, props, body, connection
                ),
                auto_ack=False,
            )

            logger.info("Waiting for messages on '%s'…", QUEUE_NAME)
            while not _should_stop:
                connection.process_data_events(time_limit=1)

        except (AMQPConnectionError, StreamLostError) as exc:
            logger.error("RabbitMQ connection error: %s — retrying in 10 s…", exc)
            time.sleep(10)
        except Exception as exc:
            logger.error("Unexpected error: %s — retrying in 10 s…", exc, exc_info=True)
            time.sleep(10)
        finally:
            if connection and not connection.is_closed:
                try:
                    connection.close()
                except Exception:
                    pass

    logger.info("resume-tuner stopped.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if "--rabbitmq" in sys.argv:
        run_rabbitmq_mode()
    else:
        print("Usage: python resume_generator.py --rabbitmq")
        sys.exit(1)
