from functools import lru_cache

from langchain_openai import ChatOpenAI

from backend.config import get_settings


@lru_cache
def get_llm():
    settings = get_settings()

    key = settings.OPENROUTER_API_KEY.strip()

    if not key:
        raise ValueError("OPENROUTER_API_KEY is missing")

    return ChatOpenAI(
        model=settings.OPENROUTER_MODEL,
        api_key=key,
        base_url="https://openrouter.ai/api/v1",
        temperature=0,
        max_tokens=4096,
        timeout=90,
        max_retries=1,
    )
