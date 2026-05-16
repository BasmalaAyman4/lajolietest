// ─── HowToUseCard ─────────────────────────────────────────────────────────────
//
//  Displays one HowToUse entry.
//  - Media type Image → shows the image
//  - Media type Video → shows the thumbnail with a play overlay; clicking opens the video
//  Includes edit-delete action bar at the bottom.

import { useState } from 'react'
import { HiPlay, HiTrash, HiEyeOff, HiEye } from 'react-icons/hi'
import { cn } from '@/lib/cn'
import { StatusBadge } from '@/components/shared'
import type { HowToUse } from '../types'
import { MEDIA_TYPE } from '../types'

interface HowToUseCardProps {
  item: HowToUse
  onDelete: (id: number) => void
}

export default function HowToUseCard({ item, onDelete }: HowToUseCardProps) {
  const [videoOpen, setVideoOpen] = useState(false)
  const isVideo = item.howToUseMediaTypeId === MEDIA_TYPE.VIDEO

  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:shadow-[var(--shadow)] transition-shadow">

      {/* ── Media area ────────────────────────────────────────────────── */}
      <div className="relative bg-[var(--bg-hover)] aspect-video overflow-hidden">

        {isVideo ? (
          videoOpen ? (
            // Inline video player
            <video
              src={item.videoUrl ?? ''}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            // Thumbnail with play overlay
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="w-full h-full group relative"
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.titleEn} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-hover)]">
                  <HiPlay size={32} className="text-[var(--text-muted)]" />
                </div>
              )}
              {/* Play button overlay */}
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
          // Image
          item.imageUrl ? (
            <img src={item.imageUrl} alt={item.titleEn} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiEyeOff size={28} className="text-[var(--text-muted)]" />
            </div>
          )
        )}

        {/* Media type badge */}
        <span className="absolute top-2 start-2 text-xs font-medium px-2 py-0.5 rounded-full
          bg-black/50 text-white backdrop-blur-sm">
          {item.howToUseMediaTypeName}
        </span>

        {/* Sort order badge */}
        <span className="absolute top-2 end-2 text-xs font-bold w-6 h-6 rounded-full
          bg-[var(--accent)] text-white flex items-center justify-center">
          {item.sortOrder}
        </span>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 p-4 flex-1">

        {/* Purpose tag */}
        <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full w-fit">
          {item.howToUsePurposeName}
        </span>

        {/* Titles */}
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{item.titleEn}</p>
          <p className="text-xs text-[var(--text-muted)] line-clamp-1" dir="rtl">{item.titleAr}</p>
        </div>

        {/* Description */}
        {item.descriptionEn && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{item.descriptionEn}</p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border)]">
          <StatusBadge active={item.isActive} />
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
  )
}
