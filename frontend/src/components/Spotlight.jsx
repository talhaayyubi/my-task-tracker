import { useEffect, useMemo, useRef } from 'react'
import useSystemStore from '../contexts/systemStore'
import { APP_REGISTRY } from './apps/registry'

const Spotlight = () => {
  const {
    spotlightQuery,
    setSpotlightQuery,
    toggleSpotlight,
    search,
    openWindow,
  } = useSystemStore((state) => ({
    spotlightQuery: state.spotlightQuery,
    setSpotlightQuery: state.setSpotlightQuery,
    toggleSpotlight: state.toggleSpotlight,
    search: state.search,
    openWindow: state.openWindow,
  }))
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const fileResults = useMemo(() => search(spotlightQuery), [search, spotlightQuery])
  const appResults = useMemo(() => {
    if (!spotlightQuery) return Object.values(APP_REGISTRY)
    const term = spotlightQuery.toLowerCase()
    return Object.values(APP_REGISTRY).filter((app) => app.name.toLowerCase().includes(term))
  }, [spotlightQuery])

  const handleOpen = (item) => {
    if (item.type === 'file') {
      const extension = item.name.split('.').pop()?.toLowerCase()
      const appId = ['png', 'jpg', 'jpeg', 'svg'].includes(extension) ? 'preview' : 'textedit'
      openWindow(appId, {
        allowMultiple: true,
        overrideTitle: item.name,
        payload: { path: item.path },
      })
    } else {
      openWindow(item.id)
    }
    toggleSpotlight()
  }

  return (
    <div className="spotlight-overlay" onClick={toggleSpotlight}>
      <div className="spotlight" onClick={(event) => event.stopPropagation()}>
        <input
          ref={inputRef}
          value={spotlightQuery}
          onChange={(event) => setSpotlightQuery(event.target.value)}
          placeholder="Search apps and documents"
        />
        <div className="spotlight-results">
          <section>
            <h4>Applications</h4>
            {appResults.map((app) => (
              <button key={app.id} onClick={() => handleOpen(app)}>
                <span className="spotlight-icon">{app.icon}</span>
                <span>{app.name}</span>
              </button>
            ))}
          </section>
          <section>
            <h4>Documents</h4>
            {fileResults.map((file) => (
              <button key={file.path} onClick={() => handleOpen({ ...file, type: 'file' })}>
                <span className="spotlight-icon">📄</span>
                <span>{file.name}</span>
              </button>
            ))}
            {!fileResults.length ? <p className="empty">No matches</p> : null}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Spotlight
