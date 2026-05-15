// ─── ColorImageManagement ─────────────────────────────────────────────────────
//
//  Displays per-color image cards.
//  Each card lets you upload, set primary, and delete images.
//  In isDisappearColor mode, uses product.colors directly.

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  FiStar,
  FiTrash2,
  FiPlus,
  FiImage,
} from 'react-icons/fi'

import { RiStarOffLine } from 'react-icons/ri'
import { Button, ConfirmModal } from '@/components/shared'
import UploadImage, { type UploadedFile } from '@/components/shared/UploadImage'
import {
  useGetProductColorsQuery,
  useAddProductImagesMutation,
  useSetPrimaryImageMutation,
  useDeleteProductImageMutation,
} from '../services/productApi'
import type { ProductFull, ProductImage } from '../types'

interface ColorImageManagementProps {
  productId: number
  product: ProductFull
  isDisappearColor?: boolean
  onUpdate?: () => void
}

interface ColorEntry {
  colorId: number
  nameEn: string
  nameAr: string
  colorHex: string
  availableSizes: { sizeId: number; nameAr: string; nameEn: string }[]
}

export default function ColorImageManagement({
  productId,
  product,
  isDisappearColor = false,
  onUpdate,
}: ColorImageManagementProps) {
  // Fetch colors from API (unless isDisappearColor — then use product.colors)
  const { data: fetchedColors = [], isLoading, isError, refetch } = useGetProductColorsQuery(
    productId,
    { skip: isDisappearColor },
  )

  const productImages = product.productImages ?? []

  const colorsToShow: ColorEntry[] = isDisappearColor
    ? (product.colors ?? []).map((c) => ({
        colorId: c.id,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        colorHex: c.colorHex ?? '#ffffff',
        availableSizes: (c.sizes ?? []).map((s) => ({
          sizeId: s.sizeId,
          nameAr: s.nameAr,
          nameEn: s.nameEn,
        })),
      }))
    : fetchedColors.map((c) => {
        const fromProduct = (product.colors ?? []).find((pc) => pc.id === c.colorId)
        return {
          colorId: c.colorId,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
          colorHex: c.colorHex ?? '#ffffff',
          availableSizes: (fromProduct?.sizes ?? []).map((s) => ({
            sizeId: s.sizeId,
            nameAr: s.nameAr,
            nameEn: s.nameEn,
          })),
        }
      })

  const handleMutate = () => {
    refetch()
    onUpdate?.()
  }

  if (!isDisappearColor && isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isDisappearColor && isError) {
    return (
      <div className="rounded-[var(--radius)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Failed to load colors. Please refresh.
      </div>
    )
  }

  if (colorsToShow.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-lg)]">
        <FiImage size={56} className="text-[var(--text-muted)] opacity-30 mb-3" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          {isDisappearColor ? 'No sizes yet' : 'No colors yet'}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {isDisappearColor
            ? 'Add sizes in the Sizes & Pricing tab first.'
            : 'Add colors & sizes first, then upload images here.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {isDisappearColor ? 'Product Images' : 'Product Images by Color'}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {isDisappearColor
            ? 'Upload images and select a size for each.'
            : 'Upload and manage images per color. Set a primary image for each color.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {colorsToShow.map((color) => (
          <ColorImageCard
            key={color.colorId}
            color={color}
            productId={productId}
            productImages={productImages}
            onMutate={handleMutate}
          />
        ))}
      </div>
    </div>
  )
}

// ── ColorImageCard ─────────────────────────────────────────────────────────────

interface CardProps {
  color: ColorEntry
  productId: number
  productImages: ProductImage[]
  onMutate: () => void
}

function ColorImageCard({ color, productId, productImages, onMutate }: CardProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedSizeId, setSelectedSizeId] = useState<number | ''>('')
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null)

  const [addImages, { isLoading: isUploading }] = useAddProductImagesMutation()
  const [setPrimary, { isLoading: isSettingPrimary }] = useSetPrimaryImageMutation()
  const [deleteImage, { isLoading: isDeletingImage }] = useDeleteProductImageMutation()

  const colorImages = productImages.filter((img) => img.colorId === color.colorId)

  const handleUpload = async () => {
    if (!uploadedFiles.length) return
    // sizeId is required only when sizes are available
    if (color.availableSizes.length > 0 && selectedSizeId === '') return
    const fd = new FormData()
    fd.append('ProductId', String(productId))
    fd.append('ColorId', String(color.colorId))
    if (selectedSizeId !== '') fd.append('SizeId', String(selectedSizeId))
    uploadedFiles.forEach((f) => fd.append('ProductPictures', f.file))
    try {
      await addImages(fd).unwrap()
      // reset UI — invalidatesTags on the mutation handles the refetch automatically
      setShowUpload(false)
      setUploadedFiles([])
      setSelectedSizeId('')
      toast.success('Images uploaded successfully')
    } catch {
      toast.error('Failed to upload images')
    }
  }

  const handleSetPrimary = async (imageId: number) => {
    try {
      await setPrimary({ productId, colorId: color.colorId, imageId }).unwrap()
      toast.success('Primary image updated')
    } catch {
      toast.error('Failed to set primary image')
    }
  }

  const handleDelete = async () => {
    if (!deleteImageId) return
    try {
      await deleteImage({ imageId: deleteImageId, productId }).unwrap()
      toast.success('Image deleted')
      setDeleteImageId(null)
    } catch {
      toast.error('Failed to delete image')
    }
  }

  return (
    <>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        {/* Color header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <div
            className="w-10 h-10 rounded border-2 border-[var(--border)] flex-shrink-0"
            style={{ backgroundColor: color.colorHex }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{color.nameEn}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{color.nameAr}</p>
            <p className="text-xs text-[var(--text-muted)]">{colorImages.length} image{colorImages.length !== 1 ? 's' : ''}</p>
          </div>
          <Button
            onClick={() => setShowUpload(true)}
            leftIcon={<FiPlus size={13} />}
          >
            Add Images
          </Button>
        </div>

        {/* Upload panel */}
        {showUpload && (
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex flex-col gap-3">
            {color.availableSizes.length === 0 ? (
              <p className="text-xs text-amber-600">No sizes for this color. Add sizes first.</p>
            ) : (
              <select
                value={selectedSizeId}
                onChange={(e) => setSelectedSizeId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                <option value="">Select size…</option>
                {color.availableSizes.map((s) => (
                  <option key={s.sizeId} value={s.sizeId}>
                    {s.nameAr} / {s.nameEn}
                  </option>
                ))}
              </select>
            )}
            <UploadImage
              multiple
              value={uploadedFiles}
              onChange={setUploadedFiles}
              disabled={isUploading}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => { setShowUpload(false); setUploadedFiles([]); setSelectedSizeId('') }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                loading={isUploading}
                disabled={!uploadedFiles.length || (color.availableSizes.length > 0 && selectedSizeId === '')}
              >
                Upload
              </Button>
            </div>
          </div>
        )}

        {/* Images grid */}
        <div className="p-3">
          {colorImages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[var(--border)] rounded-[var(--radius)] cursor-pointer hover:border-[var(--accent)] transition-colors"
              onClick={() => setShowUpload(true)}
            >
              <FiImage size={36} className="text-[var(--text-muted)] opacity-30 mb-2" />
              <p className="text-xs text-[var(--text-muted)]">Click to upload images</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {colorImages.map((img) => (
                <div
                  key={img.imageId}
                  className={`relative w-24 h-24 rounded-[var(--radius)] overflow-hidden border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    img.isPrimary
                      ? 'border-[var(--accent)] shadow-md'
                      : 'border-[var(--border)]'
                  }`}
                >
                  <img
                    src={img.fileLink}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Actions */}
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => !img.isPrimary && handleSetPrimary(img.imageId)}
                      disabled={img.isPrimary || isSettingPrimary}
                      className="w-5 h-5 flex items-center justify-center rounded bg-white/90 hover:bg-amber-50 transition-colors"
                      title={img.isPrimary ? 'Primary' : 'Set as primary'}
                    >
                      {img.isPrimary
                        ? <FiStar size={11} fill="#f59e0b" color="#f59e0b" />
                        : <RiStarOffLine size={11} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteImageId(img.imageId)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-white/90 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                  {img.isPrimary && (
                    <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-[var(--accent)] text-white text-[9px] font-bold rounded">
                      PRIMARY
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteImageId)}
        onClose={() => setDeleteImageId(null)}
        onConfirm={handleDelete}
        loading={isDeletingImage}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
      />
    </>
  )
}