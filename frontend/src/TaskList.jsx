import { useEffect, useState } from 'react'
import axios from 'axios'

function TaskList({ refreshKey = 0 }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const applyFilter = (allTasks, currentFilter) => {
    if (currentFilter === 'active') {
      return allTasks.filter((t) => !t.completed)
    }
    if (currentFilter === 'completed') {
      return allTasks.filter((t) => t.completed)
    }
    return allTasks
  }

  const fetchTasks = (currentFilter) => {
    setLoading(true)
    axios
      .get('/api/tasks')
      .then((res) => {
        setTasks(applyFilter(res.data, currentFilter))
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const toggleCompleted = (id) => {
    axios
      .put(`/api/tasks/${id}`)
      .then(() => {
        fetchTasks(filter)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const deleteTask = (id) => {
    axios
      .delete(`/api/tasks/${id}`)
      .then(() => {
        fetchTasks(filter)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  useEffect(() => {
    let canceled = false
    setLoading(true)
    axios
      .get('/api/tasks')
      .then((res) => {
        if (!canceled) {
          setTasks(applyFilter(res.data, filter))
        }
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        if (!canceled) {
          setLoading(false)
        }
      })
    return () => {
      canceled = true
    }
  }, [refreshKey, filter])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>
      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item${task.completed ? ' completed' : ''}`}
          >
            <input
              type="checkbox"
              checked={!!task.completed}
              onChange={() => toggleCompleted(task.id)}
            />
            <span className="task-title">{task.title}</span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default TaskList
