import { useEffect, useMemo, useState } from 'react'
import { addMonths, endOfMonth, format, getDay, isSameDay, startOfMonth } from 'date-fns'

const STORAGE_KEY = 'codex_calendar_events'

const loadEvents = () => {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    console.error('Failed to load events', error)
    return {}
  }
}

const saveEvents = (events) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState(() => loadEvents())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [title, setTitle] = useState('')

  useEffect(() => {
    saveEvents(events)
  }, [events])

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const startOffset = getDay(start)
    const totalDays = end.getDate()
    const grid = []
    for (let i = 0; i < startOffset; i += 1) {
      grid.push(null)
    }
    for (let day = 1; day <= totalDays; day += 1) {
      grid.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    }
    return grid
  }, [currentMonth])

  const handleAddEvent = () => {
    if (!title.trim()) return
    const key = format(selectedDate, 'yyyy-MM-dd')
    const list = events[key] || []
    const updated = { ...events, [key]: [...list, { id: Date.now(), title }] }
    setEvents(updated)
    setTitle('')
  }

  const eventList = events[format(selectedDate, 'yyyy-MM-dd')] || []

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>Prev</button>
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>Next</button>
      </div>
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <button
            key={index}
            className={`calendar-cell ${day && isSameDay(day, selectedDate) ? 'selected' : ''}`}
            onClick={() => day && setSelectedDate(day)}
            disabled={!day}
          >
            {day ? format(day, 'd') : ''}
            <div className="calendar-cell-events">
              {day
                ? (events[format(day, 'yyyy-MM-dd')] || []).slice(0, 2).map((event) => (
                    <span key={event.id}>{event.title}</span>
                  ))
                : null}
            </div>
          </button>
        ))}
      </div>
      <div className="calendar-sidebar">
        <h3>{format(selectedDate, 'EEEE, MMMM do')}</h3>
        <div className="calendar-events">
          {eventList.map((event) => (
            <div key={event.id} className="calendar-event">
              {event.title}
            </div>
          ))}
        </div>
        <div className="calendar-new-event">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New event" />
          <button className="accent" onClick={handleAddEvent}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default Calendar
