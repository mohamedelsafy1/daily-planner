import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'

export type Energy = 'deep' | 'light'
export type Task = { id: string; title: string; date: string; done: boolean; energy?: Energy }
export type WTask = { id: string; title: string; week: string; done: boolean }
export type Group = 'prayer' | 'religion' | 'life'
export type Habit = { id: string; name: string; group: Group; icon: string }
export type Logs = Record<string, string[]>
export type AdhkarKind = 'am' | 'pm'
export type Tasbeeh = { dhikr: string; count: number; total: number; byDay: Record<string, number> }

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)

// Falls back to memory when localStorage is unavailable.
const mem: Record<string, string> = {}
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return mem[k] ?? null
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      mem[k] = v
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      delete mem[k]
    }
  },
}

const DEFAULT_HABITS: Habit[] = [
  { id: 'fajr', name: 'الفجر', group: 'prayer', icon: 'sunrise' },
  { id: 'dhuhr', name: 'الظهر', group: 'prayer', icon: 'sun' },
  { id: 'asr', name: 'العصر', group: 'prayer', icon: 'cloudsun' },
  { id: 'maghrib', name: 'المغرب', group: 'prayer', icon: 'sunset' },
  { id: 'isha', name: 'العشاء', group: 'prayer', icon: 'moonstar' },
  { id: 'adhkar-am', name: 'أذكار الصباح', group: 'religion', icon: 'sparkles' },
  { id: 'adhkar-pm', name: 'أذكار المساء', group: 'religion', icon: 'sparkles' },
  { id: 'wird', name: 'ورد القرآن', group: 'religion', icon: 'book' },
  { id: 'rawatib', name: 'السنن الرواتب', group: 'religion', icon: 'heart' },
  { id: 'witr', name: 'الوتر', group: 'religion', icon: 'moon' },
  { id: 'gym', name: 'الجيم', group: 'life', icon: 'dumbbell' },
  { id: 'reading', name: 'القراءة', group: 'life', icon: 'library' },
  { id: 'water', name: 'شرب الماء', group: 'life', icon: 'droplets' },
]

type State = {
  tasks: Task[]
  wtasks: WTask[]
  habits: Habit[]
  logs: Logs
  adhkar: Record<string, Record<string, number>> // key: yyyy-mm-dd:am|pm -> dhikr id -> taps so far
  tasbeeh: Tasbeeh
  scores: Record<string, number>
  tapAdhkar: (date: string, kind: AdhkarKind, id: string, needs: Record<string, number>, delta?: number) => void
  resetAdhkar: (date: string, kind: AdhkarKind) => void
  tapTasbeeh: (date: string) => void
  resetTasbeeh: () => void
  setTasbeehDhikr: (dhikr: string) => void
  saveScore: (game: string, value: number, better: 'high' | 'low') => boolean
  addTask: (title: string, date: string, energy?: Energy) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
  addWTask: (title: string, week: string) => void
  toggleWTask: (id: string) => void
  removeWTask: (id: string) => void
  toggleHabit: (date: string, id: string) => void
  addHabit: (name: string, group: Group, icon: string) => void
  removeHabit: (id: string) => void
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: [],
      wtasks: [],
      habits: DEFAULT_HABITS,
      logs: {},
      adhkar: {},
      tasbeeh: { dhikr: 'سبحان الله', count: 0, total: 0, byDay: {} },
      scores: {},
      tapAdhkar: (date, kind, id, needs, delta = 1) =>
        set((s) => {
          const key = `${date}:${kind}`
          const cur = { ...(s.adhkar[key] ?? {}) }
          cur[id] = Math.max(0, Math.min(needs[id], (cur[id] ?? 0) + delta))
          const complete = Object.entries(needs).every(([k, n]) => (cur[k] ?? 0) >= n)
          const habit = kind === 'am' ? 'adhkar-am' : 'adhkar-pm'
          const day = s.logs[date] ?? []
          const has = day.includes(habit)
          const logs =
            complete && !has
              ? { ...s.logs, [date]: [...day, habit] }
              : !complete && has
                ? { ...s.logs, [date]: day.filter((x) => x !== habit) }
                : s.logs
          return { adhkar: { ...s.adhkar, [key]: cur }, logs }
        }),
      resetAdhkar: (date, kind) =>
        set((s) => {
          const key = `${date}:${kind}`
          const { [key]: _drop, ...rest } = s.adhkar
          const habit = kind === 'am' ? 'adhkar-am' : 'adhkar-pm'
          const day = (s.logs[date] ?? []).filter((x) => x !== habit)
          return { adhkar: rest, logs: { ...s.logs, [date]: day } }
        }),
      tapTasbeeh: (date) =>
        set((s) => ({
          tasbeeh: {
            ...s.tasbeeh,
            count: s.tasbeeh.count + 1,
            total: s.tasbeeh.total + 1,
            byDay: { ...s.tasbeeh.byDay, [date]: (s.tasbeeh.byDay[date] ?? 0) + 1 },
          },
        })),
      resetTasbeeh: () => set((s) => ({ tasbeeh: { ...s.tasbeeh, count: 0 } })),
      setTasbeehDhikr: (dhikr) => set((s) => ({ tasbeeh: { ...s.tasbeeh, dhikr, count: 0 } })),
      saveScore: (game, value, better) => {
        const old = get().scores[game]
        const isBest = old === undefined || (better === 'high' ? value > old : value < old)
        if (isBest) set((s) => ({ scores: { ...s.scores, [game]: value } }))
        return isBest
      },
      addTask: (title, date, energy) =>
        set((s) => ({ tasks: [...s.tasks, { id: uid(), title, date, done: false, energy }] })),
      toggleTask: (id) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      addWTask: (title, week) =>
        set((s) => ({ wtasks: [...s.wtasks, { id: uid(), title, week, done: false }] })),
      toggleWTask: (id) =>
        set((s) => ({ wtasks: s.wtasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeWTask: (id) => set((s) => ({ wtasks: s.wtasks.filter((t) => t.id !== id) })),
      toggleHabit: (date, id) =>
        set((s) => {
          const cur = s.logs[date] ?? []
          const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
          return { logs: { ...s.logs, [date]: next } }
        }),
      addHabit: (name, group, icon) =>
        set((s) => ({ habits: [...s.habits, { id: uid(), name, group, icon }] })),
      removeHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
    }),
    { name: 'mukhattati-v1', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
)
