// ─── HowToUsePage ─────────────────────────────────────────────────────────────
//
//  Grid view of HowToUse entries.
//  - Filter by purpose and media type using top toolbar
//  - Search by title
//  - Cards show media inline (image or video with play overlay)
//  - Add → HowToUseFormModal
//  - Delete → ConfirmModal

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiSearch, HiX } from 'react-icons/hi'
import { Button, ConfirmModal } from '@/components/shared'
import {
  useGetHowToUsesQuery,
  useDeleteHowToUseMutation,
  useGetMediaTypeDropdownQuery,
  useGetPurposeDropdownQuery,
} from '../services/howToUseApi'
import HowToUseCard from '../components/HowToUseCard'
import HowToUseFormModal from '../components/HowToUseFormModal'

export default function HowToUsePage() {
  const { t } = useTranslation()

  const { data: items = [], isLoading, isError } = useGetHowToUsesQuery()
  const { data: mediaTypes = [] } = useGetMediaTypeDropdownQuery()
  const { data: purposes = [] } = useGetPurposeDropdownQuery()
  const [deleteHowToUse, { isLoading: isDeleting }] = useDeleteHowToUseMutation()

  const [formModal, setFormModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [filterPurpose, setFilterPurpose] = useState<number | null>(null)
  const [filterMediaType, setFilterMediaType] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase()
      const matchSearch = !q || item.titleEn.toLowerCase().includes(q) || item.titleAr.toLowerCase().includes(q)
      const matchPurpose = !filterPurpose || item.howToUsePurposeId === filterPurpose
      const matchMedia = !filterMediaType || item.howToUseMediaTypeId === filterMediaType
      return matchSearch && matchPurpose && matchMedia
    })
  }, [items, search, filterPurpose, filterMediaType])

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteHowToUse(deleteModal.id).unwrap()
      toast.success('Deleted successfully')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const hasActiveFilters = search || filterPurpose || filterMediaType
  const clearFilters = () => {
    setSearch('')
    setFilterPurpose(null)
    setFilterMediaType(null)
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load how-to-use entries.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">How To Use</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {items.length} guide{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setFormModal(true)} leftIcon={<HiPlus size={15} />}>
          Add Guide
        </Button>
      </div>

      {/* ── Filter toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <HiSearch size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="w-full ps-9 pe-3 py-2 rounded-[var(--radius)] border border-[var(--border)]
              bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
        </div>

        {/* Purpose filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterPurpose(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !filterPurpose
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
            }`}
          >
            All Purposes
          </button>
          {purposes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilterPurpose(filterPurpose === p.id ? null : p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterPurpose === p.id
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Media type filter pills */}
        <div className="flex items-center gap-1.5">
          {mediaTypes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setFilterMediaType(filterMediaType === m.id ? null : m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterMediaType === m.id
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
          >
            <HiX size={12} /> Clear
          </button>
        )}
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden animate-pulse">
              <div className="aspect-video bg-[var(--bg-hover)]" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 w-16 bg-[var(--bg-hover)] rounded-full" />
                <div className="h-4 w-3/4 bg-[var(--bg-hover)] rounded" />
                <div className="h-3 w-full bg-[var(--bg-hover)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-[var(--text-muted)]">
            {hasActiveFilters ? 'No results match your filters.' : 'No guides yet. Add your first one!'}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="text-xs text-[var(--accent)] hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <HowToUseCard
              key={item.id}
              item={item}
              onDelete={(id) => setDeleteModal({ open: true, id })}
            />
          ))}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <HowToUseFormModal open={formModal} onClose={() => setFormModal(false)} />

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Guide"
        message="Are you sure you want to delete this how-to-use guide?"
      />
    </div>
  )
}
