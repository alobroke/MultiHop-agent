# MultiHop-Agent

A lightweight multi-hop research agent that combines **Gemini**,
**Tavily web search**, and **ChromaDB** to gather evidence, assess its
strength, and generate answers with source references.

The goal is to go beyond a single web search: the agent can formulate a
query, retrieve local and web evidence, evaluate whether the available
evidence is sufficient, and try targeted searches when important
information is missing.

> **Important:** The critic's score is an LLM-generated
> evidence-confidence estimate, not a calibrated probability that an
> answer is true. Citations make claims easier to inspect, but do not
> guarantee that every claim is correct.

## Features

-   **Gemini-powered planning and answer generation** through Google's
    `google-genai` SDK.
-   **Web research** using Tavily.
-   **Local semantic search** using ChromaDB and Sentence Transformers.
-   **Evidence critic** that assesses relevance, source credibility,
    coverage, and conflicts.
-   **Bounded iterative retrieval** with a configurable maximum number
    of research rounds.
-   **Source-aware answers** that identify web URLs and local
    document/chunk IDs.
-   **Environment-based secrets** using a local `.env` file.

## System workflow

``` mermaid
flowchart TD
    A[User Query] --> B[Planner - Gemini]
    B --> C[Create Search Query]
    C --> D[Searcher]
    D --> E[ChromaDB Local Search]
    D --> F[Tavily Web Search]
    E --> G[Combine and Deduplicate Evidence]
    F --> G
    G --> H[Evidence Critic - Gemini]
    H --> I{Evidence Sufficient?}
    I -- No --> J{Rounds Remaining?}
    J -- Yes --> K[Identify Missing Evidence]
    K --> B
    J -- No --> L[Generate Cautious Answer]
    I -- Yes --> M[Answer Generator - Gemini]
    M --> N[Answer with Citations and Evidence Score]
    L --> N
```

### Workflow steps

1.  **User query:** The user submits a question.
2.  **Planner:** Gemini creates a concise search query. On later rounds,
    it can target the gaps identified by the critic.
3.  **Searcher:** The agent queries ChromaDB for relevant local chunks
    and Tavily for web results.
4.  **Evidence aggregation:** Results are normalized and deduplicated
    while preserving source metadata.
5.  **Evidence critic:** Gemini assesses how relevant, credible,
    consistent, and complete the evidence appears to be. It returns a
    score, reasoning, and missing information.
6.  **Retrieval decision:** If evidence is insufficient and rounds
    remain, the planner creates a targeted follow-up query. The loop is
    bounded to avoid endless searches.
7.  **Answer generation:** Gemini generates an answer grounded in the
    available evidence and is instructed to cite only supplied source
    identifiers/URLs.
8.  **Final response:** The system returns the answer, critic score,
    assessment, number of rounds, and source list. If evidence remains
    insufficient, the response should disclose that limitation.

## Architecture

``` text
MultiHop-agent/
├── main.py                 # CLI entry point
├── agent.py                # Orchestrates the research loop
├── planner.py              # Initial and follow-up query generation
├── search.py               # Tavily web search
├── chroma_store.py         # ChromaDB ingestion and local retrieval
├── critic.py               # Evidence assessment and confidence score
├── llm.py                  # Shared Gemini client and ask_llm()
├── requirements.txt        # Python dependencies
├── .env                    # API keys (never commit)
├── .gitignore
├── data/
│   ├── documents/          # Local source documents
│   └── chroma_db/          # Persistent ChromaDB data (generated)
└── tests/
    ├── test_llm.py
    ├── test_search.py
    └── test_critic.py
```

The exact test files may differ depending on which tests have been
created in your local repository.

## Requirements

-   Python 3.10 or newer recommended.
-   A Gemini API key.
-   A Tavily API key for web retrieval.
-   Internet access for API requests and initial embedding-model
    download.

## Setup

### 1. Create and activate a virtual environment

Windows PowerShell:

``` powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

Create or update `requirements.txt` with:

``` text
google-genai
python-dotenv
tavily-python
chromadb
sentence-transformers
```

Then install:

``` powershell
python -m pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

``` dotenv
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
TAVILY_API_KEY=your_tavily_api_key
```

Use a model name that is currently available to your Gemini API key.
Never commit `.env` or paste API keys into source files.

### 4. Add local documents

Place supported `.txt` files in:

``` text
data/documents/
```

The current `chroma_store.py` implementation reads `.txt` files. If you
have uploaded PDFs or DOCX files, they will not be indexed until
PDF/DOCX text extraction is implemented. Research papers can be
converted to text for the current prototype.

Example:

``` text
data/documents/
├── react_agents.txt
├── retrieval_augmented_generation.txt
├── hallucination_notes.txt
└── chromadb_notes.txt
```

### 5. Run the application

From the repository root:

``` powershell
python main.py
```

The first ingestion run creates the local ChromaDB store and indexes
document chunks. Subsequent runs reuse the persistent store and update
records for the same chunk IDs.

## Testing

Run tests from the project root as modules, for example:

``` powershell
python -m tests.test_llm
python -m tests.test_search
```

If those modules do not exist or are named differently in your checkout,
use the test files that are present. A simple local retrieval smoke test
is:

``` powershell
python -c "from chroma_store import ingest_documents, local_search; print('Indexed chunks:', ingest_documents()); print(local_search('What is retrieval augmented generation?', limit=3))"
```

Then run `python main.py` and try both: - A question answerable from the
local documents. - A question requiring fresh or missing information
from the web.

## Example questions

-   What is an AI agent, and how does it use tools?
-   How does retrieval-augmented generation reduce some hallucinations?
-   What are the limitations of asking an LLM to verify its own answer?
-   Compare ReAct-style tool use with multi-hop research.

## Evidence scoring and limitations

The critic evaluates the **evidence supplied to it**, not an objective
ground truth. A high score can still be wrong because:

-   the source itself may be incorrect or outdated;
-   several pages may repeat the same original claim rather than
    independently corroborate it;
-   the model may overlook contradictions or misjudge source quality;
-   retrieved text may be incomplete or irrelevant;
-   the answer generator may misinterpret evidence or attach an
    incorrect citation.

For these reasons, the score should be presented as an
**evidence-confidence score**. If evidence is weak or conflicting, the
system should state what remains unverified rather than presenting
uncertainty as fact.

### Prompt-injection considerations

Retrieved documents and webpages are **untrusted data**. A page may
contain text intended to manipulate the model, such as instructions to
ignore its system prompt or reveal secrets. The agent should:

-   explicitly tell the planner, critic, and answer generator to treat
    retrieved content as data, not instructions;
-   never execute commands or follow tool instructions found in
    retrieved pages;
-   keep API keys out of prompts and retrieved context;
-   validate structured critic output before using it to control the
    workflow;
-   restrict final citations to sources actually retrieved by the
    system.

Prompt instructions are helpful but not a complete security boundary.
Treating source content as untrusted must be reinforced by
application-level controls.

## Current scope

This is a prototype, not a guarantee of factual correctness. The current
design uses a pre-answer evidence critic and a bounded retrieval loop. A
separate post-answer citation-checking critic would be a useful next
improvement: it would check each generated claim against its cited
passage before the response is displayed.

Other possible future improvements include PDF/DOCX ingestion, tests for
citation mismatches, source-domain policies, and explicit detection of
contradictory claims.

## License

Add the license that applies to this project before distributing it.
