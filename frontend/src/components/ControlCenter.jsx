import { useState } from 'react'
import useSystemStore from '../contexts/systemStore'

const ControlCenter = () => {
  const { toggleControlCenter } = useSystemStore((state) => ({
    toggleControlCenter: state.toggleControlCenter,
  }))
  const [volume, setVolume] = useState(70)
  const [brightness, setBrightness] = useState(80)
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(true)

  return (
    <aside className="control-center" role="dialog" aria-modal>
      <header>
        <h3>Control Center</h3>
        <button onClick={toggleControlCenter}>Close</button>
      </header>
      <div className="control-grid">
        <button className={wifi ? 'active' : ''} onClick={() => setWifi((prev) => !prev)}>
          Wi-Fi
        </button>
        <button className={bluetooth ? 'active' : ''} onClick={() => setBluetooth((prev) => !prev)}>
          Bluetooth
        </button>
        <div className="slider">
          <label>Brightness</label>
          <input type="range" min={0} max={100} value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} />
        </div>
        <div className="slider">
          <label>Volume</label>
          <input type="range" min={0} max={100} value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
        </div>
      </div>
    </aside>
  )
}

export default ControlCenter
