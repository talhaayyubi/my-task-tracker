import useSystemStore from '../contexts/systemStore'
import { APP_REGISTRY } from './apps/registry'

const MissionControl = () => {
  const { windows, toggleMissionControl, focusWindow } = useSystemStore((state) => ({
    windows: state.windows,
    toggleMissionControl: state.toggleMissionControl,
    focusWindow: state.focusWindow,
  }))

  const visible = windows.filter((window) => !window.minimized)

  return (
    <div className="mission-control" onClick={toggleMissionControl}>
      <div className="mission-grid">
        {visible.map((window) => {
          const app = APP_REGISTRY[window.appId]
          return (
            <button
              key={window.id}
              className="mission-window"
              onClick={(event) => {
                event.stopPropagation()
                focusWindow(window.id)
                toggleMissionControl()
              }}
            >
              <span className="mission-title">{window.title || app?.name}</span>
              <span className="mission-app">{app?.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MissionControl
