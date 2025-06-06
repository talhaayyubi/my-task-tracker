# Task Tracker

This project contains a Flask backend and a React frontend built with Vite. The app allows users to create, manage, and track tasks with features like priority levels, due dates, and task filtering.

## Features

- Create tasks with title, description, due date, and priority levels
- Mark tasks as complete/incomplete
- Filter tasks by All, Active, or Completed status
- Delete tasks with confirmation
- Modern responsive UI design
- Real-time task updates

## Project Structure

```
my-task-tracker/
├── backend/
│   ├── app.py
│   └── tasks.db (auto-created)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── TaskList.jsx
│   │   ├── NewTaskForm.jsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
└── tests/
```

## Running the backend

1. Navigate to the `backend` folder.
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install flask flask-cors
   ```
4. Start the API server:
   ```bash
   flask --app app run --host=0.0.0.0 --port=5000
   ```
   The backend will be available at `http://127.0.0.1:5000/`.

## Running the frontend

1. Navigate to the `frontend` folder.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   This launches Vite on `http://localhost:5173`.

## API Integration

The frontend uses Vite's proxy configuration to communicate with the backend. All `/api/*` requests are automatically forwarded to the Flask server, eliminating CORS issues.

### Available Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Toggle task completion
- `DELETE /api/tasks/{id}` - Delete a task
- `GET /api/health` - Health check

## Running tests

- **Backend**: If you add Python unit tests under `tests/`, activate the virtual environment and run:
  ```bash
  pytest
  ```
- **Frontend**: If you add tests with your preferred tool (e.g. Vitest or Jest), run:
  ```bash
  npm test
  ```

## GitHub Codespaces

This project works seamlessly in GitHub Codespaces:

1. Open the repository in Codespaces
2. Both servers will be accessible via generated URLs
3. The Vite proxy handles API communication automatically

## Troubleshooting

**Connection Issues:**
- Ensure both backend and frontend servers are running
- Check that Flask-CORS is installed in the backend
- Use the "Test Backend Connection" button in the app to debug

**Database Issues:**
- The SQLite database is created automatically on first run
- Check that the backend has write permissions

**CORS Errors:**
- Make sure the Vite proxy is configured correctly in `vite.config.js`
- Restart both servers if you encounter CORS issues

## Dependencies

**Backend:**
- Python 3.12+
- Flask
- Flask-CORS

**Frontend:**
- Node.js 18+
- React 19.1.0
- Vite 6.3.5
- Axios
- Lucide React (for icons)
