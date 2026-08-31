from llm import ask_llm
from search import web_search


def research(question):

  
    search_query = ask_llm(
        f"""
Generate ONE web search query for this question.

Question: {question}

Return ONLY the search query.
"""
    ).strip()

    print("\n🔎 Search Query:", search_query)

    
    results = web_search(search_query)

    print(" Sources Found:", len(results))

    
    context = "\n\n".join(
        f"TITLE: {r['title']}\n"
        f"URL: {r['url']}\n"
        f"CONTENT: {r['content']}"
        for r in results
    )

   
    prompt = f"""
Answer the following question using the research results.

QUESTION:
{question}

RESEARCH RESULTS:
{context}

Give a clear factual answer.
At the end, list the source URLs you used.
"""

    print("\nGenerating final answer...")

    answer = ask_llm(prompt)

    return answer