import json
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "multihop.db"


def now():
    return datetime.now(UTC).isoformat()


@contextmanager
def get_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row

    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS research_runs (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT,
                status TEXT NOT NULL,
                verification_json TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES sessions(id)
            )
        """)

        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_runs_session
            ON research_runs(session_id, created_at)
        """)


def create_session(title: str = "New Research") -> dict:
    session_id = uuid4().hex
    timestamp = now()

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO sessions
            (id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            """,
            (session_id, title, timestamp, timestamp),
        )

    return {"id": session_id, "title": title, "created_at": timestamp}


def get_session(session_id: str):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM sessions WHERE id = ?", (session_id,)
        ).fetchone()

    return dict(row) if row else None


def list_sessions():
    with get_db() as conn:
        rows = conn.execute("""
            SELECT * FROM sessions
            ORDER BY updated_at DESC
        """).fetchall()

    return [dict(row) for row in rows]


def create_run(session_id: str, question: str) -> str:
    run_id = uuid4().hex

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO research_runs
            (id, session_id, question, status, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (run_id, session_id, question, "running", now()),
        )

        conn.execute(
            "UPDATE sessions SET updated_at = ? WHERE id = ?", (now(), session_id)
        )

    return run_id


def complete_run(run_id: str, result: dict):
    with get_db() as conn:
        conn.execute(
            """
            UPDATE research_runs
            SET answer = ?,
                verification_json = ?,
                status = ?
            WHERE id = ?
            """,
            (
                result.get("answer", ""),
                json.dumps(result.get("verification", {}), ensure_ascii=False),
                "completed",
                run_id,
            ),
        )


def fail_run(run_id: str, error: str):
    with get_db() as conn:
        conn.execute(
            """
            UPDATE research_runs
            SET status = ?, answer = ?
            WHERE id = ?
            """,
            ("failed", error, run_id),
        )


def get_run(run_id: str):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM research_runs WHERE id = ?", (run_id,)
        ).fetchone()

    if not row:
        return None

    result = dict(row)
    result["verification"] = json.loads(result.pop("verification_json") or "{}")
    return result


def get_session_runs(session_id: str):
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, session_id, question, answer,
                   status, created_at
            FROM research_runs
            WHERE session_id = ?
            ORDER BY created_at DESC
            """,
            (session_id,),
        ).fetchall()

    return [dict(row) for row in rows]


def get_memory_context(session_id: str, limit: int = 3) -> str:
    """
    Retrieve recent successful question-answer pairs
    from the same research session.
    """
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT question, answer
            FROM research_runs
            WHERE session_id = ?
              AND status = 'completed'
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (session_id, limit),
        ).fetchall()

    if not rows:
        return ""

    entries = []

    # Chronological order for conversation context.
    for row in reversed(rows):
        entries.append(
            {"question": row["question"], "answer": (row["answer"] or "")[:1200]}
        )

    return json.dumps(entries, ensure_ascii=False)
