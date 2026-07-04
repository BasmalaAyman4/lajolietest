// ─── SuggestionRoutineImagesModal ─────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiUpload, HiX } from 'react-icons/hi'
import { Modal, Button } from '@/components/shared'
import UploadImage, { type UploadedFile } from '@/components/shared/UploadImage'
import {
  useLazyGetSuggestionRoutineQuery,
  useAddSuggestionRoutineImagesMutation,
  useDeleteSuggestionRoutineImageMutation,
} from '../services/suggestionRoutineApi'
import { getApiError } from '@/services/apiHelpers'

interface SuggestionRoutineImagesModalProps {
  open: boolean
  onClose: () => void
  suggestionRoutineId: number
  suggestionRoutineName: string
}

export default function SuggestionRoutineImagesModal({
  open,
  onClose,
  suggestionRoutineId,
  suggestionRoutineName,
}: SuggestionRoutineImagesModalProps) {
  const { t } = useTranslation()

  const [fetchRoutine, { data: routine, isFetching }] = useLazyGetSuggestionRoutineQuery()
  const [addImages, { isLoading: isUploading }] = useAddSuggestionRoutineImagesMutation()
  const [deleteImage, { isLoading: isDeleting }] = useDeleteSuggestionRoutineImageMutation()

  const [pendingImages, setPendingImages] = useState<UploadedFile[]>([])

  useEffect(() => {
    if (open) fetchRoutine(suggestionRoutineId)
  }, [open, suggestionRoutineId, fetchRoutine])

  const handleClose = () => {
    pendingImages.forEach((f) => URL.revokeObjectURL(f.preview))
    setPendingImages([])
    onClose()
  }

  const handleUpload = async () => {
    if (pendingImages.length === 0) return
    try {
      await addImages({ suggestionRoutineId, images: pendingImages.map((f) => f.file) }).unwrap()
      pendingImages.forEach((f) => URL.revokeObjectURL(f.preview))
      setPendingImages([])
      toast.success(t('common.success'))
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteImage({ imageId, suggestionRoutineId }).unwrap()
      toast.success(t('common.success'))
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('routine.uploadImages', 'Upload Images')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
            {t('common.close', 'Close')}
          </Button>
          <Button
            onClick={handleUpload}
            loading={isUploading}
            disabled={pendingImages.length === 0}
            leftIcon={<HiUpload size={14} />}
          >
            {t('common.upload', 'Upload')}{pendingImages.length > 0 ? ` (${pendingImages.length})` : ''}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          {t('routine.uploadingFor', 'Uploading images for')}{' '}
          <span className="font-medium text-[var(--text-primary)]">{suggestionRoutineName}</span>
        </p>

        {isFetching ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          routine && routine.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {routine.images.map((img) => (
                <div
                  key={img.id}
                  className="relative w-20 h-20 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] group"
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    disabled={isDeleting}
                    className="absolute top-1 end-1 w-6 h-6 rounded-full bg-[var(--danger)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiX size={11} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        <UploadImage mode="image" multiple value={pendingImages} onChange={setPendingImages} />
      </div>
    </Modal>
  )
}