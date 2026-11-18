import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'

export type Theme = 'system' | 'light' | 'dark'
export type TasbeehView = 'garden' | 'well' | 'classic'

const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* storage unavailable */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* storage unavailable */
    }
  },
}

type Prefs = {
  theme: Theme
  sound: boolean
  volume: number
  haptics: boolean
  tasbeehView: TasbeehView
  set: (p: Partial<Omit<Prefs, 'set'>>) => void
}

export const usePrefs = create<Prefs>()(
  persist(
    (set) => ({
      theme: 'system',
      sound: true,
      volume: 0.6,
      haptics: true,
      tasbeehView: 'garden',
      set: (p) => set(p),
    }),
    { name: 'mukhattati-prefs', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
)

const mq = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : undefined

export function applyTheme() {
  const t = usePrefs.getState().theme
  const dark = t === 'dark' || (t === 'system' && !!mq?.matches)
  document.documentElement.classList.toggle('dark', dark)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0F1619' : '#EDF1EF')
}

export function initTheme() {
  applyTheme()
  usePrefs.subscribe(applyTheme)
  mq?.addEventListener?.('change', applyTheme)
}
