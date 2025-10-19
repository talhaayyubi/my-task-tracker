import { useEffect } from 'react'
import clsx from 'clsx'
import useSystemStore from '../contexts/systemStore'
import MenuBar from './MenuBar'
import Dock from './Dock'
import WindowLayer from './WindowLayer'
import DesktopIcons from './DesktopIcons'
import Spotlight from './Spotlight'
import Launchpad from './Launchpad'
import MissionControl from './MissionControl'
import NotificationCenter from './NotificationCenter'
import ControlCenter from './ControlCenter'

const Desktop = () => {
  const {
    theme,
    wallpaperIndex,
    wallpapers,
    toggleSpotlight,
    showSpotlight,
    toggleLaunchpad,
    showLaunchpad,
    showMissionControl,
    toggleMissionControl,
    toggleNotificationCenter,
    toggleControlCenter,
    showNotificationCenter,
    showControlCenter,
    closeWindow,
    activeWindowId,
    windows,
    focusWindow,
  } = useSystemStore((state) => ({
    theme: state.theme,
    wallpaperIndex: state.wallpaperIndex,
    wallpapers: state.wallpapers,
    toggleSpotlight: state.toggleSpotlight,
    showSpotlight: state.showSpotlight,
    toggleLaunchpad: state.toggleLaunchpad,
    showLaunchpad: state.showLaunchpad,
    showMissionControl: state.showMissionControl,
    toggleMissionControl: state.toggleMissionControl,
    toggleNotificationCenter: state.toggleNotificationCenter,
    toggleControlCenter: state.toggleControlCenter,
    showNotificationCenter: state.showNotificationCenter,
    showControlCenter: state.showControlCenter,
    closeWindow: state.closeWindow,
    activeWindowId: state.activeWindowId,
    windows: state.windows,
    focusWindow: state.focusWindow,
  }))

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showSpotlight) {
          toggleSpotlight()
          return
        }
        if (showLaunchpad) {
          toggleLaunchpad()
          return
        }
        if (showMissionControl) {
          toggleMissionControl()
        }
        return
      }

      const isCommand = event.metaKey || (event.ctrlKey && event.key !== 'Control')
      if (!isCommand) return
      const key = event.key.toLowerCase()

      if (key === ' ') {
        event.preventDefault()
        toggleSpotlight()
      } else if (key === 'tab') {
        event.preventDefault()
        if (!windows.length) return
        const currentIndex = windows.findIndex((window) => window.id === activeWindowId)
        const nextWindow = windows[(currentIndex + 1) % windows.length]
        focusWindow(nextWindow.id)
      } else if (key === 'q' || key === 'w') {
        if (activeWindowId) {
          event.preventDefault()
          closeWindow(activeWindowId)
        }
      }
    }

    const handleFunctionKeys = (event) => {
      if (event.code === 'F3') {
        event.preventDefault()
        toggleMissionControl()
      }
      if (event.code === 'F4') {
        event.preventDefault()
        toggleLaunchpad()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keydown', handleFunctionKeys)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleFunctionKeys)
    }
  }, [
    toggleSpotlight,
    showSpotlight,
    showLaunchpad,
    showMissionControl,
    toggleMissionControl,
    toggleLaunchpad,
    closeWindow,
    activeWindowId,
    windows,
    focusWindow,
  ])

  return (
    <div
      className={clsx('desktop', theme)}
      style={{ backgroundImage: wallpapers[wallpaperIndex] }}
      role="application"
    >
      <MenuBar onToggleControlCenter={toggleControlCenter} onToggleNotificationCenter={toggleNotificationCenter} />
      <DesktopIcons />
      <WindowLayer />
      <Dock />
      {showSpotlight ? <Spotlight /> : null}
      {showLaunchpad ? <Launchpad /> : null}
      {showMissionControl ? <MissionControl /> : null}
      {showNotificationCenter ? <NotificationCenter /> : null}
      {showControlCenter ? <ControlCenter /> : null}
    </div>
  )
}

export default Desktop
