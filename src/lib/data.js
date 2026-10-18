import { addDays, todayKey } from './dates'

// Shape persisted to localStorage:
// {
//   habits: [{ id, title, createdOn: 'YYYY-MM-DD', archivedOn: 'YYYY-MM-DD' | null }],
//   days:   { 'YYYY-MM-DD': { done: [habitId], extras: [{ id, title, done }] } }
// }
// A habit counts toward a day only while it was active, so editing the routine
// never rewrites past progress.

const DEFAULT_HABITS = [
  'Morning workout',
  'Read for 20 minutes',
  'Drink 8 glasses of water',
  'Plan tomorrow',
]

const EMPTY_DAY = { done: [], extras: [] }

export const newId = () => crypto.randomUUID()

export function createInitialData() {
  const today = todayKey()
  return {
    habits: DEFAULT_HABITS.map((title) => ({
      id: newId(),
      title,
      createdOn: today,
      archivedOn: null,
    })),
    days: {},
  }
}

export function getDay(data, key) {
  return data.days[key] ?? EMPTY_DAY
}

export function isHabitActive(habit, key) {
  return habit.createdOn <= key && (!habit.archivedOn || key < habit.archivedOn)
}

export function activeHabits(data, key) {
  return data.habits.filter((h) => isHabitActive(h, key))
}

export function dayProgress(data, key) {
  const habits = activeHabits(data, key)
  const day = getDay(data, key)
  const doneIds = new Set(day.done)
  const done =
    habits.filter((h) => doneIds.has(h.id)).length +
    day.extras.filter((e) => e.done).length
  const total = habits.length + day.extras.length
  return { done, total, pct: total ? Math.round((done / total) * 100) : null }
}

function firstTrackedDay(data, today) {
  const keys = [
    ...data.habits.map((h) => h.createdOn),
    ...Object.keys(data.days),
  ]
  return keys.reduce((min, k) => (k < min ? k : min), today)
}

export function computeStats(data, today) {
  const start = firstTrackedDay(data, today)
  let bestStreak = 0
  let run = 0
  let perfectDays = 0
  let tasksCompleted = 0
  const recent = []
  const monthAgo = addDays(today, -29)

  for (let key = start; key <= today; key = addDays(key, 1)) {
    const { pct, done } = dayProgress(data, key)
    tasksCompleted += done
    if (pct === 100) {
      perfectDays++
      run++
      bestStreak = Math.max(bestStreak, run)
    } else if (pct !== null && key !== today) {
      run = 0
    }
    if (pct !== null && key >= monthAgo) recent.push(pct)
  }

  // An unfinished today doesn't break the streak yet; count back from yesterday.
  let currentStreak = 0
  let key = dayProgress(data, today).pct === 100 ? today : addDays(today, -1)
  while (key >= start) {
    const { pct } = dayProgress(data, key)
    if (pct === 100) currentStreak++
    else if (pct !== null) break
    key = addDays(key, -1)
  }

  const average = recent.length
    ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length)
    : null

  return { currentStreak, bestStreak, perfectDays, tasksCompleted, average }
}
