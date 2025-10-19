import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import useSystemStore from '../contexts/systemStore'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const WindowFrame = ({ window: win, app, children }) => {
  const {
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    closeWindow,
    minimizeWindow,
    toggleFullscreen,
    activeWindowId,
  } = useSystemStore((state) => ({
    focusWindow: state.focusWindow,
    updateWindowPosition: state.updateWindowPosition,
    updateWindowSize: state.updateWindowSize,
    closeWindow: state.closeWindow,
    minimizeWindow: state.minimizeWindow,
    toggleFullscreen: state.toggleFullscreen,
    activeWindowId: state.activeWindowId,
  }))
  const frameRef = useRef(null)

  useEffect(() => {
    if (!win.fullscreen) return undefined
    const handleResize = () => {
      const bounds = frameRef.current?.getBoundingClientRect()
      if (!bounds) return
      updateWindowSize(win.id, { width: bounds.width, height: bounds.height })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [win.fullscreen, win.id, updateWindowSize])

  const startDrag = (event) => {
    if (win.fullscreen) return
    event.preventDefault()
    focusWindow(win.id)
    const startX = event.clientX
    const startY = event.clientY
    const startPosition = { x: win.x, y: win.y }
    const handlePointerMove = (moveEvent) => {
      moveEvent.preventDefault()
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      const newX = clamp(startPosition.x + deltaX, -win.width + 120, window.innerWidth - 120)
      const newY = clamp(startPosition.y + deltaY, 40, window.innerHeight - 80)
      updateWindowPosition(win.id, { x: newX, y: newY })
    }
    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }

  const startResize = (event, direction) => {
    if (win.fullscreen) return
    event.stopPropagation()
    event.preventDefault()
    focusWindow(win.id)
    const startX = event.clientX
    const startY = event.clientY
    const startBounds = { x: win.x, y: win.y, width: win.width, height: win.height }

    const handlePointerMove = (moveEvent) => {
      moveEvent.preventDefault()
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      const nextBounds = { ...startBounds }
      if (direction.includes('right')) {
        nextBounds.width = Math.max(360, startBounds.width + deltaX)
      }
      if (direction.includes('bottom')) {
        nextBounds.height = Math.max(300, startBounds.height + deltaY)
      }
      if (direction.includes('left')) {
        const newWidth = Math.max(360, startBounds.width - deltaX)
        const newX = startBounds.x + deltaX
        if (newWidth !== startBounds.width) {
          nextBounds.width = newWidth
          nextBounds.x = newX
        }
      }
      if (direction.includes('top')) {
        const newHeight = Math.max(300, startBounds.height - deltaY)
        const newY = startBounds.y + deltaY
        if (newHeight !== startBounds.height) {
          nextBounds.height = newHeight
          nextBounds.y = newY
        }
      }
      updateWindowSize(win.id, { width: nextBounds.width, height: nextBounds.height })
      updateWindowPosition(win.id, { x: nextBounds.x, y: nextBounds.y })
    }

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }

  const isActive = activeWindowId === win.id
  const boundsStyle = win.fullscreen
    ? {
        top: '32px',
        left: '0',
        width: '100%',
        height: 'calc(100% - 48px)',
      }
    : {
        top: `${win.y}px`,
        left: `${win.x}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
      }

  const displayTitle = win.title && win.title !== win.appId ? win.title : app.title || app.name

  return (
    <div
      className={clsx('window-frame', {
        active: isActive,
        minimized: win.minimized,
        fullscreen: win.fullscreen,
      })}
      ref={frameRef}
      style={{ ...boundsStyle, zIndex: win.zIndex }}
      onPointerDown={() => focusWindow(win.id)}
    >
      <div className="window-toolbar" onPointerDown={startDrag}>
        <div className="traffic-lights" role="group" aria-label="Window controls">
          <button className="traffic-light close" aria-label="Close" onClick={() => closeWindow(win.id)} />
          <button className="traffic-light minimize" aria-label="Minimize" onClick={() => minimizeWindow(win.id)} />
          <button className="traffic-light zoom" aria-label="Toggle Fullscreen" onClick={() => toggleFullscreen(win.id)} />
        </div>
        <div className="window-title" onDoubleClick={() => toggleFullscreen(win.id)}>
          <span>{displayTitle}</span>
        </div>
        <div className="window-actions">{app.toolbar ? app.toolbar(win.id) : null}</div>
      </div>
      <div className="window-content">{children}</div>
      {!win.fullscreen ? (
        <>
          <div className="resize-handle resize-bottom-right" onPointerDown={(event) => startResize(event, 'bottom-right')} />
          <div className="resize-handle resize-bottom-left" onPointerDown={(event) => startResize(event, 'bottom-left')} />
          <div className="resize-handle resize-top-right" onPointerDown={(event) => startResize(event, 'top-right')} />
          <div className="resize-handle resize-top-left" onPointerDown={(event) => startResize(event, 'top-left')} />
          <div className="resize-edge resize-top" onPointerDown={(event) => startResize(event, 'top')} />
          <div className="resize-edge resize-bottom" onPointerDown={(event) => startResize(event, 'bottom')} />
          <div className="resize-edge resize-left" onPointerDown={(event) => startResize(event, 'left')} />
          <div className="resize-edge resize-right" onPointerDown={(event) => startResize(event, 'right')} />
        </>
      ) : null}
    </div>
  )
}

export default WindowFrame
