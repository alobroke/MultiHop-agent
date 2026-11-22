from typing import Literal, TypedDict

HopStatus = Literal["pending", "running", "completed", "blocked", "unresolved"]


class Hop(TypedDict):
    id: str
    question: str
    depends_on: list[str]
    status: HopStatus
    finding: str


class AgentState(TypedDict):
    query: str
    memory_context: str
    hops: list[Hop]
    current_hop: str | None

    # Research
    findings: dict[str, str]
    evidence: dict[str, list[dict]]

    # Critic and adaptive search
    attempts: dict[str, int]
    search_queries: dict[str, str]
    critic_results: dict[str, dict]
    critic_history: dict[str, list[dict]]

    # Synthesis and verification
    draft_answer: str
    verification: dict
    verification_history: list[dict]
    verification_rounds: int

    # Final output
    answer: str
    error: str | None
