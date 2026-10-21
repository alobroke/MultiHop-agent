
from search import web_search

results = web_search("latest developments in AI")

print("NUMBER OF RESULTS:", len(results))

for result in results:
    print("\nTITLE:", result["source_name"])
    print("URL:", result["url"])
    print("SOURCE TYPE:", result["source_type"])
    print("CONTENT:", result["content"][:300])
