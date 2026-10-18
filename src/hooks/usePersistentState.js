import { useEffect, useState } from 'react'

export function usePersistentState(storageKey, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw)
    } catch {
      // Corrupt or unavailable storage: fall back to the initial value.
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // Storage full or blocked (private mode); keep working in memory.
    }
  }, [storageKey, state])

  return [state, setState]
}
