import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { CheckSquare } from 'lucide-react'
import './App.css'
import TaskList from './TaskList'
import NewTaskForm from './NewTaskForm'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      {/* Header Section */}
      <div className="header-section">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>
          <CheckSquare className="inline-icon" />
          Task Tracker Pro
        </h1>
        <p className="subtitle">
          Organize your tasks efficiently with our modern task management app
        </p>
      </div>

      {/* Main Task Container */}
      <div className="task-container">
        <NewTaskForm onTaskCreated={() => setRefreshKey((k) => k + 1)} />
        <TaskList refreshKey={refreshKey} />
      </div>
    </>
  )
}

export default App