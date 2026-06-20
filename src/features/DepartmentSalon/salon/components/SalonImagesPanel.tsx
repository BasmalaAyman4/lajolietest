// ─── SalonImagesPanel ─────────────────────────────────────────────────────────
//
//  Uses the shared <ImageGalleryPanel> component so it automatically matches
//  the PendingPhotoApprovalsPage visual language.
//
//  Responsibilities here:
//  - RTK Query mutations (approve, delete, upload)
//  - Mapping SalonImage → GalleryImage shape
//  - Building the action config per image
//  - Owning the delete confirm modal
//  - Rendering the upload section as a slot

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { HiCheck, HiTrash, HiUpload } from 'react-icons/hi'
import { TbXboxXFilled } from 'react-icons/tb'

import { ConfirmModal } from '@/components/shared'
import UploadImage, { type UploadedFile } from '@/components/shared/UploadImage'
import type { SalonImage } from '../types'
import {
  useApproveImageMutation,
  useDeleteSalonImageMutation,
  useAddSalonImagesMutation,
} from '../services/salonApi'

import ImageGalleryPanel, { type GalleryImage, type ImageAction } from '@/components/shared/ImageGalleryPanel'

interface SalonImagesPanelProps {
  salonId: number
  images: SalonImage[]
  isLoading?: boolean
  onMutated: () => void
}

export default function SalonImagesPanel({
  salonId,
  images,
  isLoading,
  onMutated,
}: SalonImagesPanelProps) {
  const [approveImage]                              = useApproveImageMutation()
  const [deleteImage,  { isLoading: isDeleting }]  = useDeleteSalonImageMutation()
  const [addImages,    { isLoading: isUploading }] = useAddSalonImagesMutation()

  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([])
  const [deleteModal,  setDeleteModal]  = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // Per-image loading state (avoids re-rendering the whole grid per action)
  const [approvingIds, setApprovingIds] = useState<Set<number>>(new Set())

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!pendingFiles.length) return
    const form = new FormData()
    form.append('SalonId', String(salonId))
    pendingFiles.forEach((f) => form.append('SalonPictures', f.file))

    toast.promise(addImages(form).unwrap(), {
      loading: `Uploading ${pendingFiles.length} image${pendingFiles.length > 1 ? 's' : ''}…`,
      success: () => {
        setPendingFiles([])
        onMutated()
        return 'Images uploaded successfully'
      },
      error: 'Failed to upload images',
    })
  }

  // ── Approve ─────────────────────────────────────────────────────────────────
  const handleApprove = useCallback(async (img: SalonImage) => {
    setApprovingIds((prev) => new Set(prev).add(img.id))
    try {
      await approveImage(img.id).unwrap()
      toast.success(`Image ${img.isApproved ? 'unapproved' : 'approved'} successfully`)
      onMutated()
    } catch {
      toast.error('Failed to update image status')
    } finally {
      setApprovingIds((prev) => { const s = new Set(prev); s.delete(img.id); return s })
    }
  }, [approveImage, onMutated])

  // ── Delete ──────────────────────────────────────────────────────────────────
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

  // ── Map SalonImage → GalleryImage ───────────────────────────────────────────
  const galleryImages: GalleryImage[] = images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    badge: img.isApproved
      ? { label: 'Approved', variant: 'success' as const }
      : undefined,
    // Stash original so we can use it in the action builder
    meta: { original: img },
  }))

  // ── Actions per image ───────────────────────────────────────────────────────
  const buildActions = useCallback(
    (galleryImg: GalleryImage): ImageAction[] => {
      const original = galleryImg.meta?.original as SalonImage
      return [
        {
          icon: original.isApproved ? <TbXboxXFilled size={14} /> : <HiCheck size={14} />,
          label: original.isApproved ? 'Unapprove' : 'Approve',
          variant: original.isApproved ? 'danger' : 'success',
          onClick: () => handleApprove(original),
          isLoading: approvingIds.has(original.id),
        },
        {
          icon: <HiTrash size={14} />,
          label: 'Delete',
          variant: 'danger',
          shape: 'icon',
          onClick: () => setDeleteModal({ open: true, id: original.id }),
          disabled: isDeleting,
        },
      ]
    },
    [handleApprove, approvingIds, isDeleting],
  )

  // ── Upload section slot ─────────────────────────────────────────────────────
  const uploadSection = (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Upload Images</p>

      <UploadImage
        multiple
        value={pendingFiles}
        onChange={setPendingFiles}
        disabled={isUploading}
      />

      {pendingFiles.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">
            {pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''} ready
          </p>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)]
              bg-[var(--accent)] text-white text-sm font-medium
              hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiUpload size={14} />
            {isUploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <ImageGalleryPanel
        images={galleryImages}
        isLoading={isLoading}
        actions={buildActions}
        uploadSection={uploadSection}
        emptyMessage="No images uploaded yet"
        columns="default"
      />

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