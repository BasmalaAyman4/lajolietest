import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  type SelectHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import type { DropdownOption } from '@/types'
import { HiChevronDown, HiX } from 'react-icons/hi'

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  hint?: string
  options: DropdownOption[]
  placeholder?: string
  onChange?: (e: { target: { name?: string; value: string } }) => void
}

const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      className,
      value,
      onChange,
      onBlur,
      name,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
    const triggerRef = useRef<HTMLDivElement>(null)

    // Position the portal dropdown under the trigger
    const updatePosition = useCallback(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownHeight = 260 // approx max-height

      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // Flip up
        setDropdownStyle({
          position: 'fixed',
          top: rect.top - dropdownHeight - 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        })
      } else {
        // Drop down (default)
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
          !(document.getElementById('select-portal'))?.contains(target)
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

    const selectedLabel =
      options.find((o) => String(o.value) === String(value))?.label ?? null

    const handleSelect = useCallback(
      (optValue: string | number) => {
        onChange?.({ target: { name, value: String(optValue) } })
        onBlur?.({ target: { name } } as React.FocusEvent<HTMLSelectElement>)
        setOpen(false)
        setSearch('')
      },
      [onChange, onBlur, name],
    )

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.({ target: { name, value: '' } })
    }

    const hasValue =
      value !== '' &&
      value !== undefined &&
      value !== null &&
      String(value) !== '0'

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
            {props.required && (
              <span className="text-[var(--danger)] ms-1">*</span>
            )}
          </label>
        )}

        <input ref={ref} type="hidden" name={name} value={String(value ?? '')} readOnly />

        {/* Trigger */}
        <div
          ref={triggerRef}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={cn(
            'relative flex items-center gap-2 min-h-[42px]',
            'rounded-[var(--radius)] border bg-[var(--bg-card)] px-3 py-2 cursor-pointer',
            'text-sm transition-all duration-150 select-none',
            'border-[var(--border)]',
            open && 'border-[var(--border-focus)] ring-2 ring-[var(--accent-soft)]',
            error && 'border-[var(--danger)]',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
        >
          <span
            className={cn(
              'flex-1 truncate',
              hasValue ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]',
            )}
          >
            {hasValue ? selectedLabel : (placeholder ?? 'Select…')}
          </span>

          {hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors shrink-0"
            >
              <HiX size={13} />
            </button>
          )}

          <HiChevronDown
            size={15}
            className={cn(
              'text-[var(--text-muted)] transition-transform duration-150 shrink-0',
              open && 'rotate-180',
            )}
          />
        </div>

        {/* Portal dropdown */}
        {open &&
          createPortal(
            <div
              id="select-portal"
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
                    const isSelected = String(opt.value) === String(value)
                    return (
                      <li
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'px-3 py-2 text-sm cursor-pointer transition-colors',
                          'hover:bg-[var(--bg-hover)]',
                          isSelected
                            ? 'text-[var(--accent)] font-medium bg-[var(--accent-soft)]'
                            : 'text-[var(--text-primary)]',
                        )}
                      >
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
  },
)

Select.displayName = 'Select'
export default Select