// ─── SalonImagesPanel ─────────────────────────────────────────────────────────
//
//  Shows the gallery of salon images with approve / delete actions.
//  Also handles the logo approve action.

import { useState } from 'react'
import { toast } from 'sonner'
import { HiCheck, HiTrash, HiPhotograph } from 'react-icons/hi'
import { ConfirmModal } from '@/components/shared'
import type { SalonImage } from '../types'
import {
  useApproveImageMutation,
  useDeleteSalonImageMutation,
} from '../services/salonApi'

interface SalonImagesPanelProps {
  salonId: number
  images: SalonImage[]
  onMutated: () => void // caller refetches detail
}

export default function SalonImagesPanel({
  images,
  onMutated,
}: SalonImagesPanelProps) {
  const [approveImage, { isLoading: isApproving }] = useApproveImageMutation()
  const [deleteImage, { isLoading: isDeleting }] = useDeleteSalonImageMutation()

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  const handleApprove = async (id: number) => {
    try {
      await approveImage(id).unwrap()
      toast.success('Image approved')
      onMutated()
    } catch {
      toast.error('Failed to approve image')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteImage(deleteModal.id).unwrap()
      toast.success('Image deleted')
      onMutated()
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  if (!images.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-[var(--text-muted)]">
        <HiPhotograph size={32} className="opacity-40" />
        <p className="text-sm">No images uploaded</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative group rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] aspect-square"
          >
            {/* Image */}
            <img
              src={img.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/200x200?text=No+Image'
              }}
            />

            {/* Approved badge */}
            {img.isApproved && (
              <span className="absolute top-1.5 start-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--success)] px-2 py-0.5 text-[10px] font-medium text-white">
                <HiCheck size={10} /> Approved
              </span>
            )}

            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!img.isApproved && (
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={() => handleApprove(img.id)}
                  className="w-9 h-9 rounded-full bg-[var(--success)] text-white flex items-center justify-center
                    hover:scale-110 transition-all disabled:opacity-50 shadow-md"
                  title="Approve"
                >
                  <HiCheck size={16} />
                </button>
              )}
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModal({ open: true, id: img.id })}
                className="w-9 h-9 rounded-full bg-[var(--danger)] text-white flex items-center justify-center
                  hover:scale-110 transition-all disabled:opacity-50 shadow-md"
                title="Delete"
              >
                <HiTrash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Image"
        message="Are you sure you want to permanently delete this image?"
      />
    </>
  )
}