import { useEffect, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import useSystemStore from '../../contexts/systemStore'
import { DESKTOP_PATH } from '../../contexts/systemStore'

const detectLanguage = (name) => {
  if (!name) return 'javascript'
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript'
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'py':
      return 'python'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'json':
      return 'json'
    default:
      return 'plaintext'
  }
}

const CodeEditor = ({ windowId }) => {
  const {
    windows,
    readFile,
    writeFile,
    createFile,
    setWindowTitle,
  } = useSystemStore((state) => ({
    windows: state.windows,
    readFile: state.readFile,
    writeFile: state.writeFile,
    createFile: state.createFile,
    setWindowTitle: state.setWindowTitle,
  }))
  const windowData = useMemo(() => windows.find((window) => window.id === windowId), [windows, windowId])
  const [path, setPath] = useState(windowData?.payload?.path || null)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('Ready')
  const language = detectLanguage(path)

  useEffect(() => {
    if (windowData?.payload?.path) {
      const filePath = windowData.payload.path
      setPath(filePath)
      setValue(readFile(filePath) || '')
      setWindowTitle(windowId, filePath.split('/').pop())
    }
  }, [windowData, readFile, windowId, setWindowTitle])

  const handleSave = () => {
    if (!path) {
      const createdPath = createFile(DESKTOP_PATH, 'Untitled.js')
      setPath(createdPath)
      setWindowTitle(windowId, createdPath.split('/').pop())
      writeFile(createdPath, value)
      setStatus('Saved new file to Desktop')
    } else {
      writeFile(path, value)
      setStatus('Changes saved')
    }
    setTimeout(() => setStatus('Ready'), 2000)
  }

  return (
    <div className="code-editor">
      <div className="code-editor-toolbar">
        <span>{path || 'Untitled'}</span>
        <button className="accent" onClick={handleSave}>
          Save
        </button>
        <span>{status}</span>
      </div>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(nextValue) => setValue(nextValue || '')}
        options={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, minimap: { enabled: false } }}
      />
    </div>
  )
}

export default CodeEditor
