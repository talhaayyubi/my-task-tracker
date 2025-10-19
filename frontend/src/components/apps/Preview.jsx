import { useEffect, useRef, useState } from 'react'

const Preview = () => {
  const canvasRef = useRef(null)
  const [color, setColor] = useState('#ff4f70')
  const [size, setSize] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    context.lineCap = 'round'
    context.lineJoin = 'round'
  }, [])

  const getContext = () => canvasRef.current?.getContext('2d')

  const startDrawing = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const context = getContext()
    if (!context) return
    context.strokeStyle = color
    context.lineWidth = size
    context.beginPath()
    context.moveTo(event.clientX - rect.left, event.clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (event) => {
    if (!isDrawing) return
    const rect = canvasRef.current.getBoundingClientRect()
    const context = getContext()
    if (!context) return
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top)
    context.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const context = getContext()
    if (!context) return
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  return (
    <div className="preview">
      <div className="preview-toolbar">
        <label>
          Color
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>
        <label>
          Size
          <input type="range" min={1} max={20} value={size} onChange={(event) => setSize(Number(event.target.value))} />
        </label>
        <button onClick={clearCanvas}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={900}
        height={520}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
    </div>
  )
}

export default Preview
