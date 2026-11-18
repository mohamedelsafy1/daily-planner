import { addDays, dkey, parseKey } from './date'

export const PAGES = 604

export const sumLog = (log: Record<string, number>) => Object.values(log).reduce((a, b) => a + b, 0)

export const daysBetween = (a: string, b: string) =>
  Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86400000)

/** Pages read on or after the challenge start. */
export function readSince(log: Record<string, number>, start: string) {
  return Object.entries(log).reduce((a, [d, n]) => (d >= start ? a + n : a), 0)
}

export function plan(log: Record<string, number>, goal: { start: string; days: number } | null, today = dkey()) {
  const readToday = log[today] ?? 0
  if (!goal) return null
  const done = Math.min(PAGES, readSince(log, goal.start))
  const remaining = Math.max(0, PAGES - done)
  const end = addDays(goal.start, goal.days - 1)
  const daysLeft = Math.max(1, daysBetween(today, end) + 1)
  const overdue = daysBetween(today, end) < 0
  // What was left when today began, spread over the days still available (today included).
  const target = remaining + readToday === 0 ? 0 : Math.ceil((remaining + (today >= goal.start ? readToday : 0)) / daysLeft)
  return {
    done,
    remaining,
    end,
    daysLeft,
    overdue,
    target,
    todayLeft: Math.max(0, target - readToday),
    finished: remaining === 0,
  }
}

export function readStreak(log: Record<string, number>, today = dkey()) {
  let d = (log[today] ?? 0) > 0 ? today : addDays(today, -1)
  let n = 0
  while ((log[d] ?? 0) > 0) {
    n++
    d = addDays(d, -1)
  }
  return n
}
