
import os

from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

API_KEY = os.getenv("TAVILY_API_KEY")

if not API_KEY:
    raise ValueError("TAVILY_API_KEY is missing from .env")

tavily = TavilyClient(api_key=API_KEY)


def web_search(query: str) -> list[dict]:
    response = tavily.search(
        query=query,
        max_results=5,
    )

    results = []

    for item in response.get("results", []):
        results.append({
            "source_id": item.get("url", ""),
            "source_type": "web",
            "source_name": item.get("title", "Untitled"),
            "url": item.get("url", ""),
            "content": item.get("content", ""),
        })

    return results
