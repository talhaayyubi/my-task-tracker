from flask import Flask, jsonify
import sqlite3
import os

app = Flask(__name__)

DATABASE = os.path.join(os.path.dirname(__file__), "tasks.db")


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Return all tasks as JSON."""
    try:
        conn = get_db_connection()
        rows = conn.execute(
            'SELECT id, title, description, completed, created_at FROM tasks'
        ).fetchall()
        conn.close()
        tasks = [dict(row) for row in rows]
        return jsonify(tasks)
    except sqlite3.Error as exc:
        app.logger.error('Database error: %s', exc)
        return jsonify({'error': 'Database error'}), 500


if __name__ == '__main__':
    app.run()
