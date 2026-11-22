import hashlib
from functools import lru_cache
from pathlib import Path

import chromadb
import pymupdf
from chromadb.utils.embedding_functions import (
    SentenceTransformerEmbeddingFunction,
)
from tavily import TavilyClient

from backend.config import get_settings

ROOT = Path(__file__).resolve().parents[2]
DOCS_DIR = ROOT / "data" / "documents"
DB_DIR = ROOT / "data" / "chroma_db"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150


@lru_cache(maxsize=1)
def get_collection():
    DB_DIR.mkdir(parents=True, exist_ok=True)

    embeddings = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

    client = chromadb.PersistentClient(path=str(DB_DIR))

    return client.get_or_create_collection(
        name="multihop_documents",
        embedding_function=embeddings,
    )


def split_text(text: str):
    """Split text into overlapping chunks."""
    step = CHUNK_SIZE - CHUNK_OVERLAP

    for start in range(0, len(text), step):
        chunk = text[start : start + CHUNK_SIZE].strip()

        if chunk:
            yield chunk


def read_document(path: Path):
    """Yield text with its original page number."""
    if path.suffix.lower() == ".pdf":
        with pymupdf.open(str(path)) as pdf:
            for page_num, page in enumerate(pdf, start=1):
                text = page.get_text("text").strip()

                if text:
                    yield page_num, text

    elif path.suffix.lower() == ".txt":
        text = path.read_text(encoding="utf-8").strip()

        if text:
            yield 1, text


def ingest_documents():
    """Index PDF/TXT files into persistent ChromaDB."""
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    collection = get_collection()
    total = 0

    paths = sorted(
        p
        for p in DOCS_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in {".pdf", ".txt"}
    )

    for path in paths:
        file_hash = hashlib.sha256(path.read_bytes()).hexdigest()

        # Skip unchanged documents.
        existing = collection.get(
            where={"source_name": path.name}, limit=1, include=["metadatas"]
        )

        if existing["ids"]:
            metadata = existing["metadatas"][0]

            if metadata.get("file_hash") == file_hash:
                print(f"[SKIP] {path.name}")
                continue

            # Remove outdated chunks before reindexing.
            collection.delete(where={"source_name": path.name})

        ids = []
        documents = []
        metadatas = []

        for page_num, text in read_document(path):
            for index, chunk in enumerate(split_text(text)):
                raw_id = f"{path.name}:{page_num}:{index}:{file_hash}"

                chunk_id = hashlib.sha256(raw_id.encode()).hexdigest()

                ids.append(chunk_id)
                documents.append(chunk)

                metadatas.append(
                    {
                        "source_name": path.name,
                        "page": page_num,
                        "source_type": "local",
                        "file_hash": file_hash,
                    }
                )

        # Small batches avoid oversized Chroma requests.
        for start in range(0, len(ids), 100):
            end = start + 100

            collection.upsert(
                ids=ids[start:end],
                documents=documents[start:end],
                metadatas=metadatas[start:end],
            )

        print(f"[INDEXED] {path.name}: {len(ids)} chunks")
        total += len(ids)

    return total


def local_search(query: str, limit: int = 3):
    """Retrieve relevant PDF/text passages."""
    collection = get_collection()

    count = collection.count()

    if count == 0:
        return []

    result = collection.query(
        query_texts=[query],
        n_results=min(limit, count),
        include=["documents", "metadatas", "distances"],
    )

    evidence = []

    for doc, meta, record_id in zip(
        result["documents"][0], result["metadatas"][0], result["ids"][0]
    ):
        evidence.append(
            {
                "source_id": record_id,
                "source_type": "local",
                "source_name": meta["source_name"],
                "page": meta["page"],
                "url": None,
                "content": doc,
            }
        )

    return evidence


def web_search(query: str, limit: int = 3):
    """Retrieve web evidence using Tavily."""
    settings = get_settings()

    if not settings.TAVILY_API_KEY.strip():
        print("[WEB] Tavily key missing, skipping web search")
        return []

    client = TavilyClient(api_key=settings.TAVILY_API_KEY.strip())

    response = client.search(
        query=query,
        search_depth="basic",
        max_results=limit,
    )

    evidence = []

    for item in response.get("results", []):
        evidence.append(
            {
                "source_id": item.get("url", ""),
                "source_type": "web",
                "source_name": item.get("title", "Untitled"),
                "page": None,
                "url": item.get("url"),
                "content": item.get("content", ""),
            }
        )

    return evidence



def retrieve_evidence(
    query: str,
    force_web: bool = False,
    include_web: bool = False,
):
    """
    Retrieval strategy:

    Attempt 1:
        Search local documents first.
        If no results, search Tavily.

    Follow-up attempts:
        Force Tavily web search to fill evidence gaps.
    """

    results = []
    errors = []

    # STEP 1: Search local documents
    if not force_web:
        try:
            local_results = local_search(query, limit=6)

            print(
                f"[CHROMADB] Retrieved "
                f"{len(local_results)} passages"
            )

            results.extend(local_results)

        except Exception as exc:# noqa: BLE001
            errors.append(f"ChromaDB: {exc}")
            print(f"[LOCAL ERROR] {type(exc).__name__}")

    # STEP 2: Web fallback
    if force_web or include_web or not results:
        print("[TAVILY] Starting web search...")

        try:
            web_results = web_search(query, limit=5)

            print(
                f"[TAVILY] Retrieved "
                f"{len(web_results)} results"
            )

            results.extend(web_results)

        except Exception as exc:# noqa: BLE001
            errors.append(f"Tavily: {exc}")
            print(f"[WEB ERROR] {type(exc).__name__}")

    # STEP 3: Remove duplicates
    unique = []
    seen = set()

    for source in results:
        key = (
            source.get("source_type"),
            source.get("source_id"),
        )

        if key in seen:
            continue

        if not source.get("content", "").strip():
            continue

        seen.add(key)
        unique.append(source)

    if not unique and errors:
        raise RuntimeError(
            "Retrieval failed: " + "; ".join(errors)
        )

    print(
        f"[RETRIEVAL] Total usable sources: {len(unique)}"
    )

    return unique
