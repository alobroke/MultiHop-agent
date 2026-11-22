
from unittest.mock import patch

from backend.agents.planner import ResearchPlan
from backend.graph import research_graph


def fake_plan(query):
    return ResearchPlan.model_validate({
        "original_query": query,
        "subqueries": [
            {
                "id": "SQ1",
                "question": "Who introduced ReAct?",
                "depends_on": []
            },
            {
                "id": "SQ2",
                "question": "What limitations motivated ReAct?",
                "depends_on": []
            },
            {
                "id": "SQ3",
                "question": "Compare ReAct and RAG using previous findings",
                "depends_on": ["SQ1", "SQ2"]
            }
        ]
    })


def main():
    initial_state = {
        "query": "Explain ReAct and compare it with RAG",
        "hops": [],
        "current_hop": None,
        "findings": {},
        "answer": "",
        "error": None
    }

    execution_order = []
    final_state = None

    with patch("backend.graph.create_plan", side_effect=fake_plan):

        print("\n========== LANGGRAPH EXECUTION ==========")

        for event in research_graph.stream(
            initial_state,
            stream_mode="updates"
        ):
            for node_name, update in event.items():
                print(f"\n[GRAPH NODE] {node_name}")

                if node_name == "executor":
                    hop_id = update["current_hop"]
                    if hop_id is not None:
                        execution_order.append(hop_id)

        print("\nExecution order:", execution_order)

        assert execution_order == ["SQ1", "SQ2", "SQ3"]

        # Run a fresh invocation to inspect final state.
        final_state = research_graph.invoke(initial_state)

    assert all(
        hop["status"] == "completed"
        for hop in final_state["hops"]
    )

    assert set(final_state["findings"]) == {
        "SQ1", "SQ2", "SQ3"
    }

    print("\n========== FINAL RESULT ==========")
    print(final_state["answer"])

    print("\nALL GRAPH TESTS PASSED")


if __name__ == "__main__":
    main()
