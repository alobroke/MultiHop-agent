
from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import (
    SentenceTransformerEmbeddingFunction,
)

BASE_DIR = Path(__file__).resolve().parent
DOCS_DIR = BASE_DIR / "data" / "documents"
DB_DIR = BASE_DIR / "data" / "chroma_db"

embedding_function = SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

client = chromadb.PersistentClient(path=str(DB_DIR))

collection = client.get_or_create_collection(
    name="research_documents",
    embedding_function=embedding_function,
)


def ingest_documents() -> int:
    """Index local .txt files. Re-running updates existing IDs."""
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    documents = []
    ids = []
    metadatas = []

    for path in DOCS_DIR.glob("*.txt"):
        text = path.read_text(encoding="utf-8").strip()

        if not text:
            continue

        # Simple character-based chunking with overlap.
        chunk_size = 1000
        overlap = 150

        for start in range(0, len(text), chunk_size - overlap):
            chunk = text[start:start + chunk_size].strip()

            if not chunk:
                continue

            chunk_id = f"{path.name}:{start}"

            documents.append(chunk)
            ids.append(chunk_id)
            metadatas.append({
                "source_name": path.name,
                "chunk_id": chunk_id,
                "source_type": "local",
            })

    if documents:
        collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
        )

    return len(documents)


def local_search(query: str, limit: int = 5) -> list[dict]:
    if collection.count() == 0:
        return []

    result = collection.query(
        query_texts=[query],
        n_results=min(limit, collection.count()),
    )

    records = []

    docs = result["documents"][0]
    ids = result["ids"][0]
    metas = result["metadatas"][0]

    for doc, record_id, metadata in zip(docs, ids, metas):
        records.append({
            "source_id": record_id,
            "source_type": "local",
            "source_name": metadata["source_name"],
            "chunk_id": metadata["chunk_id"],
            "url": None,
            "content": doc,
        })

    return records
