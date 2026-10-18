import { useMemo, useState } from 'react'
import { usePersistentState } from './hooks/usePersistentState'
import { addDays, formatLong, relativeLabel, todayKey } from './lib/dates'
import { activeHabits, computeStats, createInitialData, dayProgress, getDay, newId } from './lib/data'
import { AddTaskInput, Card, ProgressRing, SectionTitle, TaskItem } from './components/ui'
import { Heatmap, StatGrid, WeekChart } from './components/Insights'
import { RoutineModal } from './components/RoutineModal'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListPlusIcon,
  PencilIcon,
  RepeatIcon,
} from './components/icons'

function encouragement(pct, isFuture) {
  if (isFuture) return { title: 'Planning ahead', body: 'Add tasks now and check them off when the day comes.' }
  if (pct === null) return { title: 'Nothing planned', body: 'Add a task below to start tracking this day.' }
  if (pct === 0) return { title: "Let's get started", body: 'Tick off your first task — momentum builds fast.' }
  if (pct < 50) return { title: 'Good start', body: 'You are on your way. Keep going!' }
  if (pct < 100) return { title: 'Almost there', body: 'Just a few more to make it a perfect day.' }
  return { title: 'Perfect day! 🎉', body: 'Every task done. That is how streaks are built.' }
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function App() {
  const [data, setData] = usePersistentState('progress-tracker:v1', createInitialData)
  const today = todayKey()
  const [selected, setSelected] = useState(today)
  const [routineOpen, setRoutineOpen] = useState(false)

  const habits = activeHabits(data, selected)
  const day = getDay(data, selected)
  const progress = dayProgress(data, selected)
  const stats = useMemo(() => computeStats(data, today), [data, today])
  const isFuture = selected > today
  const message = encouragement(progress.pct, isFuture)
  const routineHabits = data.habits.filter((h) => !h.archivedOn)

  const updateDay = (key, fn) =>
    setData((d) => ({ ...d, days: { ...d.days, [key]: fn(getDay(d, key)) } }))

  const toggleHabit = (id) =>
    updateDay(selected, (d) => ({
      ...d,
      done: d.done.includes(id) ? d.done.filter((x) => x !== id) : [...d.done, id],
    }))

  const addExtra = (title) =>
    updateDay(selected, (d) => ({ ...d, extras: [...d.extras, { id: newId(), title, done: false }] }))

  const toggleExtra = (id) =>
    updateDay(selected, (d) => ({
      ...d,
      extras: d.extras.map((e) => (e.id === id ? { ...e, done: !e.done } : e)),
    }))

  const deleteExtra = (id) =>
    updateDay(selected, (d) => ({ ...d, extras: d.extras.filter((e) => e.id !== id) }))

  const addHabit = (title) =>
    setData((d) => ({
      ...d,
      habits: [...d.habits, { id: newId(), title, createdOn: today, archivedOn: null }],
    }))

  const renameHabit = (id, title) =>
    setData((d) => ({ ...d, habits: d.habits.map((h) => (h.id === id ? { ...h, title } : h)) }))

  // Habits with history are archived so past days stay accurate; brand-new ones are dropped.
  const removeHabit = (id) =>
    setData((d) => ({
      ...d,
      habits: d.habits.flatMap((h) => {
        if (h.id !== id) return [h]
        return h.createdOn >= today ? [] : [{ ...h, archivedOn: today }]
      }),
    }))

  const label = relativeLabel(selected, today)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <RepeatIcon className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{greeting()} 👋</p>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Daily Progress</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRoutineOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50"
          >
            <PencilIcon className="size-4" />
            Edit daily routine
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          <main className="space-y-6 lg:col-span-3">
            <Card>
              {/* Date navigation */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelected(addDays(selected, -1))}
                  aria-label="Previous day"
                  className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ChevronLeftIcon className="size-5" />
                </button>
                <div className="text-center">
                  <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                    {label ?? (isFuture ? 'Upcoming' : 'Past day')}
                  </p>
                  <p className="text-lg font-semibold">{formatLong(selected)}</p>
                  {selected !== today && (
                    <button
                      type="button"
                      onClick={() => setSelected(today)}
                      className="mt-1 text-xs font-medium text-slate-500 underline-offset-2 hover:text-indigo-600 hover:underline dark:text-slate-400"
                    >
                      Jump to today
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(addDays(selected, 1))}
                  aria-label="Next day"
                  className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ChevronRightIcon className="size-5" />
                </button>
              </div>

              {/* Day summary */}
              <div
                className={`mt-6 flex flex-col items-center gap-6 rounded-2xl p-6 transition-colors sm:flex-row ${
                  progress.pct === 100
                    ? 'bg-emerald-50 dark:bg-emerald-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <ProgressRing {...progress} />
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold tracking-tight">{message.title}</h2>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{message.body}</p>
                  {progress.total > 0 && (
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white sm:w-64 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-[width] duration-700 ${
                          progress.pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progress.pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle
                icon={RepeatIcon}
                title="Daily routine"
                subtitle={`${habits.filter((h) => day.done.includes(h.id)).length} of ${habits.length} completed`}
                action={
                  <button
                    type="button"
                    onClick={() => setRoutineOpen(true)}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                  >
                    Edit
                  </button>
                }
              />
              {habits.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No daily tasks for this day.{' '}
                  <button type="button" onClick={() => setRoutineOpen(true)} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                    Set up your routine
                  </button>
                </p>
              ) : (
                <ul className="space-y-2">
                  {habits.map((h) => (
                    <TaskItem
                      key={h.id}
                      title={h.title}
                      done={day.done.includes(h.id)}
                      disabled={isFuture}
                      onToggle={() => toggleHabit(h.id)}
                    />
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <SectionTitle
                icon={ListPlusIcon}
                title={label ? `Extra tasks for ${label.toLowerCase()}` : 'Extra tasks for this day'}
                subtitle="One-off tasks that only count for this day"
              />
              {day.extras.length > 0 && (
                <ul className="mb-4 space-y-2">
                  {day.extras.map((e) => (
                    <TaskItem
                      key={e.id}
                      title={e.title}
                      done={e.done}
                      disabled={isFuture}
                      onToggle={() => toggleExtra(e.id)}
                      onDelete={() => deleteExtra(e.id)}
                    />
                  ))}
                </ul>
              )}
              <AddTaskInput placeholder="Add a task for this day…" onAdd={addExtra} />
            </Card>
          </main>

          <aside className="space-y-6 lg:col-span-2">
            <StatGrid stats={stats} />
            <WeekChart data={data} today={today} selected={selected} onSelect={setSelected} />
            <Heatmap data={data} today={today} selected={selected} onSelect={setSelected} />
          </aside>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
          Your progress is saved in this browser.
        </footer>
      </div>

      {routineOpen && (
        <RoutineModal
          habits={routineHabits}
          onAdd={addHabit}
          onRename={renameHabit}
          onRemove={removeHabit}
          onClose={() => setRoutineOpen(false)}
        />
      )}
    </div>
  )
}
