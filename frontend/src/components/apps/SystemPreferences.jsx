import useSystemStore from '../../contexts/systemStore'

const SystemPreferences = () => {
  const {
    theme,
    setTheme,
    wallpapers,
    wallpaperIndex,
    setWallpaper,
    toggleSpotlight,
  } = useSystemStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
    wallpapers: state.wallpapers,
    wallpaperIndex: state.wallpaperIndex,
    setWallpaper: state.setWallpaper,
    toggleSpotlight: state.toggleSpotlight,
  }))

  return (
    <div className="system-preferences">
      <section>
        <h3>Appearance</h3>
        <div className="preference-row">
          <label>
            <input type="radio" checked={theme === 'light'} onChange={() => setTheme('light')} /> Light
          </label>
          <label>
            <input type="radio" checked={theme === 'dark'} onChange={() => setTheme('dark')} /> Dark
          </label>
        </div>
      </section>
      <section>
        <h3>Wallpapers</h3>
        <div className="wallpaper-grid">
          {wallpapers.map((wallpaper, index) => (
            <button
              key={wallpaper}
              className={wallpaperIndex === index ? 'selected' : ''}
              style={{ background: wallpaper }}
              onClick={() => setWallpaper(index)}
            />
          ))}
        </div>
      </section>
      <section>
        <h3>Shortcuts</h3>
        <p>
          Press <kbd>⌘</kbd>+<kbd>Space</kbd> to open Spotlight.{' '}
          <button className="accent" onClick={toggleSpotlight}>
            Try it now
          </button>
        </p>
      </section>
    </div>
  )
}

export default SystemPreferences
