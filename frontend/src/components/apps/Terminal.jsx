import { useEffect, useMemo, useRef, useState } from 'react'
import useSystemStore from '../../contexts/systemStore'
import { listDirectory, joinPath, getEntry } from '../../utils/fileSystem'

const formatPath = (path) => (path === '/' ? '~' : `~${path}`)

const COMMANDS = ['help', 'clear', 'ls', 'pwd', 'cd', 'cat', 'touch', 'mkdir', 'rm', 'python']

const Terminal = () => {
  const {
    fileSystem,
    createFile,
    createFolder,
    removeEntry,
  } = useSystemStore((state) => ({
    fileSystem: state.fileSystem,
    createFile: state.createFile,
    createFolder: state.createFolder,
    removeEntry: state.removeEntry,
  }))
  const [cwd, setCwd] = useState('/')
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  const prompt = useMemo(() => `codex@macos ${formatPath(cwd)} %`, [cwd])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [history])

  const resolvePath = (target) => {
    if (!target || target === '~') return '/'
    if (target.startsWith('~/')) {
      target = target.replace('~', '')
    } else if (!target.startsWith('/')) {
      target = joinPath(cwd, target)
    }
    const segments = target.split('/').filter(Boolean)
    const stack = []
    segments.forEach((segment) => {
      if (segment === '..') {
        stack.pop()
      } else if (segment !== '.') {
        stack.push(segment)
      }
    })
    return `/${stack.join('/')}` || '/'
  }

  const handleCommand = (commandLine) => {
    const [command, ...args] = commandLine.trim().split(/\s+/)
    const output = []
    if (!command) return

    switch (command) {
      case 'help':
        output.push('Commands: ' + COMMANDS.join(', '))
        break
      case 'clear':
        setHistory([])
        return
      case 'pwd':
        output.push(formatPath(cwd))
        break
      case 'ls': {
        const target = args[0] ? resolvePath(args[0]) : cwd
        const entries = listDirectory(fileSystem, target)
        output.push(entries.map((entry) => (entry.type === 'folder' ? `${entry.name}/` : entry.name)).join('  '))
        break
      }
      case 'cd': {
        const target = args[0] ? resolvePath(args[0]) : '/'
        const entry = getEntry(fileSystem, target)
        if (entry && entry.type === 'folder') {
          setCwd(target)
        } else {
          output.push(`cd: no such file or directory: ${args[0] || ''}`)
        }
        break
      }
      case 'cat': {
        if (!args.length) {
          output.push('usage: cat <file>')
          break
        }
        const target = resolvePath(args[0])
        const entry = getEntry(fileSystem, target)
        if (entry && entry.type === 'file') {
          output.push(entry.content || '')
        } else {
          output.push(`cat: ${args[0]}: No such file`)
        }
        break
      }
      case 'touch': {
        if (!args.length) {
          output.push('usage: touch <file>')
          break
        }
        const target = resolvePath(args[0])
        const parent = target.split('/').slice(0, -1).join('/') || '/'
        const name = target.split('/').pop()
        try {
          createFile(parent, name)
          output.push(`created ${args[0]}`)
        } catch (error) {
          output.push(`touch: ${error.message}`)
        }
        break
      }
      case 'mkdir': {
        if (!args.length) {
          output.push('usage: mkdir <dir>')
          break
        }
        const target = resolvePath(args[0])
        const parent = target.split('/').slice(0, -1).join('/') || '/'
        const name = target.split('/').pop()
        try {
          createFolder(parent, name)
          output.push(`created directory ${args[0]}`)
        } catch (error) {
          output.push(`mkdir: ${error.message}`)
        }
        break
      }
      case 'rm': {
        if (!args.length) {
          output.push('usage: rm <path>')
          break
        }
        const target = resolvePath(args[0])
        try {
          removeEntry(target)
          output.push(`removed ${args[0]}`)
        } catch (error) {
          output.push(`rm: ${error.message}`)
        }
        break
      }
      case 'python': {
        const code = args.join(' ')
        if (!code) {
          output.push('usage: python <expression>')
          break
        }
        try {
          // eslint-disable-next-line no-new-func
          const result = Function(`return (${code})`)()
          output.push(String(result))
        } catch (error) {
          output.push(`Python error: ${error.message}`)
        }
        break
      }
      default:
        output.push(`command not found: ${command}`)
    }

    setHistory((prev) => [...prev, { prompt, command: commandLine, output }])
    setHistoryIndex(-1)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    handleCommand(input)
    setInput('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1)
      const nextCommand = history[nextIndex]?.command || ''
      setInput(nextCommand)
      setHistoryIndex(nextIndex)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex < 0) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= history.length) {
        setInput('')
        setHistoryIndex(-1)
      } else {
        setInput(history[nextIndex].command)
        setHistoryIndex(nextIndex)
      }
    } else if (event.key === 'Tab') {
      event.preventDefault()
      const completions = COMMANDS.filter((command) => command.startsWith(input))
      if (completions.length === 1) {
        setInput(completions[0] + ' ')
      }
    }
  }

  return (
    <div className="terminal">
      <div className="terminal-output" ref={scrollRef}>
        <div className="terminal-line">Welcome to Codex Shell. Type `help` to get started.</div>
        {history.map((entry) => (
          <div key={`${entry.prompt}-${entry.command}`} className="terminal-entry">
            <div className="terminal-line">
              <span className="prompt">{entry.prompt}</span> {entry.command}
            </div>
            {entry.output.map((line, index) => (
              <div key={index} className="terminal-line">
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>
      <form className="terminal-input" onSubmit={handleSubmit}>
        <span className="prompt">{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </form>
    </div>
  )
}

export default Terminal
