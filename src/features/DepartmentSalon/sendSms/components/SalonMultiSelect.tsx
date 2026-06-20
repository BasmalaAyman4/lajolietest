// Multi-select salon picker with search + "Select All" toggle

import { useState, useRef, useEffect } from 'react'
import { HiChevronDown, HiX, HiSearch } from 'react-icons/hi'
import { cn } from '@/lib/cn'
import type { SalonDropdownItem } from '../types'

interface SalonMultiSelectProps {
  salons: SalonDropdownItem[]
  selected: number[]
  onChange: (ids: number[]) => void
  error?: string
  label?: string
  required?: boolean
}

export default function SalonMultiSelect({
  salons,
  selected,
  onChange,
  error,
  label,
  required,
}: SalonMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = salons.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  )

  const allSelected = salons.length > 0 && selected.length === salons.length

  const toggleAll = () =>
    onChange(allSelected ? [] : salons.map((s) => s.id))

  const toggleOne = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  const removeOne = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((x) => x !== id))
  }

  const selectedSalons = salons.filter((s) => selected.includes(s.id))

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {required && <span className="text-[var(--danger)] ms-1">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'min-h-[38px] w-full flex flex-wrap gap-1.5 items-center px-3 py-2 cursor-pointer',
          'rounded-[var(--radius)] border bg-[var(--bg-card)] transition-colors',
          open
            ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]'
            : error
            ? 'border-[var(--danger)]'
            : 'border-[var(--border)] hover:border-[var(--accent)]',
        )}
      >
        {selectedSalons.length === 0 ? (
          <span className="text-sm text-[var(--text-muted)] flex-1">Select salons…</span>
        ) : selectedSalons.length === salons.length ? (
          <span className="text-sm text-[var(--accent)] font-medium flex-1">All salons selected ({salons.length})</span>
        ) : (
          <>
            {selectedSalons.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)]"
              >
                {s.name}
                <button type="button" onClick={(e) => removeOne(s.id, e)} className="hover:opacity-70">
                  <HiX size={10} />
                </button>
              </span>
            ))}
            {selectedSalons.length > 3 && (
              <span className="text-xs text-[var(--text-muted)] font-medium">
                +{selectedSalons.length - 3} more
              </span>
            )}
          </>
        )}
        <HiChevronDown
          size={15}
          className={cn(
            'ms-auto shrink-0 text-[var(--text-muted)] transition-transform',
            open && 'rotate-180',
          )}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] shadow-lg overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
              <HiSearch size={13} className="text-[var(--text-muted)] shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search salons…"
                className="flex-1 text-xs bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <HiX size={11} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
                </button>
              )}
            </div>

            {/* Select all */}
            {!search && (
              <button
                type="button"
                onClick={toggleAll}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold border-b border-[var(--border)] text-[var(--accent)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-[var(--accent)] w-3.5 h-3.5"
                  onClick={(e) => e.stopPropagation()}
                />
                Select All ({salons.length})
              </button>
            )}

            {/* Options */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">No salons found</p>
              ) : (
                filtered.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleOne(s.id)}
                      className="accent-[var(--accent)] w-3.5 h-3.5"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">{s.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}