import { useState } from 'react'
import axios from 'axios'

function NewTaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post('/api/tasks', {
        title,
        description,
        due_date: dueDate,
        priority: priority ? Number(priority) : null,
      })
      .then(() => {
        setTitle('')
        setDescription('')
        setDueDate('')
        setPriority('')
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
      <div>
        <label>
          Due Date:
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Priority:
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
        </label>
      </div>
      <button type="submit">Add Task</button>
    </form>
  )
}

export default NewTaskForm

