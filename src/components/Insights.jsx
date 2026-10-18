import { useMemo } from 'react'
import { addDays, formatMedium, fromKey, weekdayShort } from '../lib/dates'
import { dayProgress } from '../lib/data'
import { Card, SectionTitle } from './ui'
import { FlameIcon, StarIcon, TrendIcon, TrophyIcon } from './icons'

export function StatGrid({ stats }) {
  const items = [
    {
      label: 'Current streak',
      value: stats.currentStreak,
      unit: stats.currentStreak === 1 ? 'day' : 'days',
      icon: FlameIcon,
      tint: 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400',
    },
    {
      label: 'Best streak',
      value: stats.bestStreak,
      unit: stats.bestStreak === 1 ? 'day' : 'days',
      icon: TrophyIcon,
      tint: 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400',
    },
    {
      label: 'Perfect days',
      value: stats.perfectDays,
      unit: 'total',
      icon: StarIcon,
      tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      label: '30-day average',
      value: stats.average === null ? '–' : `${stats.average}%`,
      unit: 'complete',
      icon: TrendIcon,
      tint: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ label, value, unit, icon: Icon, tint }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <span className={`flex size-8 items-center justify-center rounded-lg ${tint}`}>
            <Icon className="size-4" />
          </span>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
            {value}
            <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  )
}

export function WeekChart({ data, today, selected, onSelect }) {
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const key = addDays(today, i - 6)
        return { key, ...dayProgress(data, key) }
      }),
    [data, today],
  )

  return (
    <Card>
      <SectionTitle icon={TrendIcon} title="Last 7 days" subtitle="Completion per day" />
      <div className="flex h-44 items-stretch gap-2">
        {days.map((d) => {
          const isSelected = d.key === selected
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => onSelect(d.key)}
              title={`${formatMedium(d.key)}: ${d.pct === null ? 'no tasks' : `${d.pct}% (${d.done}/${d.total})`}`}
              className="group flex flex-1 flex-col items-center gap-1.5"
            >
              <span className="text-[11px] font-medium text-slate-500 tabular-nums dark:text-slate-400">
                {d.pct === null ? '–' : `${d.pct}%`}
              </span>
              <div
                className={`flex w-full flex-1 items-end overflow-hidden rounded-md bg-slate-100 transition dark:bg-slate-800 ${
                  isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : 'group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                }`}
              >
                <div
                  style={{ height: `${d.pct ?? 0}%` }}
                  className={`w-full rounded-t-[4px] transition-[height] duration-500 ${
                    d.pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                />
              </div>
              <span
                className={`text-xs ${
                  isSelected
                    ? 'font-semibold text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {d.key === today ? 'Today' : weekdayShort(d.key)}
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

// Sequential single-hue scale: light → dark as completion rises.
function cellColor(pct) {
  if (pct === null) return 'bg-slate-100 dark:bg-slate-800/70'
  if (pct === 0) return 'bg-slate-200 dark:bg-slate-700'
  if (pct < 34) return 'bg-emerald-200 dark:bg-emerald-900'
  if (pct < 67) return 'bg-emerald-300 dark:bg-emerald-700'
  if (pct < 100) return 'bg-emerald-500 dark:bg-emerald-500'
  return 'bg-emerald-700 dark:bg-emerald-300'
}

const WEEKS = 15

export function Heatmap({ data, today, selected, onSelect }) {
  const weeks = useMemo(() => {
    const start = addDays(today, -((WEEKS - 1) * 7 + fromKey(today).getDay()))
    return Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const key = addDays(start, w * 7 + d)
        return key > today ? { key, future: true } : { key, ...dayProgress(data, key) }
      }),
    )
  }, [data, today])

  const legend = [null, 0, 20, 50, 80, 100]

  return (
    <Card>
      <SectionTitle
        icon={StarIcon}
        title="Consistency"
        subtitle={`Last ${WEEKS} weeks · tap a day to open it`}
      />
      <div className="flex justify-between gap-[3px]">
        {weeks.map((week) => (
          <div key={week[0].key} className="flex flex-1 flex-col gap-[3px]">
            {week.map((cell) =>
              cell.future ? (
                <div key={cell.key} className="aspect-square" />
              ) : (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => onSelect(cell.key)}
                  title={`${formatMedium(cell.key)}: ${
                    cell.pct === null ? 'no tasks' : `${cell.pct}% (${cell.done}/${cell.total})`
                  }`}
                  className={`aspect-square rounded-[3px] transition hover:scale-125 ${cellColor(cell.pct)} ${
                    cell.key === selected
                      ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
                      : ''
                  }`}
                />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span>Less</span>
        {legend.map((pct, i) => (
          <span key={i} className={`size-3 rounded-[3px] ${cellColor(pct)}`} />
        ))}
        <span>More</span>
      </div>
    </Card>
  )
}
