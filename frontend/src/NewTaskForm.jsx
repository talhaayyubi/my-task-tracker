import { useState } from 'react'
import axios from 'axios'

function NewTaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post('/api/tasks', { title, description })
      .then(() => {
        setTitle('')
        setDescription('')
        if (onTaskCreated) {
          onTaskCreated()
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <form onSubmit={handleSubmit} className="new-task-form">
      <div>
        <label>
          Title:
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Description:
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </div>
      <button type="submit">Add Task</button>
    </form>
  )
}

export default NewTaskForm

