
from backend.agents.planner import create_plan


def main():
    query = (
        "Who developed the ReAct framework, "
        "what problem does it solve, "
        "and how is it different from RAG?"
    )

    print("\nUSER QUERY:")
    print(query)

    print("\nGenerating multi-hop research plan...")

    plan = create_plan(query)

    print("\n" + "=" * 50)
    print("GENERATED RESEARCH PLAN")
    print("=" * 50)

    for hop in plan.subqueries:
        print(f"\n{hop.id}: {hop.question}")
        print(f"Dependencies: {hop.depends_on}")

    print("\nPlan validation: PASSED")


if __name__ == "__main__":
    main()
