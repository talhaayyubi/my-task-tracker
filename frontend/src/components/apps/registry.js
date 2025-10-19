import Finder from './Finder'
import TextEdit from './TextEdit'
import Terminal from './Terminal'
import CodeEditor from './CodeEditor'
import Safari from './Safari'
import Calculator from './Calculator'
import Notes from './Notes'
import Calendar from './Calendar'
import SystemPreferences from './SystemPreferences'
import Preview from './Preview'
import Music from './Music'
import Game from './Game'
import { APP_IDS } from '../../contexts/systemStore'

export const APP_REGISTRY = {
  [APP_IDS.finder]: {
    id: APP_IDS.finder,
    name: 'Finder',
    title: 'Finder',
    icon: '😊',
    color: 'linear-gradient(135deg, #25a9ff, #0070f3)',
    component: Finder,
  },
  [APP_IDS.textedit]: {
    id: APP_IDS.textedit,
    name: 'TextEdit',
    title: 'TextEdit',
    icon: '📝',
    color: 'linear-gradient(135deg, #f5d020, #f53803)',
    component: TextEdit,
  },
  [APP_IDS.terminal]: {
    id: APP_IDS.terminal,
    name: 'Terminal',
    title: 'Terminal',
    icon: '⌘',
    color: 'linear-gradient(135deg, #222, #555)',
    component: Terminal,
  },
  [APP_IDS.code]: {
    id: APP_IDS.code,
    name: 'Code',
    title: 'Code Editor',
    icon: '</>',
    color: 'linear-gradient(135deg, #8a2be2, #00d4ff)',
    component: CodeEditor,
  },
  [APP_IDS.safari]: {
    id: APP_IDS.safari,
    name: 'Safari',
    title: 'Safari',
    icon: '🧭',
    color: 'linear-gradient(135deg, #66a6ff, #1e3c72)',
    component: Safari,
  },
  [APP_IDS.calculator]: {
    id: APP_IDS.calculator,
    name: 'Calculator',
    title: 'Calculator',
    icon: '🧮',
    color: 'linear-gradient(135deg, #f2994a, #f2c94c)',
    component: Calculator,
  },
  [APP_IDS.notes]: {
    id: APP_IDS.notes,
    name: 'Notes',
    title: 'Notes',
    icon: '📒',
    color: 'linear-gradient(135deg, #f6d365, #fda085)',
    component: Notes,
  },
  [APP_IDS.calendar]: {
    id: APP_IDS.calendar,
    name: 'Calendar',
    title: 'Calendar',
    icon: '🗓️',
    color: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
    component: Calendar,
  },
  [APP_IDS.system]: {
    id: APP_IDS.system,
    name: 'Settings',
    title: 'System Preferences',
    icon: '⚙️',
    color: 'linear-gradient(135deg, #4b79a1, #283e51)',
    component: SystemPreferences,
  },
  [APP_IDS.preview]: {
    id: APP_IDS.preview,
    name: 'Preview',
    title: 'Preview',
    icon: '🖌️',
    color: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    component: Preview,
  },
  [APP_IDS.music]: {
    id: APP_IDS.music,
    name: 'Music',
    title: 'Music',
    icon: '🎵',
    color: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
    component: Music,
  },
  [APP_IDS.game]: {
    id: APP_IDS.game,
    name: 'Mines',
    title: 'Minesweeper',
    icon: '🎮',
    color: 'linear-gradient(135deg, #00c9ff, #92fe9d)',
    component: Game,
  },
}

export const DOCK_APPS = [
  APP_IDS.finder,
  APP_IDS.safari,
  APP_IDS.textedit,
  APP_IDS.terminal,
  APP_IDS.code,
  APP_IDS.notes,
  APP_IDS.calendar,
  APP_IDS.music,
  APP_IDS.system,
]
