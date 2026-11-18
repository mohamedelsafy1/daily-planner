import { addDays } from './date'
import type { Habit, Logs } from '../store'

export const doneSet = (logs: Logs, d: string) => new Set(logs[d] ?? [])

/** Share of habits completed on a day (0..1). */
export function dayScore(logs: Logs, habits: Habit[], d: string) {
  if (!habits.length) return 0
  const s = doneSet(logs, d)
  return habits.filter((h) => s.has(h.id)).length / habits.length
}

export function prayersComplete(logs: Logs, habits: Habit[], d: string) {
  const p = habits.filter((h) => h.group === 'prayer')
  if (!p.length) return false
  const s = doneSet(logs, d)
  return p.every((h) => s.has(h.id))
}

/** Consecutive days ending today (or yesterday, if today isn't done yet). */
export function streak(pred: (d: string) => boolean, today: string) {
  let d = pred(today) ? today : addDays(today, -1)
  let n = 0
  while (pred(d) && n < 3650) {
    n++
    d = addDays(d, -1)
  }
  return n
}

export function bestStreak(pred: (d: string) => boolean, today: string, lookback = 365) {
  let best = 0
  let cur = 0
  for (let i = lookback; i >= 0; i--) {
    if (pred(addDays(today, -i))) {
      cur++
      best = Math.max(best, cur)
    } else cur = 0
  }
  return best
}

export function habitRate(logs: Logs, id: string, today: string, days: number) {
  let c = 0
  for (let i = 0; i < days; i++) if (doneSet(logs, addDays(today, -i)).has(id)) c++
  return c / days
}

export const habitStreak = (logs: Logs, id: string, today: string) =>
  streak((d) => doneSet(logs, d).has(id), today)
