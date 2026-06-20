// ─── PendingPhotoApprovalsPage ────────────────────────────────────────────────
//
//  Route: /admin/salons/pending-approvals
//
//  ROUND-2 PERFORMANCE FIXES (on top of round 1):
//
//  1. useNavigate hoisted to page level + passed as prop — React Router's context
//     updates were silently breaking memo on every ImageCard.
//
//  2. Inline arrow handlers inside ImageCard replaced with stable per-item
//     useCallback hooks (handleApproveClick, handleDeleteClick, handleZoomClick)
//     so memo is never invalidated by a new closure.
//
//  3. will-change: transform on card images — pre-promotes each image to its own
//     GPU compositing layer, eliminating the per-hover layer-promotion jank that
//     caused scroll stutter on the full grid.
//
//  4. Lightbox backdrop-blur replaced with a solid semi-transparent bg — blur
//     triggers a full GPU repaint on mount/unmount. The visual difference is
//     imperceptible at 80% opacity but the performance gain is significant.
//
//  5. isFetching opacity animation moved OFF the grid container (which repaints
//     all 20 images) onto a lightweight absolute overlay div — only one element
//     animates, zero image repaints.
//
//  6. Pagination page-window memoized with useMemo — was recomputing on every
//     keystroke / hover event that re-rendered the Pagination component.
//
//  7. CSS contain: layout style on each card — tells the browser each card is
//     an independent layout/paint context, drastically reducing the repaint
//     area when one card changes state.
//
//  8. Image onError handlers stabilized as module-level constants — no new
//     function allocation per render.

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  memo,
} from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  HiCheck,
  HiTrash,
  HiPhotograph,
  HiOfficeBuilding,
  HiUser,
  HiFilter,
  HiZoomIn,
  HiX,
} from 'react-icons/hi'
import { Select, ConfirmModal } from '@/components/shared'
import {
  useGetPendingPhotoApprovalsQuery,
  useApprovePendingPhotoMutation,
  useDeleteSalonImageMutation,
  useDeleteSalonLogoMutation,    // ← add
  useDeleteSalonBannerMutation,
} from '../services/salonApi'
import type { PendingPhotoItem } from '../types'
import { getApiError } from '@/services/apiHelpers'
import { useTranslation } from 'react-i18next'

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
const DEFAULT_PAGE_SIZE = 20

type SectionFilter = 'All' | 'Gallery' | 'Logo' | 'Banner' | 'Specialist'
const SECTION_FILTERS: SectionFilter[] = ['All', 'Gallery', 'Logo', 'Banner', 'Specialist']
const SECTION_KEYS = ['Gallery', 'Logo', 'Banner', 'Specialist'] as const

const SECTION_STYLES: Record<string, string> = {
  Gallery:    'bg-blue-500/10 text-blue-500',
  Logo:       'bg-purple-500/10 text-purple-500',
  Banner:     'bg-orange-500/10 text-orange-500',
  Specialist: 'bg-emerald-500/10 text-emerald-500',
}

// Stable skeleton keys — never re-allocated
const SKELETON_KEYS_20 = Array.from({ length: DEFAULT_PAGE_SIZE }, (_, i) => i)

// Stable image error handlers — one allocation at module load, never per-render
const onCardImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image'
}
const onLightboxImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image'
}

// ── Section pill ──────────────────────────────────────────────────────────────
const SectionBadge = memo(function SectionBadge({ section }: { section: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
        SECTION_STYLES[section] ?? 'bg-[var(--border)] text-[var(--text-muted)]'
      }`}
    >
      {section}
    </span>
  )
})

// ── Lightbox ──────────────────────────────────────────────────────────────────
// - createPortal keeps it out of the grid subtree
// - No backdrop-blur (replaced with solid bg) — avoids full GPU repaint on mount
// - transform: translateZ(0) on the container isolates it from the main stacking context
const Lightbox = memo(function Lightbox({
  item,
  onClose,
}: {
  item: PendingPhotoItem
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      // Solid bg instead of backdrop-blur — same visual at 85% opacity, zero repaint cost
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', transform: 'translateZ(0)' }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 end-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20
          text-white flex items-center justify-center transition-colors z-10"
      >
        <HiX size={18} />
      </button>

      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.imageUrl}
          alt={item.salonNameEn}
          className="max-w-full max-h-[80vh] rounded-[var(--radius-lg)] object-contain shadow-2xl"
          onError={onLightboxImgError}
        />
        <div className="flex items-center gap-2">
          <SectionBadge section={item.section} />
          <span className="text-white/80 text-sm font-medium">{item.salonNameEn}</span>
          {item.section === 'Specialist' && item.sectionItemNameEn && (
            <span className="text-white/50 text-xs">· {item.sectionItemNameEn}</span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
})

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden animate-pulse"
      style={{ contain: 'layout style' }}
    >
      <div className="aspect-square bg-[var(--bg-hover)]" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 w-2/3 rounded bg-[var(--bg-hover)]" />
        <div className="h-2.5 w-1/2 rounded bg-[var(--bg-hover)]" />
        <div className="h-2.5 w-1/3 rounded bg-[var(--bg-hover)]" />
      </div>
    </div>
  )
})

// ── Image card ────────────────────────────────────────────────────────────────
// All three click handlers are useCallback inside the card so their identity is
// stable across parent re-renders. Combined with React.memo this means a card
// only re-renders when item / isApproving / isDeleting actually change.
//
// navigate is passed as a prop (hoisted to page) — React Router context updates
// were silently invalidating memo on every navigation-related context change.
//
// CSS contain: layout style — tells the browser this card is an independent
// layout/paint context. Changing one card's state does not dirty its siblings.
//
// will-change: transform on the img — pre-promotes the image to a GPU layer so
// the scale-105 hover transform is instant (no layer-promotion jank on hover).
interface ImageCardProps {
  item: PendingPhotoItem
  onApprove: (item: PendingPhotoItem) => void
  onDelete: (item: PendingPhotoItem) => void
  onZoom: (item: PendingPhotoItem) => void
  isApproving: boolean
  isDeleting: boolean
  navigate: ReturnType<typeof useNavigate>
}

const ImageCard = memo(function ImageCard({
  item,
  onApprove,
  onDelete,
  onZoom,
  isApproving,
  isDeleting,
  navigate,
}: ImageCardProps) {
  // Stable handlers — item identity is stable (same object ref per page load)
  // so these are only recreated when the item itself changes
  const handleApproveClick = useCallback(() => onApprove(item), [onApprove, item])
  const handleDeleteClick  = useCallback(() => onDelete(item),  [onDelete,  item])
  const handleZoomClick    = useCallback(() => onZoom(item),    [onZoom,    item])
  const handleNavClick     = useCallback(
    () => navigate(`/salon-detail/${item.salonId}`),
    [navigate, item.salonId],
  )

  return (
    <div
      className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden flex flex-col"
      // contain: layout style — isolates this card's layout/paint from its siblings
      style={{ contain: 'layout style' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--bg-hover)]">
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          // will-change pre-promotes to GPU layer — eliminates per-hover jank on full grid
          style={{ willChange: 'transform' }}
          onError={onCardImgError}
        />

        <button
          type="button"
          onClick={handleZoomClick}
          className="absolute top-2 end-2 w-7 h-7 rounded-full bg-black/50 text-white
            flex items-center justify-center opacity-0 group-hover:opacity-100
            hover:bg-black/70 transition-all duration-200 hover:scale-110"
          title="Zoom image"
        >
          <HiZoomIn size={14} />
        </button>

        <div className="absolute top-2 start-2">
          <SectionBadge section={item.section} />
        </div>
      </div>

      {/* Meta */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <button
          type="button"
          onClick={handleNavClick}
          className="flex items-center gap-1.5 min-w-0 group/link text-start"
        >
          <HiOfficeBuilding size={12} className="text-[var(--text-muted)] shrink-0" />
          <span className="text-xs font-medium text-[var(--text-primary)] truncate
            group-hover/link:text-[var(--accent)] group-hover/link:underline transition-colors">
            {item.salonNameEn}
          </span>
        </button>

        {item.salonNameAr && (
          <p className="text-[10px] text-[var(--text-muted)] truncate" dir="rtl">
            {item.salonNameAr}
          </p>
        )}

        {item.section === 'Specialist' && item.sectionItemNameEn && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <HiUser size={11} className="text-[var(--text-muted)] shrink-0" />
            <span className="text-[10px] text-[var(--text-secondary)] truncate">
              {item.sectionItemNameEn}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            disabled={isApproving || isDeleting}
            onClick={handleApproveClick}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[var(--radius)]
              text-xs font-medium text-[var(--success)] bg-[var(--success)]/10
              hover:bg-[var(--success)]/20 transition-colors disabled:opacity-40"
          >
            {isApproving
              ? <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              : <HiCheck size={13} />
            }
            Approve
          </button>
          <button
            type="button"
            disabled={isApproving || isDeleting}
            onClick={handleDeleteClick}
            className="w-8 h-7 flex items-center justify-center rounded-[var(--radius)]
              text-[var(--danger)] bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20
              transition-colors disabled:opacity-40"
            title="Delete"
          >
            {isDeleting
              ? <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              : <HiTrash size={13} />
            }
          </button>
        </div>
      </div>
    </div>
  )
})

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = memo(function Pagination({
  page,
  lastPageNo,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  lastPageNo: number
  totalCount: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}) {
  // Memoize page window — was recomputing on every parent hover/interaction
  const pageWindow = useMemo((): (number | '…')[] => {
    if (lastPageNo <= 7) return Array.from({ length: lastPageNo }, (_, i) => i + 1)
    const result: (number | '…')[] = []
    result.push(1)
    if (page > 3) result.push('…')
    for (let p = Math.max(2, page - 1); p <= Math.min(lastPageNo - 1, page + 1); p++) {
      result.push(p)
    }
    if (page < lastPageNo - 2) result.push('…')
    result.push(lastPageNo)
    return result
  }, [page, lastPageNo])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)]">Per page:</span>
        <Select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          options={PAGE_SIZE_OPTIONS.map((s) => ({ label: String(s), value: s }))}
          className="text-xs py-1 px-2 min-w-[64px]"
        />
      </div>

      <span className="text-xs text-[var(--text-muted)]">
        {totalCount} total · page {page}/{lastPageNo}
      </span>

      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="w-7 h-7 text-xs flex items-center justify-center rounded-[var(--radius)]
            text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹
        </button>

        {pageWindow.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="text-xs text-[var(--text-muted)] px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(Number(p))}
              className={`w-7 h-7 text-xs rounded-[var(--radius)] font-medium transition-all ${
                p === page
                  ? 'bg-[var(--accent)] text-white shadow-sm scale-105'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          disabled={page >= lastPageNo}
          onClick={() => onPageChange(page + 1)}
          className="w-7 h-7 text-xs flex items-center justify-center rounded-[var(--radius)]
            text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  )
})

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PendingPhotoApprovalsPage() {
  // Hoisted here so React Router context updates don't break ImageCard.memo
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [section, setSection]   = useState<SectionFilter>('All')
  const [lightbox, setLightbox] = useState<PendingPhotoItem | null>(null)

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    item: PendingPhotoItem | null
  }>({ open: false, item: null })

  // Per-item loading state — only the acting card re-renders
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set())
  const [deletingIds,  setDeletingIds]  = useState<Set<string>>(new Set())

  const { data, isLoading, isFetching, refetch } = useGetPendingPhotoApprovalsQuery({
    pageNo: page,
    pageSize,
  })

  const [approvePendingPhoto] = useApprovePendingPhotoMutation()
const [deleteImage]  = useDeleteSalonImageMutation()
const [deleteLogo]   = useDeleteSalonLogoMutation()
const [deleteBanner] = useDeleteSalonBannerMutation()
  // Stable refs — mutations/refetch accessed via ref so useCallback deps stay []
  const approvePendingPhotoRef = useRef(approvePendingPhoto)
const deleteImageRef  = useRef(deleteImage)
const deleteLogoRef   = useRef(deleteLogo)
const deleteBannerRef = useRef(deleteBanner)

const refetchRef = useRef(refetch)
useEffect(() => { approvePendingPhotoRef.current = approvePendingPhoto }, [approvePendingPhoto])
useEffect(() => { deleteImageRef.current         = deleteImage          }, [deleteImage])
useEffect(() => { refetchRef.current             = refetch              }, [refetch])

useEffect(() => { deleteImageRef.current  = deleteImage  }, [deleteImage])
useEffect(() => { deleteLogoRef.current   = deleteLogo   }, [deleteLogo])
useEffect(() => { deleteBannerRef.current = deleteBanner }, [deleteBanner]) 
  const handleApprove = useCallback(async (item: PendingPhotoItem) => {
    const key = `${item.section}-${item.entityId}`
    setApprovingIds((prev) => new Set(prev).add(key))
    try {
      await approvePendingPhotoRef.current({ entityId: item.entityId, section: item.section }).unwrap()
      toast.success(`${item.section} image approved`)
      refetchRef.current()
    } catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            } finally {
      setApprovingIds((prev) => { const s = new Set(prev); s.delete(key); return s })
    }
  }, [])

  const handleOpenDeleteModal = useCallback((item: PendingPhotoItem) => {
    setDeleteModal({ open: true, item })
  }, [])

  // Replace handleDeleteConfirm:
const handleDeleteConfirm = async () => {
  if (!deleteModal.item) return
  const { section, entityId, salonId } = deleteModal.item
  const key = `${section}-${entityId}`
  setDeletingIds((prev) => new Set(prev).add(key))
  try {
    if (section === 'Logo') {
      await deleteLogoRef.current(salonId).unwrap()
    } else if (section === 'Banner') {
      await deleteBannerRef.current(salonId).unwrap()
    } else {
      // Gallery + Specialist both use entityId
      await deleteImageRef.current(entityId).unwrap()
    }
    toast.success('Image deleted')
    refetchRef.current()
  } catch (error: any) {
    toast.error(getApiError(error, t('common.error')))
  } finally {
    setDeletingIds((prev) => { const s = new Set(prev); s.delete(key); return s })
    setDeleteModal({ open: false, item: null })
  }
}

  const handleCloseLightbox = useCallback(() => setLightbox(null), [])

  const handlePageSizeChange = useCallback((s: number) => {
    setPageSize(s)
    setPage(1)
  }, [])

  // ── Derived data ──────────────────────────────────────────────────────────
  const rawItems = data?.data ?? []

  const sectionCounts = useMemo(
    () =>
      rawItems.reduce<Record<string, number>>((acc, i) => {
        acc[i.section] = (acc[i.section] ?? 0) + 1
        return acc
      }, {}),
    [rawItems],
  )

  const displayItems = useMemo(
    () => (section === 'All' ? rawItems : rawItems.filter((i) => i.section === section)),
    [rawItems, section],
  )

  const skeletonKeys =
    pageSize === DEFAULT_PAGE_SIZE
      ? SKELETON_KEYS_20
      : Array.from({ length: pageSize }, (_, i) => i)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Pending Photo Approvals
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {isLoading
              ? 'Loading…'
              : `${data?.totalCount ?? 0} images awaiting review`}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <HiFilter size={14} className="text-[var(--text-muted)]" />
          {SECTION_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                section === s
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s}
              {s !== 'All' && sectionCounts[s] ? (
                <span className="ms-1 opacity-70">({sectionCounts[s]})</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary strip ───────────────────────────────────────────────────── */}
      {!isLoading && data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SECTION_KEYS.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSection(sec)}
              className={`rounded-[var(--radius-lg)] border px-4 py-3 text-start transition-all ${
                section === sec
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <p className="text-xs text-[var(--text-muted)]">{sec}</p>
              <p className={`text-2xl font-semibold mt-0.5 ${
                section === sec ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
              }`}>
                {sectionCounts[sec] ?? 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">on this page</p>
            </button>
          ))}
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {/* isFetching overlay is a single absolute div — no image repaints */}
      <div className="relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">

        {isFetching && !isLoading && (
          <div
            className="absolute inset-0 z-10 rounded-[var(--radius-lg)] transition-opacity pointer-events-none"
            style={{ backgroundColor: 'var(--bg-card)', opacity: 0.5 }}
          />
        )}

        <div className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {skeletonKeys.map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--text-muted)]">
              <HiPhotograph size={40} className="opacity-30" />
              <p className="text-sm">
                {section === 'All'
                  ? 'No pending images — everything is approved!'
                  : `No pending ${section} images on this page.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayItems.map((item) => {
                const key = `${item.section}-${item.entityId}`
                return (
                  <ImageCard
                    key={key}
                    item={item}
                    onApprove={handleApprove}
                    onDelete={handleOpenDeleteModal}
                    onZoom={setLightbox}
                    isApproving={approvingIds.has(key)}
                    isDeleting={deletingIds.has(key)}
                    navigate={navigate}
                  />
                )
              })}
            </div>
          )}
        </div>

        {!isLoading && data && data.lastPageNo > 0 && (
          <Pagination
            page={page}
            lastPageNo={data.lastPageNo}
            totalCount={data.totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {lightbox && (
        <Lightbox item={lightbox} onClose={handleCloseLightbox} />
      )}

      {/* ── Delete confirm modal ─────────────────────────────────────────────── */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        loading={deletingIds.size > 0}
        title="Delete Image"
        message={`Are you sure you want to permanently delete this ${
          deleteModal.item?.section.toLowerCase() ?? 'image'
        } image from "${deleteModal.item?.salonNameEn ?? ''}"?`}
      />
    </div>
  )
}