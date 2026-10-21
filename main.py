
from agent import research
from chroma_store import ingest_documents


def main():
    chunks = ingest_documents()
    print(f"Indexed {chunks} local document chunks.")

    question = input("\nAsk your research question: ").strip()

    if not question:
        print("Please enter a question.")
        return

    result = research(question)

    print("\n" + "=" * 60)
    print("FINAL ANSWER")
    print("=" * 60)
    print(result["answer"])

    print(f"\nEvidence confidence score: {result['truth_score']}/100")
    print(f"Evidence sufficient: {result['evidence_sufficient']}")
    print(f"Research rounds: {result['rounds_used']}")
    print(f"Critic assessment: {result['critic_reason']}")

    if result["missing_evidence"]:
        print("Unresolved evidence gaps:", result["missing_evidence"])

    print("\nSOURCES")
    for source in result["sources"]:
        print(f"- [{source['source_type']}] {source['source_name']}")
        if source["url"]:
            print(f"  URL: {source['url']}")
        else:
            print(f"  Chunk ID: {source['source_id']}")


if __name__ == "__main__":
    main()
