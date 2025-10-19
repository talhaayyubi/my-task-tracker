import { useEffect, useMemo, useState } from 'react'
import useSystemStore, { DESKTOP_PATH, HOME_PATH } from '../../contexts/systemStore'
import { listDirectory, getParentPath } from '../../utils/fileSystem'
import { APP_IDS } from '../../contexts/systemStore'

const VIEW_MODES = ['icons', 'list', 'columns']

const Finder = ({ windowId }) => {
  const {
    fileSystem,
    createFolder,
    createFile,
    removeEntry,
    renameEntry,
    openWindow,
    windows,
  } = useSystemStore((state) => ({
    fileSystem: state.fileSystem,
    createFolder: state.createFolder,
    createFile: state.createFile,
    removeEntry: state.removeEntry,
    renameEntry: state.renameEntry,
    openWindow: state.openWindow,
    windows: state.windows,
  }))
  const [currentPath, setCurrentPath] = useState(DESKTOP_PATH)
  const [viewMode, setViewMode] = useState('icons')
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState(null)

  const windowData = useMemo(() => windows.find((window) => window.id === windowId), [windows, windowId])

  useEffect(() => {
    if (windowData?.payload?.path) {
      setCurrentPath(windowData.payload.path)
    }
  }, [windowData])

  useEffect(() => {
    setSelected(null)
  }, [currentPath, searchTerm])

  const entries = useMemo(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      return Object.entries(fileSystem.entries)
        .filter(([path, entry]) => path !== '/' && entry.name.toLowerCase().includes(term))
        .map(([path, entry]) => ({ ...entry, path }))
    }
    return listDirectory(fileSystem, currentPath)
  }, [fileSystem, currentPath, searchTerm])

  const breadcrumbs = useMemo(() => {
    const segments = currentPath.split('/').filter(Boolean)
    const crumbPaths = []
    segments.reduce((acc, segment) => {
      const nextPath = `${acc}/${segment}`.replace('//', '/')
      crumbPaths.push({ name: segment, path: nextPath })
      return nextPath
    }, '')
    return [{ name: 'codex', path: HOME_PATH }, ...crumbPaths]
  }, [currentPath])

  const handleOpen = (entry) => {
    if (entry.type === 'folder') {
      setCurrentPath(entry.path)
    } else {
      openWindow(APP_IDS.textedit, {
        allowMultiple: true,
        overrideTitle: entry.name,
        payload: { path: entry.path },
      })
    }
  }

  const handleNewFolder = () => {
    createFolder(currentPath, 'New Folder')
  }

  const handleNewFile = () => {
    createFile(currentPath, 'Untitled.txt')
  }

  const handleDelete = () => {
    if (!selected) return
    removeEntry(selected.path)
    setSelected(null)
  }

  const handleRename = () => {
    if (!selected) return
    const newName = window.prompt('Rename', selected.name)
    if (!newName) return
    renameEntry(selected.path, newName)
  }

  const handleBack = () => {
    if (currentPath === HOME_PATH) return
    const parent = getParentPath(currentPath)
    if (parent) setCurrentPath(parent)
  }

  return (
    <div className="finder">
      <div className="finder-sidebar">
        <h3>Favorites</h3>
        <button onClick={() => setCurrentPath(DESKTOP_PATH)} className={currentPath === DESKTOP_PATH ? 'active' : ''}>
          Desktop
        </button>
        <button onClick={() => setCurrentPath('/Documents')} className={currentPath === '/Documents' ? 'active' : ''}>
          Documents
        </button>
        <button onClick={() => setCurrentPath('/Downloads')} className={currentPath === '/Downloads' ? 'active' : ''}>
          Downloads
        </button>
        <button onClick={() => setCurrentPath('/Applications')} className={currentPath === '/Applications' ? 'active' : ''}>
          Applications
        </button>
      </div>
      <div className="finder-main">
        <div className="finder-toolbar">
          <div className="finder-breadcrumbs">
            <button onClick={handleBack} aria-label="Go Back">
              ←
            </button>
            {breadcrumbs.map((crumb) => (
              <button key={crumb.path} onClick={() => setCurrentPath(crumb.path)}>
                {crumb.name}
              </button>
            ))}
          </div>
          <div className="finder-controls">
            <div className="finder-view-toggle">
              {VIEW_MODES.map((mode) => (
                <button key={mode} className={viewMode === mode ? 'active' : ''} onClick={() => setViewMode(mode)}>
                  {mode}
                </button>
              ))}
            </div>
            <button onClick={handleNewFolder}>New Folder</button>
            <button onClick={handleNewFile}>New Text File</button>
            <button onClick={handleRename} disabled={!selected}>
              Rename
            </button>
            <button onClick={handleDelete} disabled={!selected}>
              Delete
            </button>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search"
            />
          </div>
        </div>
        <div className={`finder-content ${viewMode}`}>
          {entries.map((entry) => (
            <div
              key={entry.path}
              className={`finder-item ${selected?.path === entry.path ? 'selected' : ''}`}
              onDoubleClick={() => handleOpen(entry)}
              onClick={() => setSelected(entry)}
            >
              <div className={`finder-icon ${entry.type}`} />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Finder
