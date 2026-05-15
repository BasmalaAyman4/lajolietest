import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiSearch, HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { RiLayoutColumnLine } from 'react-icons/ri'
import { cn } from '@/lib/cn'
import Table, { type Column } from './Table'
import { Input, Select } from '@/components/shared'

export interface FilterOption {
  label: string
  value: string | number
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
}

type ActiveFilters = Record<string, string | number | ''>

const LIMIT_OPTIONS = [10, 20, 50, 100, 200]

// ── Column Visibility Picker ──────────────────────────────────────────────────
function ColumnVisibilityPicker<T>({
  columns,
  hiddenKeys,
  onToggle,
}: {
  columns: Column<T>[]
  hiddenKeys: Set<string>
  onToggle: (key: string) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const visibleCount = columns.length - hiddenKeys.size

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium',
          'border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]',
          'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors',
          open && 'bg-[var(--bg-hover)] text-[var(--text-primary)]',
        )}
      >
        <RiLayoutColumnLine size={14} />
        {t('common.columns', 'Columns')}
        <span className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] rounded px-1 font-semibold">
          {visibleCount}/{columns.length}
        </span>
      </button>

      {open && (
        <div
          className={cn(
            'absolute end-0 z-50 top-full mt-1',
            'min-w-[180px] rounded-[var(--radius)] border border-[var(--border)]',
            'bg-[var(--bg-card)] shadow-lg overflow-hidden',
          )}
        >
          {/* "Show all" shortcut */}
          {hiddenKeys.size > 0 && (
            <div className="border-b border-[var(--border)] px-3 py-2">
              <button
                onClick={() => columns.forEach((c) => hiddenKeys.has(String(c.key)) && onToggle(String(c.key)))}
                className="text-[11px] text-[var(--accent)] hover:underline font-medium"
              >
                {t('common.showAll', 'Show all')}
              </button>
            </div>
          )}

          {columns.map((col) => {
            const key = String(col.key)
            const visible = !hiddenKeys.has(key)

            return (
              <label
                key={key}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none',
                  'text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors',
                )}
              >
                <input
                  type="checkbox"
                  checked={visible}
                  // Always keep at least one column visible
                  disabled={visible && visibleCount === 1}
                  onChange={() => onToggle(key)}
                  className="accent-[var(--accent)] w-3.5 h-3.5 rounded"
                />
                <span className={cn(!visible && 'opacity-40 line-through')}>{col.label}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({
  page, totalPages, total, limit, onPageChange, onLimitChange,
}: {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (p: number) => void
  onLimitChange: (l: number) => void
}) {
  const { t } = useTranslation()

  const pageWindow = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const half = 2
    let start = Math.max(1, page - half)
    let end   = Math.min(totalPages, page + half)
    if (end - start < 4) {
      if (start === 1) end = Math.min(5, totalPages)
      else start = Math.max(1, end - 4)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [page, totalPages])

  if (totalPages <= 1 && total <= Math.min(...LIMIT_OPTIONS)) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[var(--bg-card)]">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)]">{t('common.rowsPerPage', 'Rows')}:</span>
        <Select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          options={LIMIT_OPTIONS.map((l) => ({ label: String(l), value: l }))}
          className="text-xs py-1 px-2 min-w-[64px]"
        />
      </div>

      <span className="text-xs text-[var(--text-muted)]">
        {total} {t('common.rows', 'rows')} · {t('common.page', 'page')} {page}/{totalPages}
      </span>

      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-[var(--radius)]',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors',
            'disabled:opacity-30 disabled:cursor-not-allowed',
          )}
        >
          <HiChevronLeft size={15} />
        </button>

        {pageWindow[0] > 1 && (
          <>
            <PageBtn n={1} current={page} onClick={onPageChange} />
            {pageWindow[0] > 2 && <span className="text-xs text-[var(--text-muted)] px-1">…</span>}
          </>
        )}

        {pageWindow.map((n) => <PageBtn key={n} n={n} current={page} onClick={onPageChange} />)}

        {pageWindow[pageWindow.length - 1] < totalPages && (
          <>
            {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
              <span className="text-xs text-[var(--text-muted)] px-1">…</span>
            )}
            <PageBtn n={totalPages} current={page} onClick={onPageChange} />
          </>
        )}

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-[var(--radius)]',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors',
            'disabled:opacity-30 disabled:cursor-not-allowed',
          )}
        >
          <HiChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

function PageBtn({ n, current, onClick }: { n: number; current: number; onClick: (n: number) => void }) {
  return (
    <button
      onClick={() => onClick(n)}
      className={cn(
        'w-7 h-7 rounded-[var(--radius)] text-xs font-medium transition-all duration-150',
        n === current
          ? 'bg-[var(--accent)] text-white shadow-sm scale-105'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
      )}
    >
      {n}
    </button>
  )
}

// ── Persisted limit helper ────────────────────────────────────────────────────
function readPersistedLimit(tableKey: string): number {
  try {
    const raw = localStorage.getItem(`table-limit:${tableKey}`)
    if (raw !== null) {
      const parsed = Number(raw)
      if (LIMIT_OPTIONS.includes(parsed)) return parsed
    }
  } catch { /* ignore */ }
  return LIMIT_OPTIONS[0]
}

function writePersistedLimit(tableKey: string, limit: number) {
  try { localStorage.setItem(`table-limit:${tableKey}`, String(limit)) } catch { /* ignore */ }
}

// ── DataTable props ───────────────────────────────────────────────────────────
interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: keyof T
  /**
   * Unique key for this table instance.
   * Used to persist the rows-per-page choice in localStorage so it
   * survives navigation and page remounts.
   * Example: "products" | "orders" | "customers"
   */
  tableKey: string
  loading?: boolean
  toolbar?: React.ReactNode
  searchKeys?: (keyof T | string)[]
  onSearch?: (q: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  onFilterChange?: (filters: ActiveFilters) => void
  onSort?: (key: string, dir: 'asc' | 'desc') => void
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  emptyMessage?: string
  onRowClick?: (row: T) => void
  /** Keys hidden by default. Columns prop order is preserved. */
  defaultHiddenKeys?: string[]
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  tableKey,
  loading = false,
  toolbar,
  searchKeys = [],
  onSearch,
  searchPlaceholder,
  filters = [],
  onFilterChange,
  onSort,
  total: serverTotal,
  page: serverPage,
  limit: serverLimit,
  onPageChange: serverOnPageChange,
  onLimitChange: serverOnLimitChange,
  emptyMessage,
  onRowClick,
  defaultHiddenKeys = [],
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const isServerSide = serverTotal !== undefined

  // ── Column visibility ─────────────────────────────────────────────────────
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set(defaultHiddenKeys))

  const toggleColumn = useCallback((key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenKeys.has(String(c.key))),
    [columns, hiddenKeys],
  )

  // ── Search state ──────────────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState('')

  const handleSearch = useCallback((q: string) => {
    setLocalSearch(q)
    onSearch?.(q)
  }, [onSearch])

  // ── Persisted limit (shared between server-side and client-side) ──────────
  // In server-side mode the page passes `limit` as a prop — we still read the
  // persisted value on mount so the page can initialise its own state from it.
  // The single source of truth for the rendered value is always:
  //   server-side → serverLimit prop   (page owns the state)
  //   client-side → localLimit state   (DataTable owns the state)
  // Both write to localStorage via handleLimitChange.
  const [localPage, setLocalPage]   = useState(1)
  const [localLimit, setLocalLimit] = useState(() => readPersistedLimit(tableKey))
  const [columnFilters, setColumnFilters] = useState<Record<string, string | number | ''>>({})

  const handleColumnFilterChange = useCallback((key: string, value: string | number | '') => {
    setColumnFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (value === '') delete next[key]
      return next
    })
    setLocalPage(1)
  }, [])

  const hasActiveColumnFilters = Object.keys(columnFilters).length > 0

  const page  = isServerSide ? (serverPage  ?? 1)               : localPage
  const limit = isServerSide ? (serverLimit ?? LIMIT_OPTIONS[0]) : localLimit

  const handlePageChange = (p: number) => {
    if (isServerSide) serverOnPageChange?.(p)
    else setLocalPage(p)
  }

  const handleLimitChange = (l: number) => {
    writePersistedLimit(tableKey, l)
    if (isServerSide) {
      serverOnLimitChange?.(l)
    } else {
      setLocalLimit(l)
      setLocalPage(1)
    }
  }

  // ── Client-side filtering ─────────────────────────────────────────────────
  const processedData = useMemo(() => {
    if (isServerSide) return data

    let result = [...data]

    if (localSearch.trim() && searchKeys.length > 0) {
      const q = localSearch.toLowerCase()
      result = result.filter((row) =>
        searchKeys.some((key) => {
          const val = String((row as Record<string, unknown>)[key as string] ?? '')
          return val.toLowerCase().includes(q)
        }),
      )
    }

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value === '') return
      result = result.filter((row) =>
        String((row as Record<string, unknown>)[key]) === String(value),
      )
    })

    return result
  }, [data, localSearch, searchKeys, columnFilters, isServerSide])

  const total      = isServerSide ? (serverTotal ?? 0) : processedData.length
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const pageData = isServerSide
    ? processedData
    : processedData.slice((page - 1) * limit, page * limit)

  return (
    <div className="flex flex-col overflow-hidden">
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-[180px] max-w-xs">
          <Input
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder ?? t('common.search', 'Search…')}
            leftIcon={<HiSearch size={15} />}
            rightIcon={
              localSearch ? (
                <button
                  onClick={() => handleSearch('')}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  <HiX size={13} />
                </button>
              ) : null
            }
          />
        </div>

        {toolbar}

        {/* Column visibility — always rendered at the end of the toolbar */}
        <ColumnVisibilityPicker
          columns={columns}
          hiddenKeys={hiddenKeys}
          onToggle={toggleColumn}
        />
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Table<T>
        columns={visibleColumns}
        data={pageData}
        rowKey={rowKey}
        loading={loading}
        skeletonRows={limit}
        emptyMessage={emptyMessage}
        onSort={onSort}
        onRowClick={onRowClick}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        hasActiveColumnFilters={hasActiveColumnFilters}
      />

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  )
}