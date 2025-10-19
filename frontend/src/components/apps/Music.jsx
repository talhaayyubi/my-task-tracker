import { useEffect, useRef, useState } from 'react'

const PLAYLIST = [
  {
    id: 1,
    title: 'Sunrise Drive',
    artist: 'Codex Ensemble',
    url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
  },
  {
    id: 2,
    title: 'Neon Skyline',
    artist: 'Synth Bay',
    url: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
  },
  {
    id: 3,
    title: 'Calm Seas',
    artist: 'Lofi Tides',
    url: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3',
  },
]

const Music = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentIndex])

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length)
    setIsPlaying(true)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length)
    setIsPlaying(true)
  }

  const currentTrack = PLAYLIST[currentIndex]

  return (
    <div className="music">
      <div className="music-now-playing">
        <h2>{currentTrack.title}</h2>
        <p>{currentTrack.artist}</p>
      </div>
      <div className="music-controls">
        <button onClick={handlePrev}>⏮</button>
        <button className="accent" onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleNext}>⏭</button>
      </div>
      <div className="music-playlist">
        {PLAYLIST.map((track, index) => (
          <button key={track.id} className={currentIndex === index ? 'active' : ''} onClick={() => setCurrentIndex(index)}>
            <strong>{track.title}</strong>
            <span>{track.artist}</span>
          </button>
        ))}
      </div>
      <audio ref={audioRef} src={currentTrack.url} onEnded={handleNext} />
    </div>
  )
}

export default Music
