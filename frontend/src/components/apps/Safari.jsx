import { useMemo, useState } from 'react'
import useSystemStore from '../../contexts/systemStore'

const createTab = (url) => ({
  id: Date.now(),
  url,
  title: url,
  history: [url],
  historyIndex: 0,
})

const Safari = ({ windowId }) => {
  const { setWindowTitle } = useSystemStore((state) => ({
    setWindowTitle: state.setWindowTitle,
  }))
  const [tabs, setTabs] = useState([createTab('https://developer.apple.com')])
  const [activeTabId, setActiveTabId] = useState(tabs[0].id)
  const [address, setAddress] = useState(tabs[0].url)

  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId), [tabs, activeTabId])

  const navigate = (url) => {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              url: normalized,
              title: normalized,
              history: [...tab.history.slice(0, tab.historyIndex + 1), normalized],
              historyIndex: tab.historyIndex + 1,
            }
          : tab,
      ),
    )
    setAddress(normalized)
    setWindowTitle(windowId, 'Safari')
  }

  const handleBack = () => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId || tab.historyIndex <= 0) return tab
        const newIndex = tab.historyIndex - 1
        setAddress(tab.history[newIndex])
        return {
          ...tab,
          historyIndex: newIndex,
          url: tab.history[newIndex],
        }
      }),
    )
  }

  const handleForward = () => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId || tab.historyIndex >= tab.history.length - 1) return tab
        const newIndex = tab.historyIndex + 1
        setAddress(tab.history[newIndex])
        return {
          ...tab,
          historyIndex: newIndex,
          url: tab.history[newIndex],
        }
      }),
    )
  }

  const handleNewTab = () => {
    const tab = createTab('https://www.apple.com')
    setTabs((prev) => [...prev, tab])
    setActiveTabId(tab.id)
    setAddress(tab.url)
  }

  const handleCloseTab = (id) => {
    setTabs((prev) => {
      if (prev.length === 1) return prev
      const next = prev.filter((tab) => tab.id !== id)
      if (id === activeTabId) {
        const nextTab = next[next.length - 1]
        setActiveTabId(nextTab.id)
        setAddress(nextTab.url)
      }
      return next
    })
  }

  return (
    <div className="safari">
      <div className="safari-tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className={`safari-tab ${tab.id === activeTabId ? 'active' : ''}`} onClick={() => setActiveTabId(tab.id)}>
            <span>{tab.title.slice(0, 18)}</span>
            <button onClick={() => handleCloseTab(tab.id)} aria-label="Close Tab">
              ×
            </button>
          </div>
        ))}
        <button className="safari-new-tab" onClick={handleNewTab}>
          +
        </button>
      </div>
      <div className="safari-toolbar">
        <button onClick={handleBack} disabled={!activeTab || activeTab.historyIndex === 0}>
          ←
        </button>
        <button
          onClick={handleForward}
          disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1}
        >
          →
        </button>
        <input value={address} onChange={(event) => setAddress(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && navigate(address)} />
        <button className="accent" onClick={() => navigate(address)}>
          Go
        </button>
      </div>
      <div className="safari-view">
        {activeTab ? (
          <iframe title="Safari" src={activeTab.url} sandbox="allow-same-origin allow-forms allow-scripts" />
        ) : null}
      </div>
    </div>
  )
}

export default Safari
