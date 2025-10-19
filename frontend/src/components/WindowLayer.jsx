import useSystemStore from '../contexts/systemStore'
import { APP_REGISTRY } from './apps/registry'
import WindowFrame from './WindowFrame'

const WindowLayer = () => {
  const windows = useSystemStore((state) => state.windows)
  const ordered = [...windows].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div className="window-layer">
      {ordered.map((win) => {
        const app = APP_REGISTRY[win.appId]
        if (!app) return null
        const AppComponent = app.component
        return (
          <WindowFrame key={win.id} window={win} app={app}>
            <AppComponent windowId={win.id} appId={win.appId} />
          </WindowFrame>
        )
      })}
    </div>
  )
}

export default WindowLayer
