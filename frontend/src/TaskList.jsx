import { useEffect, useState } from 'react'
import axios from 'axios'

function TaskList({ refreshKey = 0 }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const toggleCompleted = (id) => {
    axios
      .put(`/api/tasks/${id}`)
      .then((res) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? res.data : t))
        )
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const deleteTask = (id) => {
    axios
      .delete(`/api/tasks/${id}`)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id))
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
          setTasks(res.data)
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
  }, [refreshKey])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => toggleCompleted(task.id)}
          />
          {task.title}
          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}

export default TaskList
