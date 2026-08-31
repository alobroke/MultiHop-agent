import os
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

tavily = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)


def web_search(query):
    response = tavily.search(
        query=query,
        max_results=5
    )

    return response["results"]