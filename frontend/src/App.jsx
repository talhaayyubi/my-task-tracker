import { useEffect } from 'react'
import useSystemStore from './contexts/systemStore'
import BootScreen from './components/BootScreen'
import LoginScreen from './components/LoginScreen'
import Desktop from './components/Desktop'
import './styles/macos.css'
import './styles/animations.css'

const App = () => {
  const {
    bootStage,
    completeBoot,
    login,
    loggedIn,
    theme,
    wallpapers,
    wallpaperIndex,
  } = useSystemStore((state) => ({
    bootStage: state.bootStage,
    completeBoot: state.completeBoot,
    login: state.login,
    loggedIn: state.loggedIn,
    theme: state.theme,
    wallpapers: state.wallpapers,
    wallpaperIndex: state.wallpaperIndex,
  }))

  useEffect(() => {
    if (bootStage === 'boot') {
      const timeout = setTimeout(() => completeBoot(), 2800)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [bootStage, completeBoot])

  useEffect(() => {
    document.body.dataset.theme = theme
    document.documentElement.style.setProperty('--wallpaper', wallpapers[wallpaperIndex])
  }, [theme, wallpapers, wallpaperIndex])

  if (bootStage === 'boot') {
    return <BootScreen />
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={login} />
  }

  return <Desktop />
}

export default App
