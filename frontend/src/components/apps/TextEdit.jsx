import { useEffect, useMemo, useRef, useState } from 'react'
import useSystemStore from '../../contexts/systemStore'
import { DESKTOP_PATH } from '../../contexts/systemStore'

const FONT_SIZES = [12, 14, 16, 18, 24, 32]
const FONT_FAMILIES = ['SF Pro', 'Georgia', 'Courier New', 'Arial', 'Times New Roman']

const TextEdit = ({ windowId }) => {
  const {
    windows,
    writeFile,
    readFile,
    createFile,
    setWindowTitle,
  } = useSystemStore((state) => ({
    windows: state.windows,
    writeFile: state.writeFile,
    readFile: state.readFile,
    createFile: state.createFile,
    setWindowTitle: state.setWindowTitle,
  }))
  const windowData = useMemo(() => windows.find((window) => window.id === windowId), [windows, windowId])
  const [path, setPath] = useState(windowData?.payload?.path || null)
  const [status, setStatus] = useState('Ready')
  const editorRef = useRef(null)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0])

  useEffect(() => {
    if (windowData?.payload?.path) {
      setPath(windowData.payload.path)
      const content = readFile(windowData.payload.path)
      if (editorRef.current) {
        editorRef.current.innerHTML = content || ''
      }
      setWindowTitle(windowId, windowData.payload.path.split('/').pop())
    }
  }, [windowData, readFile, windowId, setWindowTitle])

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value)
  }

  const handleSave = () => {
    if (!editorRef.current) return
    let targetPath = path
    if (!targetPath) {
      const createdPath = createFile(DESKTOP_PATH, 'Untitled.rtf')
      targetPath = createdPath
      setPath(createdPath)
      setWindowTitle(windowId, createdPath.split('/').pop())
    }
    writeFile(targetPath, editorRef.current.innerHTML)
    setStatus(`Saved to ${targetPath.split('/').pop()}`)
    setTimeout(() => setStatus('Ready'), 2000)
  }

  return (
    <div className="textedit">
      <div className="textedit-toolbar">
        <div className="group">
          <button onClick={() => applyFormat('bold')} aria-label="Bold">
            B
          </button>
          <button onClick={() => applyFormat('italic')} aria-label="Italic">
            I
          </button>
          <button onClick={() => applyFormat('underline')} aria-label="Underline">
            U
          </button>
        </div>
        <div className="group">
          <button onClick={() => applyFormat('justifyLeft')} aria-label="Align Left">
            ⬅
          </button>
          <button onClick={() => applyFormat('justifyCenter')} aria-label="Align Center">
            ⬌
          </button>
          <button onClick={() => applyFormat('justifyRight')} aria-label="Align Right">
            ➡
          </button>
        </div>
        <div className="group">
          <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}>
            {FONT_FAMILIES.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>
          <select value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))}>
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="group">
          <button className="accent" onClick={handleSave}>
            Save
          </button>
        </div>
        <span className="textedit-status">{status}</span>
      </div>
      <div
        className="textedit-editor"
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        style={{ fontFamily, fontSize }}
      />
    </div>
  )
}

export default TextEdit
