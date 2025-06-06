import { useEffect, useState } from 'react'
import axios from 'axios'

function TaskList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let canceled = false
    axios.get('/api/tasks')
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
  }, [])

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
