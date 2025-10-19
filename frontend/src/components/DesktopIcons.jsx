import { useEffect, useMemo, useState } from 'react'
import useSystemStore, { DESKTOP_PATH } from '../contexts/systemStore'
import { APP_IDS } from '../contexts/systemStore'
import { listDirectory } from '../utils/fileSystem'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const DesktopIcons = () => {
  const {
    fileSystem,
    iconPositions,
    setIconPosition,
    openWindow,
    createFolder,
    removeEntry,
    renameEntry,
  } = useSystemStore((state) => ({
    fileSystem: state.fileSystem,
    iconPositions: state.iconPositions,
    setIconPosition: state.setIconPosition,
    openWindow: state.openWindow,
    createFolder: state.createFolder,
    removeEntry: state.removeEntry,
    renameEntry: state.renameEntry,
  }))

  const [selected, setSelected] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const entries = useMemo(() => listDirectory(fileSystem, DESKTOP_PATH), [fileSystem])

  const getPosition = (path, index) => {
    if (iconPositions[path]) return iconPositions[path]
    const column = index % 5
    const row = Math.floor(index / 5)
    return {
      x: 64 + column * 120,
      y: 100 + row * 140,
    }
  }

  const handleOpen = (entry) => {
    if (entry.type === 'folder') {
      openWindow(APP_IDS.finder, {
        allowMultiple: true,
        overrideTitle: entry.name,
        payload: { path: entry.path },
      })
      return
    }
    const extension = entry.name.split('.').pop()?.toLowerCase()
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(extension)) {
      openWindow(APP_IDS.preview, {
        allowMultiple: true,
        overrideTitle: entry.name,
        payload: { path: entry.path },
      })
      return
    }
    openWindow(APP_IDS.textedit, {
      allowMultiple: true,
      overrideTitle: entry.name,
      payload: { path: entry.path },
    })
  }

  const startDrag = (event, entry, index) => {
    event.preventDefault()
    const start = getPosition(entry.path, index)
    const startX = event.clientX
    const startY = event.clientY

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault()
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      const newX = clamp(start.x + deltaX, 24, window.innerWidth - 120)
      const newY = clamp(start.y + deltaY, 80, window.innerHeight - 160)
      setIconPosition(entry.path, { x: newX, y: newY })
    }

    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
    }

    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
  }

  const handleContextMenu = (event, entry, index) => {
    event.preventDefault()
    setSelected(entry?.path || null)
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      entry,
      index,
    })
  }

  const handleRename = (entry) => {
    const newName = window.prompt('Rename item', entry.name)
    if (!newName) return
    renameEntry(entry.path, newName)
  }

  const handleDelete = (entry) => {
    if (window.confirm(`Move ${entry.name} to Trash?`)) {
      removeEntry(entry.path)
    }
  }

  const handleCreateFolder = () => {
    createFolder(DESKTOP_PATH, 'New Folder')
  }

  return (
    <div className="desktop-icons" onContextMenu={(event) => handleContextMenu(event, null, null)}>
      {entries.map((entry, index) => {
        const position = getPosition(entry.path, index)
        return (
          <div
            key={entry.path}
            className={`desktop-icon ${selected === entry.path ? 'selected' : ''}`}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            onPointerDown={(event) => startDrag(event, entry, index)}
            onClick={() => setSelected(entry.path)}
            onDoubleClick={() => handleOpen(entry)}
            onContextMenu={(event) => handleContextMenu(event, entry, index)}
          >
            <div className={`desktop-icon-image ${entry.type}`} />
            <span className="desktop-icon-label">{entry.name}</span>
          </div>
        )
      })}
      {contextMenu ? (
        <div
          className="desktop-context"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(event) => event.stopPropagation()}
        >
          {contextMenu.entry ? (
            <>
              <button type="button" onClick={() => handleOpen(contextMenu.entry)}>
                Open
              </button>
              <button type="button" onClick={() => handleRename(contextMenu.entry)}>
                Rename
              </button>
              <button type="button" onClick={() => handleDelete(contextMenu.entry)}>
                Move to Trash
              </button>
            </>
          ) : null}
          <button type="button" onClick={handleCreateFolder}>
            New Folder
          </button>
          <button type="button" onClick={() => openWindow(APP_IDS.system)}>
            Change Wallpaper…
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default DesktopIcons
