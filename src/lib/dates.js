// Dates are stored as local "YYYY-MM-DD" keys so they sort lexicographically
// and never drift across timezones the way toISOString() would.

export function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key, amount) {
  const date = fromKey(key)
  date.setDate(date.getDate() + amount)
  return toKey(date)
}

export function todayKey() {
  return toKey(new Date())
}

export function formatLong(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatMedium(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function weekdayShort(key) {
  return fromKey(key).toLocaleDateString(undefined, { weekday: 'short' })
}

export function relativeLabel(key, today) {
  if (key === today) return 'Today'
  if (key === addDays(today, -1)) return 'Yesterday'
  if (key === addDays(today, 1)) return 'Tomorrow'
  return null
}
