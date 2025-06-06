# Task Tracker

This project contains a small Flask backend and a React frontend built with Vite.

## Running the backend

1. Navigate to the `backend` folder.
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies (Flask and any others you may add):
   ```bash
   pip install flask
   ```
4. Start the API server:
   ```bash
   flask --app app run
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
   This launches Vite on <http://localhost:5173>.

## Running tests

- **Backend**: If you add Python unit tests under `backend/tests`, activate the
  virtual environment and run:
  ```bash
  pytest
  ```
- **Frontend**: If you add tests with your preferred tool (e.g. Vitest or Jest),
  run:
  ```bash
  npm test
  ```
