from search import web_search

results = web_search("latest developments in AI")

for result in results:
    print("\nTITLE:", result["title"])
    print("URL:", result["url"])
    print("CONTENT:", result["content"][:300])