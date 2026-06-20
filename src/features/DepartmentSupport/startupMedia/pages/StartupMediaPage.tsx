
// ─── StartupMediaPage ─────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiX } from 'react-icons/hi'
import { Button, ConfirmModal } from '@/components/shared'
import {
  useGetStartupMediasQuery,
  useDeleteStartupMediaMutation,
  useGetStartupMediaTypeDropdownQuery,
} from '../services/startupMediaApi'
import type { StartupMedia } from '../types'
import StartupMediaCard from '../components/StartupMediaCard'
import StartupMediaFormModal from '../components/StartupMediaFormModal'
import StartupMediaEditModal from '../components/StartupMediaEditModal'
import { getApiError } from '@/services/apiHelpers'

// ── Platform filter options ───────────────────────────────────────────────────
const PLATFORM_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'web', label: 'Web' },
  { key: 'app', label: 'App' },
] as const
type PlatformFilter = typeof PLATFORM_FILTERS[number]['key']

// ── Component ─────────────────────────────────────────────────────────────────
export default function StartupMediaPage() {
  const { t } = useTranslation()

  const { data: items = [], isLoading, isError } = useGetStartupMediasQuery()
  const { data: mediaTypes = [] } = useGetStartupMediaTypeDropdownQuery()
  const [deleteStartupMedia, { isLoading: isDeleting }] = useDeleteStartupMediaMutation()

  // ── Modal state ───────────────────────────────────────────────────────────
  const [addModal,    setAddModal]    = useState(false)
  const [editItem,    setEditItem]    = useState<StartupMedia | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filterMediaType, setFilterMediaType] = useState<number | null>(null)
  const [filterPlatform,  setFilterPlatform]  = useState<PlatformFilter>('all')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchMedia    = !filterMediaType || item.startupMediaTypeId === filterMediaType
      const matchPlatform =
        filterPlatform === 'all' ? true
        : filterPlatform === 'web' ? item.webFlag
        : item.appFlag
      return matchMedia && matchPlatform
    })
  }, [items, filterMediaType, filterPlatform])

  const hasActiveFilters = filterMediaType !== null || filterPlatform !== 'all'
  const clearFilters = () => {
    setFilterMediaType(null)
    setFilterPlatform('all')
  }

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteStartupMedia(deleteModal.id).unwrap()
      toast.success('Deleted successfully')
    }catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load startup media entries.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Startup Media</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setAddModal(true)} leftIcon={<HiPlus size={15} />}>
          Add Media
        </Button>
      </div>

      {/* ── Filter toolbar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Media type pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterMediaType(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !filterMediaType
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
            }`}
          >
            All Types
          </button>
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

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--border)]" />

        {/* Platform pills */}
        <div className="flex items-center gap-1.5">
          {PLATFORM_FILTERS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setFilterPlatform(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterPlatform === p.key
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Clear */}
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

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-[var(--bg-hover)]" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 w-32 bg-[var(--bg-hover)] rounded" />
                <div className="h-3 w-20 bg-[var(--bg-hover)] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-[var(--text-muted)]">
            {hasActiveFilters
              ? 'No results match your filters.'
              : 'No startup media yet. Add your first one!'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <StartupMediaCard
              key={item.id}
              item={item}
              onEdit={setEditItem}
              onDelete={(id) => setDeleteModal({ open: true, id })}
            />
          ))}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <StartupMediaFormModal open={addModal} onClose={() => setAddModal(false)} />

      <StartupMediaEditModal item={editItem} onClose={() => setEditItem(null)} />

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Startup Media"
        message="Are you sure you want to delete this startup media entry?"
      />
    </div>
  )
}
