import { useEffect, useMemo, useState } from 'react'
import useSystemStore from '../../contexts/systemStore'
import { listDirectory, getEntry } from '../../utils/fileSystem'

const NOTES_FOLDER = '/Documents/Notes'

const Notes = ({ windowId }) => {
  const {
    fileSystem,
    createFolder,
    createFile,
    readFile,
    writeFile,
    removeEntry,
    setWindowTitle,
  } = useSystemStore((state) => ({
    fileSystem: state.fileSystem,
    createFolder: state.createFolder,
    createFile: state.createFile,
    readFile: state.readFile,
    writeFile: state.writeFile,
    removeEntry: state.removeEntry,
    setWindowTitle: state.setWindowTitle,
  }))
  const [selectedPath, setSelectedPath] = useState(null)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!getEntry(fileSystem, NOTES_FOLDER)) {
      createFolder('/Documents', 'Notes')
    }
  }, [fileSystem, createFolder])

  const notes = useMemo(() => {
    const entries = listDirectory(fileSystem, NOTES_FOLDER)
    return entries.filter((entry) => entry.type === 'file')
  }, [fileSystem])

  useEffect(() => {
    if (selectedPath) {
      const data = readFile(selectedPath)
      setContent(data || '')
      setWindowTitle(windowId, selectedPath.split('/').pop())
    } else if (notes.length) {
      setSelectedPath(notes[0].path)
    }
  }, [selectedPath, readFile, notes, windowId, setWindowTitle])

  const handleNewNote = () => {
    const path = createFile(NOTES_FOLDER, 'New Note.txt')
    setSelectedPath(path)
    setContent('')
  }

  const handleDelete = () => {
    if (!selectedPath) return
    removeEntry(selectedPath)
    setSelectedPath(null)
    setContent('')
  }

  const handleSave = () => {
    if (!selectedPath) return
    writeFile(selectedPath, content)
  }

  return (
    <div className="notes">
      <div className="notes-sidebar">
        <button className="accent" onClick={handleNewNote}>
          New Note
        </button>
        <button onClick={handleDelete} disabled={!selectedPath}>
          Delete
        </button>
        <div className="notes-list">
          {notes.map((note) => (
            <button
              key={note.path}
              className={selectedPath === note.path ? 'active' : ''}
              onClick={() => setSelectedPath(note.path)}
            >
              <strong>{note.name.replace('.txt', '')}</strong>
              <span>{(readFile(note.path) || '').slice(0, 80)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="notes-editor">
        {selectedPath ? (
          <textarea value={content} onChange={(event) => setContent(event.target.value)} />
        ) : (
          <div className="notes-empty">Select or create a note to begin.</div>
        )}
        <button className="accent" onClick={handleSave} disabled={!selectedPath}>
          Save
        </button>
      </div>
    </div>
  )
}

export default Notes
