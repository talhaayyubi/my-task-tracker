import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  loadFileSystem,
  saveFileSystem,
  createEntry,
  deleteEntry,
  renameEntry,
  writeFile,
  readFile,
  listDirectory,
  searchFileSystem,
  resetFileSystem,
  HOME_PATH,
  DESKTOP_PATH,
} from '../utils/fileSystem'

const wallpapers = [
  'linear-gradient(135deg, #0b3d91 0%, #1e90ff 100%)',
  'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
  'linear-gradient(135deg, #232526 0%, #414345 100%)',
]

export const APP_IDS = {
  finder: 'finder',
  textedit: 'textedit',
  terminal: 'terminal',
  code: 'code',
  safari: 'safari',
  calculator: 'calculator',
  notes: 'notes',
  calendar: 'calendar',
  system: 'system-preferences',
  preview: 'preview',
  music: 'music',
  game: 'game',
}

const defaultDock = [
  APP_IDS.finder,
  APP_IDS.textedit,
  APP_IDS.terminal,
  APP_IDS.code,
  APP_IDS.safari,
  APP_IDS.notes,
  APP_IDS.calendar,
  APP_IDS.system,
]

const initialFileSystem = loadFileSystem()

const defaultWindowPosition = (appId) => {
  switch (appId) {
    case APP_IDS.finder:
      return { x: 140, y: 120, width: 780, height: 520 }
    case APP_IDS.terminal:
      return { x: 260, y: 160, width: 640, height: 420 }
    case APP_IDS.textedit:
      return { x: 320, y: 180, width: 700, height: 480 }
    default:
      return { x: 260, y: 160, width: 720, height: 500 }
  }
}

const persistConfig = {
  name: 'codex_macos_system',
  partialize: (state) => ({
    theme: state.theme,
    wallpaperIndex: state.wallpaperIndex,
    dock: state.dock,
    fileSystem: state.fileSystem,
    iconPositions: state.iconPositions,
  }),
  merge: (persisted, current) => ({
    ...current,
    ...persisted,
    bootStage: 'boot',
    loggedIn: false,
    windows: [],
    zCounter: 1,
    activeWindowId: null,
    showSpotlight: false,
    showLaunchpad: false,
    showMissionControl: false,
    showNotificationCenter: false,
    showControlCenter: false,
  }),
}

const useSystemStore = create(
  persist(
    (set, get) => ({
      bootStage: 'boot',
      loggedIn: false,
      user: {
        name: 'Codex',
        avatar: '🧠',
      },
      theme: 'dark',
      wallpaperIndex: 0,
      wallpapers,
      dock: defaultDock,
      windows: [],
      zCounter: 1,
      activeWindowId: null,
      menuApp: 'Finder',
      showSpotlight: false,
      showLaunchpad: false,
      showMissionControl: false,
      showNotificationCenter: false,
      showControlCenter: false,
      spotlightQuery: '',
      missionControlLayout: [],
      iconPositions: {},
      fileSystem: initialFileSystem,
      desktopIcons: () => listDirectory(get().fileSystem, DESKTOP_PATH),
      setBootStage: (stage) => set({ bootStage: stage }),
      completeBoot: () => set({ bootStage: 'login' }),
      login: () => set({ bootStage: 'desktop', loggedIn: true }),
      logout: () =>
        set({ bootStage: 'login', loggedIn: false, windows: [], activeWindowId: null, showLaunchpad: false }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setWallpaper: (index) => set({ wallpaperIndex: index % wallpapers.length }),
      openWindow: (appId, options = {}) => {
        const { windows, zCounter } = get()
        const existing = windows.find((w) => w.appId === appId && !w.isTransient && !options.allowMultiple)
        if (existing) {
          set({
            windows: windows.map((w) =>
              w.id === existing.id
                ? { ...w, minimized: false, payload: options.payload || w.payload }
                : w,
            ),
            activeWindowId: existing.id,
            zCounter: zCounter + 1,
          })
          return existing.id
        }
        const id = `${appId}-${Date.now()}`
        const basePosition = { ...defaultWindowPosition(appId), ...options.initialBounds }
        const newWindow = {
          id,
          appId,
          title: options.title || options.overrideTitle || appId,
          ...basePosition,
          zIndex: zCounter + 1,
          minimized: false,
          fullscreen: false,
          isTransient: options.isTransient || false,
          payload: options.payload || null,
        }
        set({
          windows: [...windows, newWindow],
          zCounter: zCounter + 1,
          activeWindowId: id,
        })
        return id
      },
      closeWindow: (id) => {
        const { windows, activeWindowId } = get()
        set({
          windows: windows.filter((w) => w.id !== id),
          activeWindowId: activeWindowId === id ? null : activeWindowId,
        })
      },
      minimizeWindow: (id) => {
        const { windows } = get()
        set({
          windows: windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
        })
      },
      toggleFullscreen: (id) => {
        const { windows } = get()
        set({
          windows: windows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  fullscreen: !w.fullscreen,
                  minimized: false,
                }
              : w,
          ),
        })
      },
      updateWindowPosition: (id, position) => {
        const { windows } = get()
        set({
          windows: windows.map((w) => (w.id === id ? { ...w, ...position } : w)),
        })
      },
      updateWindowSize: (id, size) => {
        const { windows } = get()
        set({
          windows: windows.map((w) => (w.id === id ? { ...w, ...size } : w)),
        })
      },
      focusWindow: (id) => {
        const { zCounter, windows } = get()
        const target = windows.find((w) => w.id === id)
        if (!target) return
        set({
          windows: windows.map((w) => (w.id === id ? { ...w, zIndex: zCounter + 1, minimized: false } : w)),
          activeWindowId: id,
          zCounter: zCounter + 1,
        })
      },
      setWindowTitle: (id, title) => {
        const { windows } = get()
        set({
          windows: windows.map((w) => (w.id === id ? { ...w, title } : w)),
        })
      },
      toggleSpotlight: () => set({ showSpotlight: !get().showSpotlight }),
      setSpotlightQuery: (spotlightQuery) => set({ spotlightQuery }),
      toggleLaunchpad: () => set({ showLaunchpad: !get().showLaunchpad }),
      toggleMissionControl: () => set({ showMissionControl: !get().showMissionControl }),
      toggleNotificationCenter: () => set({ showNotificationCenter: !get().showNotificationCenter }),
      toggleControlCenter: () => set({ showControlCenter: !get().showControlCenter }),
      registerMissionControlLayout: (layout) => set({ missionControlLayout: layout }),
      getDirectoryListing: (path) => listDirectory(get().fileSystem, path),
      getIconPosition: (path) => get().iconPositions[path] || null,
      setIconPosition: (path, position) => {
        set({ iconPositions: { ...get().iconPositions, [path]: position } })
      },
      createFile: (parentPath, name) => {
        const { fileSystem } = get()
        const result = createEntry(fileSystem, parentPath, name, 'file')
        const updated = { entries: result.entries }
        saveFileSystem(updated)
        set({ fileSystem: updated })
        return result.createdPath
      },
      createFolder: (parentPath, name) => {
        const { fileSystem } = get()
        const result = createEntry(fileSystem, parentPath, name, 'folder')
        const updated = { entries: result.entries }
        saveFileSystem(updated)
        set({ fileSystem: updated })
        return result.createdPath
      },
      removeEntry: (path) => {
        const { fileSystem } = get()
        const result = deleteEntry(fileSystem, path)
        const updated = { entries: result.entries }
        saveFileSystem(updated)
        set({ fileSystem: updated })
      },
      renameEntry: (path, newName) => {
        const { fileSystem } = get()
        const result = renameEntry(fileSystem, path, newName)
        const updated = { entries: result.entries }
        saveFileSystem(updated)
        set({ fileSystem: updated })
        return result.path || path
      },
      readFile: (path) => readFile(get().fileSystem, path),
      writeFile: (path, content) => {
        const { fileSystem } = get()
        const result = writeFile(fileSystem, path, content)
        const updated = { entries: result.entries }
        saveFileSystem(updated)
        set({ fileSystem: updated })
      },
      search: (query) => searchFileSystem(get().fileSystem, query),
      resetFileSystem: () => {
        const fs = resetFileSystem()
        set({ fileSystem: fs })
      },
    }),
    persistConfig,
  ),
)

export default useSystemStore
export { HOME_PATH, DESKTOP_PATH }
