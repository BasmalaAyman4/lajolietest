// ─── ImageGalleryPanel ────────────────────────────────────────────────────────
//
//  A reusable image gallery panel that matches the PendingPhotoApprovalsPage
//  visual language. Drop it into any page: salon images, driver photos,
//  vehicle images, specialist portraits, etc.
//
//  Features:
//  - Consistent card design: aspect-square, hover overlay, zoom lightbox
//  - Configurable per-image action buttons (approve/unapprove, delete, custom)
//  - Optional status badge per image (approved, pending, etc.)
//  - Skeleton loading, empty state
//  - Built-in lightbox via createPortal
//  - Optional upload section (pass <UploadSection> as a child or via prop)
//  - Performance: memo + stable callbacks, contain: layout style, will-change
//
//  Usage example (SalonImagesPanel):
//
//    <ImageGalleryPanel
//      images={images.map(img => ({
//        id: img.id,
//        imageUrl: img.imageUrl,
//        badge: img.isApproved ? { label: 'Approved', variant: 'success' } : undefined,
//      }))}
//      isLoading={isLoading}
//      emptyMessage="No images uploaded yet"
//      actions={(img) => [
//        {
//          icon: img.badge ? <TbXboxXFilled size={16} /> : <HiCheck size={16} />,
//          label: img.badge ? 'Unapprove' : 'Approve',
//          variant: img.badge ? 'danger' : 'success',
//          onClick: () => handleApprove(img),
//          isLoading: approvingIds.has(img.id),
//        },
//        {
//          icon: <HiTrash size={16} />,
//          label: 'Delete',
//          variant: 'danger',
//          shape: 'icon',
//          onClick: () => setDeleteModal({ open: true, id: img.id }),
//          isLoading: deletingIds.has(img.id),
//        },
//      ]}
//      uploadSection={<MyUploadSection />}   // optional
//    />

import {
  useState,
  useCallback,
  useEffect,
  memo,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { HiPhotograph, HiZoomIn, HiX } from 'react-icons/hi'

// ─── Public types ─────────────────────────────────────────────────────────────

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'muted'

export interface ImageBadge {
  label: string
  variant: BadgeVariant
}

export interface GalleryImage {
  /** Unique id for the image — used as React key and for action callbacks */
  id: string | number
  imageUrl: string
  /** Optional top-start badge (e.g. "Approved", "Pending", section label) */
  badge?: ImageBadge
  /** Any extra metadata you want available in action callbacks */
  meta?: Record<string, unknown>
}

export type ActionVariant = 'success' | 'danger' | 'accent' | 'muted'
export type ActionShape   = 'full' | 'icon'

export interface ImageAction {
  icon: ReactNode
  label: string
  variant: ActionVariant
  /** 'full' = flex-1 labelled button, 'icon' = square icon button. Default: 'full' */
  shape?: ActionShape
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
}

export interface ImageGalleryPanelProps {
  images: GalleryImage[]
  /** Show skeleton grid while loading */
  isLoading?: boolean
  /** Show a semi-transparent overlay on the grid during background refetches */
  isFetching?: boolean
  /** Action buttons rendered in the card hover overlay.
   *  Receives the image so you can derive icon/label from its state. */
  actions?: (img: GalleryImage) => ImageAction[]
  /** Slot for an upload section rendered above the gallery */
  uploadSection?: ReactNode
  /** Message shown when images array is empty */
  emptyMessage?: string
  /** Column layout — defaults to responsive 2→3→4 */
  columns?: 'default' | 'dense'
  /** Number of skeleton cards to show while loading */
  skeletonCount?: number
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-[var(--success)]/15 text-[var(--success)]',
  danger:  'bg-[var(--danger)]/15  text-[var(--danger)]',
  warning: 'bg-yellow-500/15        text-yellow-500',
  info:    'bg-blue-500/15          text-blue-500',
  muted:   'bg-[var(--border)]      text-[var(--text-muted)]',
}

const ACTION_STYLES: Record<ActionVariant, string> = {
  success: 'text-[var(--success)] bg-[var(--success)]/10 hover:bg-[var(--success)]/20',
  danger:  'text-[var(--danger)]  bg-[var(--danger)]/10  hover:bg-[var(--danger)]/20',
  accent:  'text-[var(--accent)]  bg-[var(--accent)]/10  hover:bg-[var(--accent)]/20',
  muted:   'text-[var(--text-muted)] bg-[var(--bg-hover)] hover:bg-[var(--border)]',
}

const onCardImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  ;(e.target as HTMLImageElement).src = 'https://placehold.co/300x300'
}
const onLightboxImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  ;(e.target as HTMLImageElement).src = 'https://placehold.co/600x600'
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const ImageBadgeEl = memo(function ImageBadgeEl({ badge }: { badge: ImageBadge }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase
        tracking-wide ${BADGE_STYLES[badge.variant]}`}
    >
      {badge.label}
    </span>
  )
})

// ─── Lightbox ─────────────────────────────────────────────────────────────────

const Lightbox = memo(function Lightbox({
  image,
  onClose,
}: {
  image: GalleryImage
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
          src={image.imageUrl}
          alt=""
          className="max-w-full max-h-[80vh] rounded-[var(--radius-lg)] object-contain shadow-2xl"
          onError={onLightboxImgError}
        />

        {image.badge && (
          <ImageBadgeEl badge={image.badge} />
        )}
      </div>
    </div>,
    document.body,
  )
})

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]
        overflow-hidden animate-pulse"
      style={{ contain: 'layout style' }}
    >
      <div className="aspect-square bg-[var(--bg-hover)]" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-2.5 w-2/3 rounded bg-[var(--bg-hover)]" />
        <div className="h-2 w-1/2 rounded bg-[var(--bg-hover)]" />
      </div>
    </div>
  )
})

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
  )
}

// ─── Image card ───────────────────────────────────────────────────────────────

interface ImageCardProps {
  image: GalleryImage
  actions: ImageAction[]
  onZoom: (img: GalleryImage) => void
}

const ImageCard = memo(function ImageCard({ image, actions, onZoom }: ImageCardProps) {
  const handleZoomClick = useCallback(() => onZoom(image), [onZoom, image])

  return (
    <div
      className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]
        overflow-hidden flex flex-col"
      style={{ contain: 'layout style' }}
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-[var(--bg-hover)]">
        <img
          src={image.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ willChange: 'transform' }}
          onError={onCardImgError}
        />

        {/* Zoom button */}
        <button
          type="button"
          onClick={handleZoomClick}
          className="absolute top-2 end-2 w-7 h-7 rounded-full bg-black/50 text-white
            flex items-center justify-center opacity-0 group-hover:opacity-100
            hover:bg-black/70 transition-all duration-200 hover:scale-110"
          title="Zoom"
        >
          <HiZoomIn size={14} />
        </button>

        {/* Badge */}
        {image.badge && (
          <div className="absolute top-2 start-2">
            <ImageBadgeEl badge={image.badge} />
          </div>
        )}
      </div>

      {/* Actions row */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2 p-3 border-t border-[var(--border)]">
          {actions.map((action, i) => {
            const isIcon = action.shape === 'icon'
            return (
              <button
                key={i}
                type="button"
                disabled={action.disabled || action.isLoading}
                onClick={action.onClick}
                title={action.label}
                className={`
                  flex items-center justify-center gap-1 rounded-[var(--radius)]
                  text-xs font-medium transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${ACTION_STYLES[action.variant]}
                  ${isIcon ? 'w-8 h-7 shrink-0' : 'flex-1 py-1.5'}
                `}
              >
                {action.isLoading ? <Spinner /> : action.icon}
                {!isIcon && (
                  <span>{action.label}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})

// ─── Main component ───────────────────────────────────────────────────────────

const COLUMN_CLASSES = {
  default: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  dense:   'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
}

export default function ImageGalleryPanel({
  images,
  isLoading = false,
  isFetching = false,
  actions,
  uploadSection,
  emptyMessage = 'No images uploaded yet',
  columns = 'default',
  skeletonCount = 8,
  className = '',
}: ImageGalleryPanelProps) {
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)
  const handleZoom = useCallback((img: GalleryImage) => setLightbox(img), [])
  const handleCloseLightbox = useCallback(() => setLightbox(null), [])

  const colClass = COLUMN_CLASSES[columns]

  return (
    <>
      {/* ── Upload slot ──────────────────────────────────────────────────────── */}
      {uploadSection && (
        <div className="mb-5">
          {uploadSection}
        </div>
      )}

      {/* ── Gallery ──────────────────────────────────────────────────────────── */}
      <div
        className={`relative rounded-[var(--radius-lg)] border border-[var(--border)]
          bg-[var(--bg-card)] overflow-hidden ${className}`}
      >
        {/* isFetching overlay — single element, no image repaints */}
        {isFetching && !isLoading && (
          <div
            className="absolute inset-0 z-10 rounded-[var(--radius-lg)] pointer-events-none transition-opacity"
            style={{ backgroundColor: 'var(--bg-card)', opacity: 0.5 }}
          />
        )}

        <div className="p-4">
          {isLoading ? (
            <div className={`grid ${colClass} gap-3`}>
              {Array.from({ length: skeletonCount }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16
              text-[var(--text-muted)]"
            >
              <HiPhotograph size={36} className="opacity-30" />
              <p className="text-sm">{emptyMessage}</p>
            </div>
          ) : (
            <div className={`grid ${colClass} gap-3`}>
              {images.map((img) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  actions={actions ? actions(img) : []}
                  onZoom={handleZoom}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {lightbox && (
        <Lightbox image={lightbox} onClose={handleCloseLightbox} />
      )}
    </>
  )
}