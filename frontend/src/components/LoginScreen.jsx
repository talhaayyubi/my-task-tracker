import { useEffect, useState } from 'react'
import useSystemStore from '../contexts/systemStore'

const LoginScreen = ({ onLogin }) => {
  const { user, theme } = useSystemStore((state) => ({
    user: state.user,
    theme: state.theme,
  }))
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.classList.toggle('login-stage', true)
    return () => document.body.classList.remove('login-stage')
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (password.trim() && password.trim().toLowerCase() !== 'codex') {
      setError('Incorrect password')
      return
    }
    setError('')
    onLogin()
  }

  return (
    <div className={`login-screen ${theme}`}>
      <div className="login-avatar" aria-hidden>
        <span>{user.avatar}</span>
      </div>
      <h1 className="login-name">{user.name}</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="login-input"
          autoFocus
        />
        <button type="submit" className="login-button">
          Log In
        </button>
        {error ? <p className="login-error">{error}</p> : null}
      </form>
    </div>
  )
}

export default LoginScreen
