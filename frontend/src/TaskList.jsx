import { useEffect, useState } from 'react'
import axios from 'axios'

function TaskList({ refreshKey = 0 }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

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
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}

export default TaskList
