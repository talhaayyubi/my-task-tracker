from flask import Flask, jsonify, request
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
            'SELECT id, title, description, completed, due_date, priority, created_at FROM tasks'
        ).fetchall()
        conn.close()
        tasks = [dict(row) for row in rows]
        return jsonify(tasks)
    except sqlite3.Error as exc:
        app.logger.error('Database error: %s', exc)
        return jsonify({'error': 'Database error'}), 500


@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task and return it as JSON."""
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    description = data.get('description')
    due_date = data.get('due_date')
    priority = data.get('priority')

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.execute(
            'INSERT INTO tasks (title, description, completed, due_date, priority) VALUES (?, ?, ?, ?, ?)',
            (title, description, False, due_date, priority),
        )
        conn.commit()
        task_id = cursor.lastrowid
        row = conn.execute(
            'SELECT id, title, description, completed, due_date, priority, created_at FROM tasks WHERE id = ?',
            (task_id,),
        ).fetchone()
        conn.close()
        return jsonify(dict(row)), 201
    except sqlite3.Error as exc:
        app.logger.error('Database error: %s', exc)
        return jsonify({'error': 'Database error'}), 500


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def toggle_task(task_id):
    """Toggle a task's completed status and optionally update other fields."""
    try:
        conn = get_db_connection()
        row = conn.execute(
            'SELECT completed, due_date, priority FROM tasks WHERE id = ?',
            (task_id,),
        ).fetchone()
        if row is None:
            conn.close()
            return jsonify({'error': 'Task not found'}), 404

        data = request.get_json(silent=True) or {}
        new_completed = not bool(row['completed'])
        due_date = data.get('due_date', row['due_date'])
        priority = data.get('priority', row['priority'])

        conn.execute(
            'UPDATE tasks SET completed = ?, due_date = ?, priority = ? WHERE id = ?',
            (new_completed, due_date, priority, task_id),
        )
        conn.commit()
        updated = conn.execute(
            'SELECT id, title, description, completed, due_date, priority, created_at FROM tasks WHERE id = ?',
            (task_id,),
        ).fetchone()
        conn.close()
        return jsonify(dict(updated))
    except sqlite3.Error as exc:
        app.logger.error('Database error: %s', exc)
        return jsonify({'error': 'Database error'}), 500


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task and return 204 on success."""
    try:
        conn = get_db_connection()
        cursor = conn.execute(
            'DELETE FROM tasks WHERE id = ?',
            (task_id,),
        )
        conn.commit()
        conn.close()
        if cursor.rowcount == 0:
            return jsonify({'error': 'Task not found'}), 404
        return '', 204
    except sqlite3.Error as exc:
        app.logger.error('Database error: %s', exc)
        return jsonify({'error': 'Database error'}), 500


if __name__ == '__main__':
    app.run()
