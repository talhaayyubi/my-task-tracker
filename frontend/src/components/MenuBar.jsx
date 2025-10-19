import { useEffect, useMemo, useState } from 'react'
import useSystemStore from '../contexts/systemStore'
import { APP_IDS } from '../contexts/systemStore'

const MenuBar = ({ onToggleControlCenter, onToggleNotificationCenter }) => {
  const { windows, activeWindowId, toggleSpotlight, theme } = useSystemStore((state) => ({
    windows: state.windows,
    activeWindowId: state.activeWindowId,
    toggleSpotlight: state.toggleSpotlight,
    theme: state.theme,
  }))
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const activeApp = useMemo(() => {
    const activeWindow = windows.find((window) => window.id === activeWindowId)
    if (!activeWindow) return 'Finder'
    switch (activeWindow.appId) {
      case APP_IDS.finder:
        return 'Finder'
      case APP_IDS.textedit:
        return 'TextEdit'
      case APP_IDS.terminal:
        return 'Terminal'
      case APP_IDS.code:
        return 'Code Editor'
      case APP_IDS.safari:
        return 'Safari'
      case APP_IDS.notes:
        return 'Notes'
      case APP_IDS.calendar:
        return 'Calendar'
      case APP_IDS.system:
        return 'System Settings'
      case APP_IDS.calculator:
        return 'Calculator'
      case APP_IDS.preview:
        return 'Preview'
      case APP_IDS.music:
        return 'Music'
      case APP_IDS.game:
        return 'Minesweeper'
      default:
        return 'Finder'
    }
  }, [windows, activeWindowId])

  const formattedTime = useMemo(() => {
    return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }, [time])

  const formattedDate = useMemo(() => {
    return time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  }, [time])

  return (
    <header className={`menu-bar ${theme}`}>
      <div className="menu-bar-left">
        <button className="menu-bar-apple" onClick={toggleSpotlight} aria-label="Open Spotlight">
          
        </button>
        <span className="menu-bar-app-name">{activeApp}</span>
        <nav className="menu-bar-nav">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Go</span>
          <span>Window</span>
          <span>Help</span>
        </nav>
      </div>
      <div className="menu-bar-right">
        <button className="menu-icon" onClick={onToggleControlCenter} aria-label="Open Control Center">
          <span className="icon-control-center" />
        </button>
        <button className="menu-icon" onClick={onToggleNotificationCenter} aria-label="Open Notification Center">
          <span className="icon-notification" />
        </button>
        <span className="menu-icon">
          <span className="icon-wifi" />
        </span>
        <span className="menu-icon">
          <span className="icon-battery" />
        </span>
        <span className="menu-time">
          {formattedDate} {formattedTime}
        </span>
      </div>
    </header>
  )
}

export default MenuBar
