import { useState } from 'react'
import axios from 'axios'
import { Plus, Edit3, Calendar, Flag, AlertCircle, CheckCircle, Loader } from 'lucide-react'

function NewTaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous messages
    setError('')
    setSuccess('')
    
    // Validate required fields
    if (!title.trim()) {
      setError('Task title is required')
      return
    }
    
    setIsSubmitting(true)

    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      priority: priority ? Number(priority) : null,
    }

    console.log('Sending task data:', taskData)

    try {
      // Use relative URL - Vite proxy will handle routing to backend
      const response = await axios.post('/api/tasks', taskData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      })

      console.log('Task created successfully:', response.data)
      setSuccess('Task created successfully!')
      
      // Clear form
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('')
      
      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated()
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err) {
      console.error('Error creating task:', err)
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check if the backend is running.')
      } else if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.error || `Server error: ${err.response.status}`
        setError(errorMessage)
      } else if (err.request) {
        // Request was made but no response received
        setError('Cannot connect to server. Please ensure the backend is running on port 5000.')
      } else {
        // Something else happened
        setError('An unexpected error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const testBackendConnection = async () => {
    try {
      setError('')
      setSuccess('')
      const response = await axios.get('/api/health')
      console.log('Backend health check:', response.data)
      setSuccess(`Backend connection successful! Status: ${response.data.status}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Backend health check failed:', err)
      setError('Backend connection failed. Make sure the Flask server is running on port 5000.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="new-task-form">
      <div className="form-header">
        <h2>
          <Edit3 className="inline-icon" />
          Add New Task
        </h2>
        <p>Create a new task to stay organized</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          backgroundColor: '#ffebee', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '15px',
          border: '1px solid #ffcdd2',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={20} />
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: '#2e7d32', 
          backgroundColor: '#e8f5e8', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '15px',
          border: '1px solid #c8e6c9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={20} />
          <span><strong>Success:</strong> {success}</span>
        </div>
      )}

      {/* Debug Button - Remove in production */}
      <button 
        type="button" 
        onClick={testBackendConnection}
        style={{ 
          marginBottom: '20px', 
          backgroundColor: '#6c757d', 
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <AlertCircle size={16} />
        Test Backend Connection
      </button>

      <div className="form-grid">
        <div className="form-group">
          <label>Task Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            required
            disabled={isSubmitting}
            style={{ 
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'text'
            }}
          />
        </div>

        <div className="form-group">
          <label>
            <Flag className="inline-icon" />
            Priority Level
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
            style={{ 
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">Select priority...</option>
            <option value="1">1 - Low Priority</option>
            <option value="2">2 - Medium Priority</option>
            <option value="3">3 - High Priority</option>
            <option value="4">4 - Urgent</option>
            <option value="5">5 - Critical</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add task description..."
            disabled={isSubmitting}
            style={{ 
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'text'
            }}
          />
        </div>

        <div className="form-group">
          <label>
            <Calendar className="inline-icon" />
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
            style={{ 
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={isSubmitting || !title.trim()}
        style={{
          opacity: (isSubmitting || !title.trim()) ? 0.6 : 1,
          cursor: (isSubmitting || !title.trim()) ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? (
          <>
            <Loader className="inline-icon" style={{ animation: 'spin 1s linear infinite' }} />
            Creating Task...
          </>
        ) : (
          <>
            <Plus className="inline-icon" />
            Add Task
          </>
        )}
      </button>
    </form>
  )
}

export default NewTaskForm