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


def test_toggle_task(client):
    response = client.get("/api/tasks")
    task = response.get_json()[0]
    assert not task["completed"]

    response = client.put(f"/api/tasks/{task['id']}")
    assert response.status_code == 200
    result = response.get_json()
    assert result["id"] == task["id"]
    assert result["completed"] in (1, True)

    # ensure persisted
    response2 = client.get("/api/tasks")
    assert response2.get_json()[0]["completed"] in (1, True)

