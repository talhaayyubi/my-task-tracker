import sqlite3
import importlib.util
from pathlib import Path
import pytest

# Load backend app module dynamically
APP_PATH = Path(__file__).resolve().parents[1] / "backend" / "app.py"
_spec = importlib.util.spec_from_file_location("backend_app", APP_PATH)
backend_app = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(backend_app)


@pytest.fixture()
def client(tmp_path):
    """Create a temporary empty database and Flask test client."""
    old_db = backend_app.DATABASE
    db_path = tmp_path / "tasks.db"

    conn = sqlite3.connect(db_path)
    conn.execute(
        """CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"""
    )
    conn.commit()
    conn.close()

    backend_app.DATABASE = str(db_path)
    backend_app.app.config["TESTING"] = True

    with backend_app.app.test_client() as test_client:
        yield test_client

    backend_app.DATABASE = old_db


def test_delete_task(client):
    """POST then DELETE a task and ensure tasks list is empty."""
    data = {"title": "task", "description": "desc"}
    response = client.post("/api/tasks", json=data)
    assert response.status_code == 201
    task_id = response.get_json()["id"]

    response = client.delete(f"/api/tasks/{task_id}")
    assert response.status_code == 204

    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert response.get_json() == []
