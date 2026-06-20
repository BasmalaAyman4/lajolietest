
import { useState } from 'react'
import { HiPlay, HiTrash, HiEyeOff, HiGlobeAlt, HiDeviceMobile, HiPencil } from 'react-icons/hi'
import { StatusBadge } from '@/components/shared'
import { cn } from '@/lib/cn'
import type { StartupMedia } from '../types'
import { MEDIA_TYPE } from '../types'

interface StartupMediaCardProps {
  item: StartupMedia
  onEdit: (item: StartupMedia) => void
  onDelete: (id: number) => void
}

/** "2025-06-01T00:00:00" → "Jun 01, 2025" */
function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function StartupMediaCard({ item, onEdit, onDelete }: StartupMediaCardProps) {
  const [videoOpen, setVideoOpen] = useState(false)
  const isVideo = item.startupMediaTypeId === MEDIA_TYPE.VIDEO

  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:shadow-[var(--shadow)] transition-shadow">

      {/* ── Media area ────────────────────────────────────────────────── */}
      <div className="relative bg-[var(--bg-hover)] aspect-video overflow-hidden">

        {isVideo ? (
          videoOpen ? (
            <video
              src={item.filePath ?? ''}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="w-full h-full group relative"
            >
              {item.thumbnailPath ? (
                <img src={item.thumbnailPath} alt="thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-hover)]">
                  <HiPlay size={32} className="text-[var(--text-muted)]" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center
                bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center
                  shadow-lg group-hover:scale-110 transition-transform">
                  <HiPlay size={20} className="text-[var(--accent)] ms-0.5" />
                </div>
              </div>
            </button>
          )
        ) : (
          item.filePath ? (
            <img src={item.filePath} alt="startup media" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiEyeOff size={28} className="text-[var(--text-muted)]" />
            </div>
          )
        )}

        {/* Media type badge */}
        <span className="absolute top-2 start-2 text-xs font-medium px-2 py-0.5 rounded-full
          bg-black/50 text-white backdrop-blur-sm">
          {item.startupMediaTypeName}
        </span>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 flex-1">

        {/* Date range */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">{formatDate(item.fromDate)}</span>
          <span className="text-[var(--text-muted)]">→</span>
          <span className="font-medium text-[var(--text-primary)]">{formatDate(item.toDate)}</span>
        </div>

        {/* Platform flags */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
            item.webFlag
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border-[var(--border)] opacity-50',
          )}>
            <HiGlobeAlt size={11} />
            Web
          </span>
          <span className={cn(
            'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
            item.appFlag
              ? 'bg-purple-50 text-purple-600 border-purple-200'
              : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border-[var(--border)] opacity-50',
          )}>
            <HiDeviceMobile size={11} />
            App
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border)]">
          <StatusBadge active={item.isActive} />
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Edit"
              onClick={() => onEdit(item)}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
            >
              <HiPencil size={14} />
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => onDelete(item.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
            >
              <HiTrash size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
