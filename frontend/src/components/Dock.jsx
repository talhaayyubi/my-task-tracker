import { useState } from 'react'
import clsx from 'clsx'
import useSystemStore from '../contexts/systemStore'
import { APP_REGISTRY, DOCK_APPS } from './apps/registry'

const Dock = () => {
  const {
    dock,
    openWindow,
    windows,
    activeWindowId,
    toggleLaunchpad,
  } = useSystemStore((state) => ({
    dock: state.dock,
    openWindow: state.openWindow,
    windows: state.windows,
    activeWindowId: state.activeWindowId,
    toggleLaunchpad: state.toggleLaunchpad,
  }))
  const [bouncing, setBouncing] = useState(null)
  const dockApps = dock.length ? dock : DOCK_APPS

  const handleOpen = (appId) => {
    if (appId === 'launchpad') {
      toggleLaunchpad()
      return
    }
    setBouncing(appId)
    openWindow(appId, {})
    setTimeout(() => setBouncing(null), 600)
  }

  return (
    <div className="dock" role="navigation" aria-label="Dock">
      <div className="dock-inner">
        <button className="dock-item launchpad" onClick={() => handleOpen('launchpad')}>
          <span className="dock-icon">⌘</span>
          <span className="dock-label">Launchpad</span>
        </button>
        <div className="dock-separator" />
        {dockApps.map((appId) => {
          const app = APP_REGISTRY[appId]
          if (!app) return null
          const runningWindows = windows.filter((window) => window.appId === appId)
          const isRunning = runningWindows.length > 0
          const isActive = runningWindows.some((window) => window.id === activeWindowId)
          return (
            <button
              key={appId}
              className={clsx('dock-item', appId, {
                bouncing: bouncing === appId,
                running: isRunning,
                active: isActive,
              })}
              onClick={() => handleOpen(appId)}
              onDoubleClick={() => handleOpen(appId)}
            >
              <span className="dock-icon" style={{ background: app.color }}>
                {app.icon}
              </span>
              <span className="dock-label">{app.name}</span>
              {isRunning ? <span className="dock-indicator" /> : null}
            </button>
          )
        })}
        <div className="dock-separator" />
        <div className="dock-item trash" aria-label="Trash">
          <span className="dock-icon">🗑️</span>
          <span className="dock-label">Trash</span>
        </div>
      </div>
    </div>
  )
}

export default Dock
