import { useEffect } from 'react'
import { AddTaskInput } from './ui'
import { RepeatIcon, TrashIcon, XIcon } from './icons'

export function RoutineModal({ habits, onAdd, onRename, onRemove, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const commitRename = (habit, value) => {
    const title = value.trim()
    if (title && title !== habit.title) onRename(habit.id, title)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="routine-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <RepeatIcon className="size-5" />
            </span>
            <div>
              <h2 id="routine-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                Edit daily routine
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                These tasks repeat every day. Changes apply from today — past days keep their history.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <ul className="mb-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {habits.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700">
              No daily tasks yet. Add your first one below.
            </li>
          )}
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center gap-2">
              <input
                defaultValue={habit.title}
                maxLength={120}
                aria-label="Task name"
                onBlur={(e) => commitRename(habit, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-slate-800 transition outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Remove "${habit.title}" from your daily routine?`)) onRemove(habit.id)
                }}
                aria-label={`Remove ${habit.title}`}
                className="rounded-xl p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              >
                <TrashIcon className="size-5" />
              </button>
            </li>
          ))}
        </ul>

        <AddTaskInput placeholder="New daily task, e.g. Meditate 10 min" onAdd={onAdd} autoFocus />

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
