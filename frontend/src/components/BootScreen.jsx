import { useEffect, useState } from 'react'

const BootScreen = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15
        return next >= 100 ? 100 : next
      })
    }, 220)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="boot-screen">
      <div className="apple-logo" aria-hidden>
        <svg viewBox="0 0 1024 1024" width="96" height="96">
          <path
            fill="currentColor"
            d="M685.6 321.2c-41.3 0-95.5-29.3-124.4-29.3-31.6 0-80.4 27.9-130.7 27.9-102.8 0-216.2-90.9-216.2-222.3C214.3 48.2 249.9 0 307.7 0c41.2 0 85 29 114.5 29s83.7-31.5 147-31.5c23.5 0 84.9 2.3 129.3 43.6-5.6 3.8-96.2 56.2-96.2 167.9 0 131.5 114.1 165.2 117.2 166.2-0.9 2.7-19.2 45-64.9 89z"
          />
          <path
            fill="currentColor"
            d="M858.7 737.9c-25.6 59.3-53.4 118.8-96.3 184.2-36.6 55.7-83.2 125.1-143.7 125.9-53.6 1-70.9-32.6-148.3-32.2-77.4 0.4-96.9 33.2-150.6 32.2-60.5-1.1-106.8-63.3-143.4-119-78.4-118.7-138.5-334.8-59.5-482.1 41.1-76.2 114.4-124.6 195.1-125.7 60.9-1 118.4 34.4 148.3 34.4 29.5 0 85.8-42.5 149.9-36.2 25.5 1 116.7 10.4 171.8 95.6-4.4 2.7-102.8 60.4-101.8 179.4 1 142.3 127.4 189.1 129 189.7z"
          />
        </svg>
      </div>
      <div className="boot-progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="boot-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default BootScreen
