import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import type { DropdownOption } from '@/types'
import { HiX, HiChevronDown } from 'react-icons/hi'

interface MultiSelectProps {
  label?: string
  error?: string
  hint?: string
  options: DropdownOption[]
  value?: (string | number)[]
  onChange?: (value: (string | number)[]) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

/**
 * MultiSelect – custom dropdown that allows multiple selections.
 * Dropdown renders in a portal so it overlays other content instead of
 * pushing it down.
 */
export default function MultiSelect({
  label,
  error,
  hint,
  options,
  value = [],
  onChange,
  placeholder = 'Select…',
  disabled,
  required,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLDivElement>(null)

  // Position the portal dropdown under (or above) the trigger
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropdownHeight = 260 // approx max-height

    if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
      setDropdownStyle({
        position: 'fixed',
        top: rect.top - dropdownHeight - 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    } else {
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        !(document.getElementById('multiselect-portal'))?.contains(target)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  )

  const toggle = (val: string | number) => {
    const next = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val]
    onChange?.(next)
  }

  const remove = (val: string | number, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(value.filter((v) => v !== val))
  }

  const labelOf = (val: string | number) =>
    options.find((o) => o.value === val)?.label ?? String(val)

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {required && <span className="text-[var(--danger)] ms-1">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'relative min-h-[42px] flex flex-wrap items-center gap-1.5',
          'rounded-[var(--radius)] border bg-[var(--bg-card)] px-3 py-2 cursor-pointer',
          'border-[var(--border)] transition-all duration-150',
          open && 'border-[var(--border-focus)] ring-2 ring-[var(--accent-soft)]',
          error && 'border-[var(--danger)]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {value.length === 0 && (
          <span className="text-sm text-[var(--text-muted)]">{placeholder}</span>
        )}

        {value.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 text-xs font-medium
              bg-[var(--accent-soft)] text-[var(--accent)] rounded-full px-2.5 py-0.5"
          >
            {labelOf(v)}
            <button
              type="button"
              onClick={(e) => remove(v, e)}
              className="hover:text-[var(--danger)] transition-colors"
            >
              <HiX size={10} />
            </button>
          </span>
        ))}

        <HiChevronDown
          className={cn(
            'ms-auto text-[var(--text-muted)] transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </div>

      {/* Portal dropdown */}
      {open &&
        createPortal(
          <div
            id="multiselect-portal"
            style={dropdownStyle}
            className="rounded-[var(--radius)] border border-[var(--border)]
              bg-[var(--bg-card)] shadow-[var(--shadow)] overflow-hidden animate-fade-in"
          >
            <div className="p-2 border-b border-[var(--border)]">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-[var(--bg-hover)] rounded-md px-2.5 py-1.5 text-sm
                  text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
            </div>

            <ul className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[var(--text-muted)]">No results</li>
              ) : (
                filtered.map((opt) => {
                  const selected = value.includes(opt.value)
                  return (
                    <li
                      key={opt.value}
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
                        'hover:bg-[var(--bg-hover)]',
                        selected && 'text-[var(--accent)]',
                      )}
                    >
                      <span
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0',
                          selected
                            ? 'bg-[var(--accent)] border-[var(--accent)]'
                            : 'border-[var(--border)]',
                        )}
                      >
                        {selected && (
                          <svg viewBox="0 0 12 9" width="10" fill="none">
                            <path
                              d="M1 4l3.5 3.5L11 1"
                              stroke="white"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </li>
                  )
                })
              )}
            </ul>
          </div>,
          document.body,
        )}

      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}