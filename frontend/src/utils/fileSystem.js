const STORAGE_KEY = 'codex_macos_fs'

const cloneEntries = (entries) => JSON.parse(JSON.stringify(entries))

export const HOME_PATH = '/'
export const DESKTOP_PATH = '/Desktop'

const defaultFileSystem = () => ({
  entries: {
    '/': {
      type: 'folder',
      name: 'codex',
      children: ['/Desktop', '/Documents', '/Downloads', '/Music', '/Pictures', '/Applications'],
    },
    '/Desktop': {
      type: 'folder',
      name: 'Desktop',
      children: ['/Desktop/Welcome.txt', '/Desktop/Getting-Started.rtf'],
    },
    '/Documents': {
      type: 'folder',
      name: 'Documents',
      children: [],
    },
    '/Downloads': {
      type: 'folder',
      name: 'Downloads',
      children: [],
    },
    '/Music': {
      type: 'folder',
      name: 'Music',
      children: [],
    },
    '/Pictures': {
      type: 'folder',
      name: 'Pictures',
      children: [],
    },
    '/Applications': {
      type: 'folder',
      name: 'Applications',
      children: [],
    },
    '/Desktop/Welcome.txt': {
      type: 'file',
      name: 'Welcome.txt',
      content: 'Welcome to Codex macOS. Use Finder or Spotlight to explore. Enjoy!',
    },
    '/Desktop/Getting-Started.rtf': {
      type: 'file',
      name: 'Getting-Started.rtf',
      content: 'This demo environment simulates macOS Big Sur. Create folders, write notes, or open apps from the Dock.',
    },
  },
})

export const loadFileSystem = () => {
  if (typeof localStorage === 'undefined') {
    return defaultFileSystem()
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultFileSystem()
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.entries) return defaultFileSystem()
    return parsed
  } catch (error) {
    console.error('Failed to load file system from storage', error)
    return defaultFileSystem()
  }
}

export const saveFileSystem = (fs) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fs))
}

const normalizeName = (name) => name.trim().replace(/\s+/g, ' ')

export const joinPath = (base, name) => {
  if (base === '/') return `/${name}`
  return `${base.replace(/\/$/, '')}/${name}`
}

export const getParentPath = (path) => {
  if (path === '/' || !path) return null
  const segments = path.split('/').filter(Boolean)
  segments.pop()
  if (!segments.length) return '/'
  return `/${segments.join('/')}`
}

export const getEntry = (fs, path) => fs.entries[path] || null

export const listDirectory = (fs, path) => {
  const entry = getEntry(fs, path)
  if (!entry || entry.type !== 'folder') return []
  return entry.children
    .map((childPath) => {
      const child = getEntry(fs, childPath)
      return child
        ? {
            ...child,
            path: childPath,
          }
        : null
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'folder' ? -1 : 1
    })
}

export const createEntry = (fs, parentPath, name, type) => {
  const normalized = normalizeName(name)
  if (!normalized) {
    throw new Error('Name cannot be empty')
  }
  const parent = getEntry(fs, parentPath)
  if (!parent || parent.type !== 'folder') {
    throw new Error('Parent path is not a folder')
  }
  const newPathBase = joinPath(parentPath, normalized)
  let newPath = newPathBase
  let counter = 2
  while (fs.entries[newPath]) {
    newPath = `${newPathBase} ${counter}`
    counter += 1
  }

  const newEntries = cloneEntries(fs.entries)
  newEntries[newPath] = type === 'folder'
    ? { type: 'folder', name: normalized, children: [] }
    : { type: 'file', name: normalized, content: '' }
  const parentClone = { ...newEntries[parentPath], children: [...newEntries[parentPath].children, newPath] }
  newEntries[parentPath] = parentClone
  return { entries: newEntries, createdPath: newPath }
}

const collectDescendants = (entries, path) => {
  const entry = entries[path]
  if (!entry || entry.type !== 'folder') return []
  return entry.children.reduce((acc, child) => {
    acc.push(child)
    const childEntry = entries[child]
    if (childEntry && childEntry.type === 'folder') {
      acc.push(...collectDescendants(entries, child))
    }
    return acc
  }, [])
}

export const deleteEntry = (fs, path) => {
  const parentPath = getParentPath(path)
  if (!parentPath) return fs
  const parent = getEntry(fs, parentPath)
  if (!parent || parent.type !== 'folder') return fs
  const newEntries = cloneEntries(fs.entries)
  const toRemove = [path, ...collectDescendants(newEntries, path)]
  toRemove.forEach((target) => {
    delete newEntries[target]
  })
  newEntries[parentPath] = {
    ...newEntries[parentPath],
    children: newEntries[parentPath].children.filter((child) => child !== path),
  }
  return { entries: newEntries }
}

export const renameEntry = (fs, path, newName) => {
  if (path === '/') return fs
  const parentPath = getParentPath(path)
  if (!parentPath) return fs
  const normalized = normalizeName(newName)
  if (!normalized) return fs
  const parent = getEntry(fs, parentPath)
  if (!parent || parent.type !== 'folder') return fs
  const newEntries = cloneEntries(fs.entries)
  const entry = { ...newEntries[path] }
  const newPathBase = joinPath(parentPath, normalized)
  let newPath = newPathBase
  let counter = 2
  while (newEntries[newPath] && newPath !== path) {
    newPath = `${newPathBase} ${counter}`
    counter += 1
  }
  if (newPath !== path) {
    const updatedEntries = cloneEntries(newEntries)
    const entriesArray = Object.entries(updatedEntries)
    entriesArray.forEach(([key, value]) => {
      if (key === path) return
      if (key.startsWith(`${path}/`)) {
        const replacedKey = key.replace(path, newPath)
        updatedEntries[replacedKey] = { ...value }
        delete updatedEntries[key]
      }
    })
    entry.name = normalized
    updatedEntries[newPath] = { ...entry }
    delete updatedEntries[path]
    Object.values(updatedEntries).forEach((node) => {
      if (node.type === 'folder') {
        node.children = node.children.map((childPath) =>
          childPath.startsWith(path) ? childPath.replace(path, newPath) : childPath,
        )
      }
    })
    updatedEntries[parentPath] = {
      ...updatedEntries[parentPath],
      children: updatedEntries[parentPath].children.map((child) => (child === path ? newPath : child)),
    }
    return { entries: updatedEntries, path: newPath }
  }
  entry.name = normalized
  newEntries[path] = entry
  return { entries: newEntries, path }
}

export const writeFile = (fs, path, content) => {
  const entry = getEntry(fs, path)
  if (!entry || entry.type !== 'file') {
    throw new Error('Path is not a file')
  }
  const newEntries = cloneEntries(fs.entries)
  newEntries[path] = { ...entry, content }
  return { entries: newEntries }
}

export const readFile = (fs, path) => {
  const entry = getEntry(fs, path)
  if (!entry || entry.type !== 'file') return ''
  return entry.content || ''
}

export const searchFileSystem = (fs, query) => {
  const term = query.trim().toLowerCase()
  if (!term) return []
  return Object.entries(fs.entries)
    .filter(([path, entry]) => path !== '/' && entry.name.toLowerCase().includes(term))
    .map(([path, entry]) => ({ ...entry, path }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const resetFileSystem = () => {
  const fs = defaultFileSystem()
  saveFileSystem(fs)
  return fs
}

export default {
  loadFileSystem,
  saveFileSystem,
  createEntry,
  deleteEntry,
  renameEntry,
  listDirectory,
  writeFile,
  readFile,
  searchFileSystem,
  resetFileSystem,
  HOME_PATH,
  DESKTOP_PATH,
  getParentPath,
  getEntry,
}
