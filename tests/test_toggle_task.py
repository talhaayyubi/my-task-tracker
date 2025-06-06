import sqlite3
import importlib.util
from pathlib import Path
import pytest

APP_PATH = Path(__file__).resolve().parents[1] / "backend" / "app.py"
_spec = importlib.util.spec_from_file_location("backend_app", APP_PATH)
backend_app = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(backend_app)


@pytest.fixture()
def client(tmp_path):
    """Create a temporary db with one task and return Flask test client."""
    old_db = backend_app.DATABASE
    db_path = tmp_path / "tasks.db"

    conn = sqlite3.connect(db_path)
    conn.execute(
        """CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            due_date TEXT,
            priority INTEGER
        )"""
    )
    # insert one task
    conn.execute(
        "INSERT INTO tasks (title, description, completed, due_date, priority) VALUES (?, ?, ?, ?, ?)",
        ("task", "desc", False, None, None),
    )
    conn.commit()
    conn.close()

    backend_app.DATABASE = str(db_path)
    backend_app.app.config["TESTING"] = True

    with backend_app.app.test_client() as test_client:
        yield test_client

    backend_app.DATABASE = old_db


def test_toggle_task_updates_db(client):
    # task id is 1 from inserted row
    response = client.put("/api/tasks/1")
    assert response.status_code == 200

    conn = sqlite3.connect(backend_app.DATABASE)
    row = conn.execute("SELECT completed FROM tasks WHERE id = 1").fetchone()
    conn.close()
    assert row is not None
    assert row[0] in (1, True)
