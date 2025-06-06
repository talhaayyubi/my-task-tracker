from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
import sqlite3
import os
import logging

app = Flask(__name__)

# Configure CORS for GitHub Codespaces and local development
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "https://*.app.github.dev",
    "https://*.githubpreview.dev"
], supports_credentials=True)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE = os.path.join(os.path.dirname(__file__), "tasks.db")


def init_database():
    """Initialize the database with the tasks table if it doesn't exist."""
    try:
        conn = sqlite3.connect(DATABASE)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                due_date TEXT,
                priority INTEGER
            )
        ''')
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/')
def home():
    """API info endpoint."""
    return jsonify({
        'message': 'Task Tracker API',
        'status': 'running',
        'endpoints': {
            'GET /api/tasks': 'Get all tasks',
            'POST /api/tasks': 'Create new task',
            'PUT /api/tasks/<id>': 'Toggle task completion',
            'DELETE /api/tasks/<id>': 'Delete task',
            'GET /api/health': 'Health check'
        }
    })


@app.route('/api/health')
def health():
    """API health check endpoint."""
    try:
        # Test database connection
        conn = get_db_connection()
        conn.execute('SELECT 1').fetchone()
        conn.close()
        db_status = 'connected'
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        db_status = 'disconnected'
    
    return jsonify({
        'status': 'healthy',
        'message': 'Task Tracker API is running',
        'database': db_status,
        'endpoints': {
            'tasks': '/api/tasks',
            'health': '/api/health'
        }
    })


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Return all tasks as JSON ordered by creation date."""
    try:
        conn = get_db_connection()
        rows = conn.execute(
            'SELECT id, title, description, completed, due_date, priority, created_at FROM tasks ORDER BY created_at DESC'
        ).fetchall()
        conn.close()
        tasks = [dict(row) for row in rows]
        logger.info(f"Retrieved {len(tasks)} tasks")
        return jsonify(tasks)
    except sqlite3.Error as exc:
        logger.error(f'Database error: {exc}')
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f'Unexpected error: {e}')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task and return it as JSON."""
    try:
        data = request.get_json(silent=True) or {}
        title = str(data.get('title', '')).strip()
        description = str(data.get('description', '')).strip() if data.get('description') else None
        due_date = data.get('due_date', '').strip() if data.get('due_date') else None
        priority = data.get('priority')

        # Validation
        if not title:
            return jsonify({'error': 'Title is required and cannot be empty'}), 400

        # Convert priority to integer if provided
        if priority is not None:
            try:
                priority = int(priority)
                if priority < 1 or priority > 5:
                    return jsonify({'error': 'Priority must be between 1 and 5'}), 400
            except (ValueError, TypeError):
                priority = None

        conn = get_db_connection()
        cursor = conn.execute(
            'INSERT INTO tasks (title, description, completed, due_date, priority) VALUES (?, ?, ?, ?, ?)',
            (title, description, False, due_date, priority),
        )
        conn.commit()
        task_id = cursor.lastrowid
        
        # Fetch the created task
        row = conn.execute(
            'SELECT id, title, description, completed, due_date, priority, created_at FROM tasks WHERE id = ?',
            (task_id,),
        ).fetchone()
        conn.close()
        
        created_task = dict(row)
        logger.info(f"Created task: {created_task['title']} (ID: {task_id})")
        return jsonify(created_task), 201
        
    except sqlite3.Error as exc:
        logger.error(f'Database error: {exc}')
        return jsonify({'error': 'Failed to create task due to database error'}), 500
    except Exception as e:
        logger.error(f'Unexpected error creating task: {e}')
        return jsonify({'error': 'Failed to create task'}), 500


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def toggle_task(task_id):
    """Toggle a task's completed status and optionally update other fields."""
    try:
        conn = get_db_connection()
        row = conn.execute(
            'SELECT * FROM tasks WHERE id = ?',
            (task_id,),
        ).fetchone()
        
        if row is None:
            conn.close()
            return jsonify({'error': 'Task not found'}), 404

        data = request.get_json(silent=True) or {}
        
        # Toggle completion status
        new_completed = not bool(row['completed'])
        
        # Keep existing values unless new ones provided
        due_date = data.get('due_date', row['due_date'])
        priority = data.get('priority', row['priority'])

        conn.execute(
            'UPDATE tasks SET completed = ?, due_date = ?, priority = ? WHERE id = ?',
            (new_completed, due_date, priority, task_id),
        )
        conn.commit()
        
        # Fetch updated task
        updated = conn.execute(
            'SELECT id, title, description, completed, due_date, priority, created_at FROM tasks WHERE id = ?',
            (task_id,),
        ).fetchone()
        conn.close()
        
        logger.info(f"Toggled task {task_id}: completed = {new_completed}")
        return jsonify(dict(updated))
        
    except sqlite3.Error as exc:
        logger.error(f'Database error: {exc}')
        return jsonify({'error': 'Failed to update task'}), 500
    except Exception as e:
        logger.error(f'Unexpected error updating task: {e}')
        return jsonify({'error': 'Failed to update task'}), 500


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
            
        logger.info(f"Deleted task {task_id}")
        return '', 204
        
    except sqlite3.Error as exc:
        logger.error(f'Database error: {exc}')
        return jsonify({'error': 'Failed to delete task'}), 500
    except Exception as e:
        logger.error(f'Unexpected error deleting task: {e}')
        return jsonify({'error': 'Failed to delete task'}), 500


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    init_database()  # Initialize database on startup
    app.run(host='0.0.0.0', port=5000, debug=True)