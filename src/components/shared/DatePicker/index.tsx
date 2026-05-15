// ─── DatePicker (shared) ──────────────────────────────────────────────────────
//
//  Calendar date picker. Produces/consumes ISO date strings ("YYYY-MM-DD") so
//  the API and react-hook-form schemas receive plain strings e.g. "2025-06-15".
//
//  Works with react-hook-form via Controller with no extra conversion needed:
//
//    <Controller
//      control={control}
//      name="fromDate"               // z.string() in your schema
//      render={({ field }) => (
//        <DatePicker
//          value={field.value}        // "" | "2025-06-15"
//          onChange={field.onChange}  // receives "2025-06-15"
//          label="From Date"
//          error={errors.fromDate?.message}
//          required
//        />
//      )}
//    />
//
//  Optional props:
//    minDate / maxDate  — ISO strings ("YYYY-MM-DD") — clamp selectable range
//    disabledDates      — (iso: string) => boolean   — fine-grained disabling
//    placeholder        — string shown when no date is selected

import { useState, useRef, useEffect, useCallback } from 'react'
import { HiCalendar, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { cn } from '@/lib/cn'

// ── Internal type (never exposed via props) ───────────────────────────────────
interface DateValue {
  year: number
  month: number // 1–12
  day: number   // 1–31
}

// ── Public props ──────────────────────────────────────────────────────────────
interface DatePickerProps {
  /** ISO string "YYYY-MM-DD" or "" / undefined when empty */
  value?: string
  /** Called with "YYYY-MM-DD" on selection, "" on clear */
  onChange?: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  /** ISO string lower bound (inclusive) e.g. "2025-01-01" */
  minDate?: string
  /** ISO string upper bound (inclusive) e.g. "2025-12-31" */
  maxDate?: string
  /** Return true to disable a specific ISO date */
  disabledDates?: (iso: string) => boolean
}

// ── ISO ↔ DateValue helpers ───────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')

/** "YYYY-MM-DD" → DateValue (returns null if blank/invalid) */
const parseISO = (iso: string | undefined): DateValue | null => {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return { year: y, month: m, day: d }
}

/** DateValue → "YYYY-MM-DD" */
const toISO = (v: DateValue) => `${v.year}-${pad(v.month)}-${pad(v.day)}`

/** Lexicographic ISO comparison — works because format is fixed-width */
const cmpISO = (a: string, b: string) => a.localeCompare(b)

// ── Calendar helpers ──────────────────────────────────────────────────────────
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** "Mon DD, YYYY" trigger label */
const formatDisplay = (iso: string) => {
  const v = parseISO(iso)
  if (!v) return ''
  return `${MONTHS[v.month - 1].slice(0, 3)} ${pad(v.day)}, ${v.year}`
}

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate()
const firstDayOfMonth = (year: number, month: number) => new Date(year, month - 1, 1).getDay()

/** 6-row × 7-col grid; null cells are leading/trailing blanks */
const buildGrid = (year: number, month: number): (number | null)[] => {
  const total = daysInMonth(year, month)
  const offset = firstDayOfMonth(year, month)
  const grid: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= total; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

const todayISO = (): string => {
  const n = new Date()
  return toISO({ year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() })
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DatePicker({
  value,
  onChange,
  label,
  error,
  disabled = false,
  required = false,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabledDates,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cursor: which month/year is visible in the panel
  const parsed = parseISO(value)
  const now = parseISO(todayISO())!
  const [cursor, setCursor] = useState<{ year: number; month: number }>({
    year: parsed?.year ?? now.year,
    month: parsed?.month ?? now.month,
  })

  // Sync cursor when value changes externally (e.g. form reset / edit-mode fill)
  useEffect(() => {
    const v = parseISO(value)
    if (v) setCursor({ year: v.year, month: v.month })
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Navigation ──────────────────────────────────────────────────────────────
  const prevMonth = () =>
    setCursor((c) =>
      c.month === 1
        ? { year: c.year - 1, month: 12 }
        : { year: c.year, month: c.month - 1 },
    )

  const nextMonth = () =>
    setCursor((c) =>
      c.month === 12
        ? { year: c.year + 1, month: 1 }
        : { year: c.year, month: c.month + 1 },
    )

  // ── Day helpers ─────────────────────────────────────────────────────────────
  const isoForDay = (day: number) =>
    toISO({ year: cursor.year, month: cursor.month, day })

  const isSelected = (day: number) => !!value && value === isoForDay(day)
  const isToday    = (day: number) => isoForDay(day) === todayISO()

  const isDayDisabled = useCallback(
    (day: number): boolean => {
      const iso = isoForDay(day)
      if (minDate && cmpISO(iso, minDate) < 0) return true
      if (maxDate && cmpISO(iso, maxDate) > 0) return true
      if (disabledDates?.(iso)) return true
      return false
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor.year, cursor.month, minDate, maxDate, disabledDates],
  )

  // ── Select a day ────────────────────────────────────────────────────────────
  const selectDay = (day: number) => {
    if (isDayDisabled(day)) return
    onChange?.(isoForDay(day))
    setOpen(false)
  }

  // ── Disable nav arrows at min/max month boundaries ──────────────────────────
  const cursorFirst  = toISO({ year: cursor.year, month: cursor.month, day: 1 })
  const minFirst     = minDate ? minDate.slice(0, 7) + '-01' : null
  const maxFirst     = maxDate ? maxDate.slice(0, 7) + '-01' : null
  const prevDisabled = !!minFirst && cmpISO(cursorFirst, minFirst) <= 0
  const nextDisabled = !!maxFirst && cmpISO(cursorFirst, maxFirst) >= 0

  const grid = buildGrid(cursor.year, cursor.month)

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={containerRef}>

      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {required && <span className="text-[var(--danger)] ms-1">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius)]',
          'border bg-[var(--bg-card)] text-sm text-start',
          'transition-all duration-150 outline-none',
          'border-[var(--border)] hover:border-[var(--border-focus)]',
          'focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--accent-soft)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'border-[var(--border-focus)] ring-2 ring-[var(--accent-soft)]',
          error && 'border-[var(--danger)]',
        )}
      >
        <HiCalendar size={15} className="text-[var(--text-muted)] shrink-0" />
        <span
          className={cn(
            'font-medium',
            value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]',
          )}
        >
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {/* Dropdown calendar panel */}
      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 left-0 z-50',
            'rounded-[var(--radius)] border border-[var(--border)]',
            'bg-[var(--bg-card)] shadow-[var(--shadow-lg)]',
            'p-3 flex flex-col gap-2',
          )}
          style={{ minWidth: 280, zIndex: 10000000 }}
        >
          {/* Month / Year navigation */}
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              disabled={prevDisabled}
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded
                text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]
                transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <HiChevronLeft size={15} />
            </button>

            <span className="text-sm font-semibold text-[var(--text-primary)] select-none">
              {MONTHS[cursor.month - 1]} {cursor.year}
            </span>

            <button
              type="button"
              disabled={nextDisabled}
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded
                text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]
                transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <HiChevronRight size={15} />
            </button>
          </div>

          {/* Day-of-week headers + grid */}
          <div className="grid grid-cols-7">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="h-7 flex items-center justify-center
                  text-[10px] font-semibold text-[var(--text-muted)] select-none uppercase tracking-wide"
              >
                {d}
              </div>
            ))}

            {grid.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />

              const selected     = isSelected(day)
              const todayCell    = isToday(day)
              const cellDisabled = isDayDisabled(day)

              return (
                <button
                  key={day}
                  type="button"
                  disabled={cellDisabled}
                  onClick={() => selectDay(day)}
                  className={cn(
                    'h-8 w-full flex items-center justify-center rounded',
                    'text-sm font-medium transition-all select-none',
                    selected
                      ? 'bg-[var(--accent)] text-white'
                      : todayCell
                        ? 'text-[var(--accent)] font-bold hover:bg-[var(--accent-soft)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]',
                    cellDisabled && 'opacity-30 pointer-events-none',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer: Today shortcut + Clear */}
          <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                const iso = todayISO()
                const v   = parseISO(iso)!
                setCursor({ year: v.year, month: v.month })
                if (!isDayDisabled(v.day)) {
                  onChange?.(iso)
                  setOpen(false)
                }
              }}
              className="flex-1 text-xs font-semibold py-2 rounded-[var(--radius)]
                bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]
                transition-colors"
            >
              Today
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange?.('')
                  setOpen(false)
                }}
                className="flex-1 text-xs font-semibold py-2 rounded-[var(--radius)]
                  bg-[var(--bg-hover)] text-[var(--text-muted)]
                  hover:text-[var(--text-primary)] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Validation error */}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}