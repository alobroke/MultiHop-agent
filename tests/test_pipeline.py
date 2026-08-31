from search import web_search

results = web_search("today's temperature in Pune")

print("NUMBER OF RESULTS:", len(results))

for r in results:
    print("\nTITLE:", r["title"])
    print("URL:", r["url"])
    print("CONTENT:", r["content"][:500])