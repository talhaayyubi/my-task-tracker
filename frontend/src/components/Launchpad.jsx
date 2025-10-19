import { useMemo, useState } from 'react'
import useSystemStore from '../contexts/systemStore'
import { APP_REGISTRY } from './apps/registry'

const Launchpad = () => {
  const { toggleLaunchpad, openWindow } = useSystemStore((state) => ({
    toggleLaunchpad: state.toggleLaunchpad,
    openWindow: state.openWindow,
  }))
  const [query, setQuery] = useState('')

  const apps = useMemo(() => {
    const values = Object.values(APP_REGISTRY)
    if (!query.trim()) return values
    const term = query.toLowerCase()
    return values.filter((app) => app.name.toLowerCase().includes(term))
  }, [query])

  return (
    <div className="launchpad" onClick={toggleLaunchpad}>
      <div className="launchpad-content" onClick={(event) => event.stopPropagation()}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
        <div className="launchpad-grid">
          {apps.map((app) => (
            <button key={app.id} onClick={() => { openWindow(app.id); toggleLaunchpad() }}>
              <span className="launchpad-icon" style={{ background: app.color }}>
                {app.icon}
              </span>
              <span>{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Launchpad
