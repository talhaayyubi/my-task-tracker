import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  List, 
  Clock, 
  CheckCircle, 
  Calendar, 
  Flag, 
  Trash2, 
  Target,
  AlertCircle,
  Loader,
  RefreshCw
} from 'lucide-react'

function TaskList({ refreshKey = 0 }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const applyFilter = (allTasks, currentFilter) => {
    if (currentFilter === 'active') {
      return allTasks.filter((t) => !t.completed)
    }
    if (currentFilter === 'completed') {
      return allTasks.filter((t) => t.completed)
    }
    return allTasks
  }

  const fetchTasks = async (currentFilter = filter) => {
    setLoading(true)
    setError('')
    console.log('Fetching tasks...')
    
    try {
      // Use relative URL - Vite proxy will handle routing to backend
      const response = await axios.get('/api/tasks', {
        timeout: 10000
      })
      
      console.log('Tasks fetched:', response.data)
      const tasksData = Array.isArray(response.data) ? response.data : []
      setTasks(applyFilter(tasksData, currentFilter))
      
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setTasks([])
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection.')
      } else if (err.response) {
        setError(`Server error: ${err.response.status}`)
      } else if (err.request) {
        setError('Cannot connect to server. Please ensure the backend is running.')
      } else {
        setError('An unexpected error occurred while fetching tasks.')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleCompleted = async (id) => {
    try {
      await axios.put(`/api/tasks/${id}`, {}, {
        timeout: 5000
      })
      await fetchTasks(filter)
    } catch (err) {
      console.error('Error toggling task:', err)
      setError('Failed to update task. Please try again.')
      setTimeout(() => setError(''), 3000)
    }
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    setDeletingId(id)
    try {
      await axios.delete(`/api/tasks/${id}`, {
        timeout: 5000
      })
      await fetchTasks(filter)
    } catch (err) {
      console.error('Error deleting task:', err)
      setError('Failed to delete task. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setDeletingId(null)
    }
  }

  const getPriorityIcon = (priority) => {
    const icons = {
      1: <Flag className="priority-icon low" />,
      2: <Flag className="priority-icon medium" />, 
      3: <Flag className="priority-icon high" />,
      4: <AlertCircle className="priority-icon urgent" />,
      5: <AlertCircle className="priority-icon critical" />
    }
    return icons[priority] || null
  }

  const getPriorityText = (priority) => {
    const priorities = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Urgent',
      5: 'Critical'
    }
    return priorities[priority] || 'Unknown'
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (e) {
      return dateString
    }
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    const allTasks = [...tasks]
    if (filter !== 'all') {
      // If we're changing from a filtered view, we need to fetch all tasks first
      fetchTasks(newFilter)
    } else {
      // If we're already showing all tasks, just apply the filter
      setTasks(applyFilter(allTasks, newFilter))
    }
  }

  const retryFetch = () => {
    setError('')
    fetchTasks()
  }

  useEffect(() => {
    let canceled = false
    
    const loadTasks = async () => {
      setLoading(true)
      setError('')
      
      try {
        const response = await axios.get('/api/tasks', {
          timeout: 10000
        })
        
        if (!canceled) {
          const tasksData = Array.isArray(response.data) ? response.data : []
          setTasks(applyFilter(tasksData, filter))
        }
      } catch (err) {
        console.error('Error in useEffect:', err)
        if (!canceled) {
          setTasks([])
          if (err.code === 'ECONNABORTED') {
            setError('Request timed out. Please check your connection.')
          } else if (err.request) {
            setError('Cannot connect to server. Please ensure the backend is running.')
          } else {
            setError('Failed to load tasks.')
          }
        }
      } finally {
        if (!canceled) {
          setLoading(false)
        }
      }
    }

    loadTasks()
    
    return () => {
      canceled = true
    }
  }, [refreshKey, filter])

  if (loading) {
    return (
      <div className="loading">
        <Loader className="inline-icon" style={{ animation: 'spin 1s linear infinite' }} />
        Loading your tasks...
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading">
        <AlertCircle className="inline-icon" style={{ color: '#d32f2f' }} />
        <div>{error}</div>
        <button 
          onClick={retryFetch}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Filter Buttons */}
      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          <List className="inline-icon" />
          All Tasks
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => handleFilterChange('active')}
        >
          <Clock className="inline-icon" />
          Active
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => handleFilterChange('completed')}
        >
          <CheckCircle className="inline-icon" />
          Completed
        </button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <Target className="inline-icon" />
          <h3>No tasks found</h3>
          <p>
            {filter === 'all' 
              ? 'Add your first task above to get started!'
              : `No ${filter} tasks at the moment.`
            }
          </p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`task-item${task.completed ? ' completed' : ''}`}
            >
              <input
                type="checkbox"
                className="task-checkbox"
                checked={!!task.completed}
                onChange={() => toggleCompleted(task.id)}
              />
              
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                {task.description && (
                  <div className="task-description" style={{ 
                    color: '#666', 
                    fontSize: '0.9rem',
                    marginTop: '0.25rem'
                  }}>
                    {task.description}
                  </div>
                )}
                <div className="task-meta">
                  {task.due_date && (
                    <span className="task-due">
                      <Calendar className="meta-icon" />
                      Due: {formatDate(task.due_date)}
                    </span>
                  )}
                  {task.priority && (
                    <span className="task-priority">
                      {getPriorityIcon(task.priority)}
                      {getPriorityText(task.priority)} Priority
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={() => deleteTask(task.id)}
                className="delete-btn"
                disabled={deletingId === task.id}
                style={{
                  opacity: deletingId === task.id ? 0.6 : 1,
                  cursor: deletingId === task.id ? 'not-allowed' : 'pointer'
                }}
              >
                {deletingId === task.id ? (
                  <Loader className="inline-icon" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Trash2 className="inline-icon" />
                )}
                {deletingId === task.id ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default TaskList