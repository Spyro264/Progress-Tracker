import { useState } from 'react'
import { CheckIcon, PlusIcon, TrashIcon } from './icons'

export function Card({ className = '', children }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </section>
  )
}

export function SectionTitle({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Icon className="size-4" />
          </span>
        )}
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

export function TaskItem({ title, done, disabled, onToggle, onDelete }) {
  return (
    <li
      className={`group flex items-center gap-1 rounded-xl border transition-colors ${
        done
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5'
          : 'border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50'
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        disabled={disabled}
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 text-left disabled:cursor-not-allowed"
      >
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
            done
              ? 'scale-100 border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 text-transparent group-hover:border-indigo-400 dark:border-slate-600'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <CheckIcon className="size-4" strokeWidth={3} />
        </span>
        <span
          className={`truncate text-[15px] transition-colors ${
            done
              ? 'text-slate-400 line-through decoration-slate-300 dark:text-slate-500 dark:decoration-slate-600'
              : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {title}
        </span>
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${title}`}
          className="mr-2 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-rose-500/10"
        >
          <TrashIcon className="size-4" />
        </button>
      )}
    </li>
  )
}

export function AddTaskInput({ placeholder, onAdd, autoFocus }) {
  const [value, setValue] = useState('')
  const trimmed = value.trim()

  const submit = (e) => {
    e.preventDefault()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={120}
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[15px] text-slate-800 placeholder:text-slate-400 transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
      />
      <button
        type="submit"
        disabled={!trimmed}
        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
      >
        <PlusIcon className="size-4" />
        Add
      </button>
    </form>
  )
}

export function ProgressRing({ pct, done, total, size = 148, stroke = 12 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const value = pct ?? 0
  const complete = pct === 100

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          className={`transition-[stroke-dashoffset,stroke] duration-700 ease-out ${
            complete ? 'stroke-emerald-500' : 'stroke-indigo-500'
          } ${value === 0 ? 'opacity-0' : ''}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          {pct === null ? '–' : `${pct}%`}
        </span>
        <span className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {done} of {total} done
        </span>
      </div>
    </div>
  )
}
