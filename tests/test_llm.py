
from backend.agents.llm import get_llm


def main():
    print("Connecting to OpenRouter...")

    llm = get_llm()

    response = llm.invoke(
        "Explain a multi-hop AI agent in two sentences."
    )

    print("\nMODEL RESPONSE:")
    print(response.content)

    print("\nTOKEN USAGE:")
    print(response.usage_metadata)


if __name__ == "__main__":
    main()
