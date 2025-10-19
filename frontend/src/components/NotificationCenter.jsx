import { format } from 'date-fns'
import useSystemStore from '../contexts/systemStore'

const notifications = [
  { id: 1, title: 'Codex Reminder', message: 'Ship something great today.' },
  { id: 2, title: 'Calendar', message: 'Design sync at 3:00 PM.' },
]

const NotificationCenter = () => {
  const { toggleNotificationCenter } = useSystemStore((state) => ({
    toggleNotificationCenter: state.toggleNotificationCenter,
  }))
  const now = new Date()

  return (
    <aside className="notification-center" role="complementary">
      <header>
        <h3>Notification Center</h3>
        <button onClick={toggleNotificationCenter}>Close</button>
      </header>
      <section className="notification-widgets">
        <div className="widget">
          <h4>{format(now, 'EEEE')}</h4>
          <p>{format(now, 'MMMM do')}</p>
        </div>
        <div className="widget">
          <h4>Weather</h4>
          <p>72° • Sunny</p>
        </div>
      </section>
      <section className="notification-list">
        {notifications.map((notification) => (
          <article key={notification.id}>
            <h5>{notification.title}</h5>
            <p>{notification.message}</p>
          </article>
        ))}
      </section>
    </aside>
  )
}

export default NotificationCenter
