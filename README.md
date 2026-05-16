ok i want do page reel https://lajolietest.geniussystemtest.com/api/admin/Reals
[
  {
    "id": 1,
    "title": "Admin Salon Reel",
    "description": "Marketing for Salon",
    "createdDate": "04-05-2026",
    "uploadedBy": "Admin",
    "isApproved": true,
    "isStoped": false
  },
  {
    "id": 2,
    "title": "Admin Product Reel",
    "description": "Marketing for Product",
    "createdDate": "04-05-2026",
    "uploadedBy": "Admin",
    "isApproved": true,
    "isStoped": false
  },
] ,https://lajolietest.geniussystemtest.com/api/admin/Reals/6
{
  "id": 6,
  "title": "Test Reel",
  "description": "Reel to test upload",
  "createdDate": "2026-05-09T21:10:41.58",
  "uploadedBy": "Salon",
  "productId": null,
  "productName": "",
  "salonId": 17,
  "salonName": "La Jolie Salon",
  "salonServiceId": null,
  "salonServiceName": "",
  "salonPackageId": null,
  "salonPackageName": "",
  "makeupArtist": null,
  "makeupArtistName": "",
  "imageThumbnailUrl": "https://lajolietest.geniussystemtest.com/LajolieData/Reals\\Thumbnail/Test Reel_4903381d-e4e1-462d-84ba-03e23dcf1b14.webp",
  "videoUrl": "https://lajolietest.geniussystemtest.com/LajolieData/Reals/Video/TestReel_d39a9b65-9c7c-4b33-bda4-60df86c7d1b2.m3u8",
  "isApproved": true,
  "isStoped": false,
  "reelsCategoryId": 1,
  "reelsCategoryName": "Salon",
  "reelsPurposeId": 1,
  "reelsPurposeName": "Just a Reel",
} , this is post {
  "title": "string",
  "description": "string",
  "productId": 0,
  "salonId": 0,
  "salonServiceId": 0,
  "salonPackageId": 0,
  "makeupArtist": 0,
  "reelsCategoryId": 0,
  "reelsPurposeId": 0,
} , first user choose reel category from https://lajolietest.geniussystemtest.com/api/admin/BasicData/getReelsCategoryDropdown
[
  {
    "id": 1,
    "name": "Salon"
  },
  {
    "id": 2,
    "name": "Product"
  },
  {
    "id": 3,
    "name": "MakeUp"
  },
  {
    "id": 4,
    "name": "Tutorial"
  }
] , , then choose reel purpose from https://lajolietest.geniussystemtest.com/api/admin/BasicData/getReelsPurposeDropdown
[
  {
    "id": 1,
    "name": "Just a Reel"
  },
  {
    "id": 2,
    "name": "Salon Marketing"
  },
  {
    "id": 3,
    "name": "Product Marketing"
  },
  {
    "id": 4,
    "name": "Service Marketing"
  },
  {
    "id": 5,
    "name": "Package Marketing"
  }
] , if choose product don't send   "salonId": 0,
  "salonServiceId": 0,
  "salonPackageId": 0,
  "makeupArtist": 0, 
  if choose salon , and just reel don't send   "productId": 0,
  "salonServiceId": 0,
  "salonPackageId": 0,
  "makeupArtist": 0,  
  , and salon , service markiting don't send   "productId": 0,
  "salonPackageId": 0,
  "makeupArtist": 0,  and salon , package markiting don't send   "productId": 0,
  "salonServiceId": 0,
  "makeupArtist": 0,   

  https://lajolietest.geniussystemtest.com/api/admin/Reals/saveRealVideo?RealId=0
 , RealVideo 

 i will give you example to know the strucutre i work i used feature-based compionent // ─── BrandPage ────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Brand } from '../types'
import { useGetBrandsQuery, useDeleteBrandMutation } from '../services/brandApi'
import BrandFormModal from '../components/BrandFormModal'
import BrandImageModal from '../components/BrandImageModal'

export default function BrandPage() {
  const { t } = useTranslation()

  const { data: brands = [], isLoading, isError } = useGetBrandsQuery()
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; brand?: Brand }>({ open: false })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    brandId: number
    brandName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  const handleCreated = (id: number) => {
    const name = brands.find((b) => b.id === id)?.nameEn ?? 'New Brand'
    setImageModal({ open: true, brandId: id, brandName: name })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteBrand(deleteModal.id).unwrap()
      toast.success('Brand deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<Brand>[] = [
    {
      key: 'imageUrl',
      label: 'Image',
      width: '56px',
      align: 'center',
      render: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.nameEn}
            className="w-9 h-9 rounded-full object-cover border border-[var(--border)] mx-auto"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mx-auto">
            <HiPhotograph size={16} className="text-[var(--text-muted)]" />
          </div>
        ),
    },
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="text-sm text-[var(--text-muted)] truncate max-w-xs block">
          {row.description || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Upload Image"
            onClick={() => setImageModal({ open: true, brandId: row.id, brandName: row.nameEn })}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPhotograph size={15} />
          </button>
          <button
            type="button"
            title="Edit"
            onClick={() => setFormModal({ open: true, brand: row })}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPencil size={15} />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={() => setDeleteModal({ open: true, id: row.id })}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
          >
            <HiTrash size={15} />
          </button>
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load brands.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Brands</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your brands</p>
        </div>
        <Button
          onClick={() => setFormModal({ open: true })}
          leftIcon={<HiPlus size={15} />}
        >
          Add Brand
        </Button>
      </div>

      <DataTable<Brand>
        columns={columns}
        data={brands}
        tableKey="brand"
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'description']}
        searchPlaceholder="Search by name or description…"
        emptyMessage="No brands found. Add your first one!"
      />

      <BrandFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        brand={formModal.brand}
        onCreated={handleCreated}
      />

      {imageModal && (
        <BrandImageModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          brandId={imageModal.brandId}
          brandName={imageModal.brandName}
        />
      )}

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
      />
    </div>
  )
}
, // ─── BrandFormModal ───────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { Brand } from '../types'
import { useCreateBrandMutation, useUpdateBrandMutation } from '../services/brandApi'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().default(''),
})

type FormValues = z.infer<typeof schema>

interface BrandFormModalProps {
  open: boolean
  onClose: () => void
  brand?: Brand
  onCreated?: (id: number) => void
}

export default function BrandFormModal({
  open,
  onClose,
  brand,
  onCreated,
}: BrandFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(brand)

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation()
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        brand
          ? { nameAr: brand.nameAr, nameEn: brand.nameEn, description: brand.description }
          : { nameAr: '', nameEn: '', description: '' },
      )
    }
  }, [open, brand, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && brand) {
        await updateBrand({ id: brand.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createBrand(values).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Brand' : 'Add Brand'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {isEdit ? t('common.save') : t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('nameEn')}
            label="Name (EN)"
            placeholder="e.g. L'Oréal"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label="Name (AR)"
            placeholder="مثال: لوريال"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

        <Input
          {...register('description')}
          label="Description"
          placeholder="Optional description…"
          error={errors.description?.message}
        />

      </div>
    </Modal>
  )
}
, // ─── BrandImageModal ──────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiUpload, HiX, HiPhotograph } from 'react-icons/hi'
import { cn } from '@/lib/cn'
import { Modal, Button } from '@/components/shared'
import { useUploadBrandImageMutation } from '../services/brandApi'

const MAX_SIZE = 5 * 1024 * 1024

interface BrandImageModalProps {
  open: boolean
  onClose: () => void
  brandId: number
  brandName: string
}

export default function BrandImageModal({
  open,
  onClose,
  brandId,
  brandName,
}: BrandImageModalProps) {
  const { t } = useTranslation()
  const [uploadImage, { isLoading }] = useUploadBrandImageMutation()
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)
  const [dropError, setDropError] = useState('')

  const onDrop = useCallback(
    (accepted: File[], rejected: { errors: { message: string }[] }[]) => {
      setDropError('')
      if (rejected.length > 0) { setDropError(rejected[0].errors[0].message); return }
      if (accepted[0]) {
        if (preview) URL.revokeObjectURL(preview.url)
        setPreview({ file: accepted[0], url: URL.createObjectURL(accepted[0]) })
      }
    },
    [preview],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: MAX_SIZE,
  })

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview.url)
    setPreview(null)
    setDropError('')
    onClose()
  }

  const handleUpload = async () => {
    if (!preview) return
    try {
      await uploadImage({ brandId, file: preview.file }).unwrap()
      toast.success('Image uploaded successfully')
      handleClose()
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload Brand Image"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleUpload}
            loading={isLoading}
            disabled={!preview}
            leftIcon={<HiUpload size={14} />}
          >
            {t('common.upload', 'Upload')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          Uploading image for{' '}
          <span className="font-medium text-[var(--text-primary)]">{brandName}</span>
        </p>

        {preview ? (
          <div className="relative w-full aspect-square rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)]">
            <img src={preview.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null) }}
              className="absolute top-2 end-2 w-7 h-7 rounded-full bg-[var(--danger)]
                flex items-center justify-center hover:scale-110 transition-transform"
            >
              <HiX size={13} className="text-white" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-8 cursor-pointer',
              'rounded-[var(--radius-lg)] border-2 border-dashed transition-all duration-150 text-center',
              isDragActive
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-hover)]',
              dropError && 'border-[var(--danger)]',
            )}
          >
            <input {...getInputProps()} />
            <HiPhotograph size={28} className="text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              {isDragActive ? 'Drop here…' : 'Drag & drop or click to select'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Single image · Max {Math.round(MAX_SIZE / 1024 / 1024)}MB
            </p>
            {dropError && <p className="text-xs text-[var(--danger)] mt-1">{dropError}</p>}
          </div>
        )}
      </div>
    </Modal>
  )
}
,// ─── Brand API ────────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '../types'

export const brandApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all brands ──────────────────────────────────────────────────────
    getBrands: builder.query<Brand[], void>({
      query: () => '/api/admin/Brand',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Brand' as const, id })),
              { type: 'Brand', id: 'LIST' },
            ]
          : [{ type: 'Brand', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createBrand: builder.mutation<number, CreateBrandRequest>({
      query: (body) => ({ url: '/api/admin/Brand', method: 'POST', body }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateBrand: builder.mutation<void, UpdateBrandRequest>({
      query: (body) => ({ url: '/api/admin/Brand', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Brand', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Brand/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Brand', id }],
    }),

    // ── POST upload brand image ─────────────────────────────────────────────
    uploadBrandImage: builder.mutation<void, { brandId: number; file: File }>({
      query: ({ brandId, file }) => {
        const body = new FormData()
        body.append('BrandId', String(brandId))
        body.append('BrandPicture', file)
        return { url: '/api/admin/Brand/addBrandImages', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { brandId }) => [{ type: 'Brand', id: brandId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useUploadBrandImageMutation,
} = brandApi
, // ─── Brand Types ──────────────────────────────────────────────────────────────

export interface Brand {
  id: number
  imageUrl?: string
  nameAr: string
  nameEn: string
  description: string
}

export interface CreateBrandRequest {
  nameAr: string
  nameEn: string
  description: string
}

export interface UpdateBrandRequest extends CreateBrandRequest {
  id: number
}
, this shared component import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/cn'
import { HiUpload, HiX, HiPhotograph, HiFilm } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

export interface UploadedFile {
  file: File
  preview: string
}

interface UploadImageProps {
  label?: string
  error?: string
  mode?: 'image' | 'video'
  /** Allow multiple images */
  multiple?: boolean
  /** Max file size in bytes (default 5MB) */
  maxSize?: number
  value?: UploadedFile[]
  onChange?: (files: UploadedFile[]) => void
  disabled?: boolean
  required?: boolean
}

/**
 * UploadImage – drag-and-drop image uploader.
 *
 * Works with react-hook-form via Controller:
 *   <Controller name="images" control={control}
 *     render={({ field }) => <UploadImage {...field} multiple />}
 *   />
 */
export default function UploadImage({
  label,
  error,
  mode = 'image',
  multiple = false,
  maxSize = 5 * 1024 * 1024,
  value = [],
  onChange,
  disabled,
  required,
}: UploadImageProps) {
  const { t } = useTranslation()
  const [fileError, setFileError] = useState('')


  const isVideo = mode === 'video'
  const resolvedMaxSize = maxSize ?? (isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024)
  const accept = isVideo ? { 'video/*': [] } : { 'image/*': [] }


const onDrop = useCallback(
    (accepted: File[], rejected: { errors: { message: string }[] }[]) => {
      setFileError('')
      if (rejected.length > 0) {
        setFileError(rejected[0].errors[0].message)
        return
      }
      const newFiles: UploadedFile[] = accepted.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      onChange?.(multiple ? [...value, ...newFiles] : newFiles)
    },
    [multiple, value, onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: isVideo ? false : multiple, // video is always single
    maxSize: resolvedMaxSize,
    disabled,
  })

  const remove = (index: number) => {
    const next = [...value]
    URL.revokeObjectURL(next[index].preview)
    next.splice(index, 1)
    onChange?.(next)
  }
  
  const Icon = isVideo ? HiFilm : HiUpload

 return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {required && <span className="text-[var(--danger)] ms-1">*</span>}
        </label>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2',
          'rounded-[var(--radius-lg)] border-2 border-dashed p-6 cursor-pointer',
          'transition-all duration-150 text-center',
          isDragActive
            ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
            : 'border-[var(--border)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-hover)]',
          disabled && 'opacity-50 cursor-not-allowed',
          (error || fileError) && 'border-[var(--danger)]',
        )}
      >
        <input {...getInputProps()} />
        <Icon className="text-[var(--text-muted)]" size={24} />
        <p className="text-sm text-[var(--text-secondary)]">
          {isDragActive
            ? t('upload.dropHere', 'Drop here…')
            : t('upload.dragOrClick', 'Drag & drop or click to upload')}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {isVideo
            ? t('upload.singleVideo', 'Single video')
            : multiple
              ? t('upload.multipleImages', 'Multiple images')
              : t('upload.singleImage', 'Single image')}{' '}
          · Max {Math.round(resolvedMaxSize / 1024 / 1024)} MB
        </p>
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {value.map((f, i) => (
            <div
              key={i}
              className={cn(
                'relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] group',
                isVideo ? 'w-full aspect-video' : 'w-20 h-20',
              )}
            >
              {isVideo ? (
                <video
                  src={f.preview}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              ) : (
                <>
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                    transition-opacity flex items-center justify-center">
                    <HiPhotograph className="text-white/70" size={18} />
                  </div>
                </>
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => remove(i)}
                className={cn(
                  'absolute w-6 h-6 rounded-full bg-[var(--danger)]',
                  'flex items-center justify-center hover:scale-110 transition-all',
                  isVideo
                    ? 'top-2 end-2 opacity-100'
                    : 'top-1 end-1 opacity-0 group-hover:opacity-100',
                )}
              >
                <HiX size={11} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(error || fileError) && (
        <p className="text-xs text-[var(--danger)]">{error || fileError}</p>
      )}
    </div>
  )
}
, import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  type SelectHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import type { DropdownOption } from '@/types'
import { HiChevronDown, HiX } from 'react-icons/hi'

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  hint?: string
  options: DropdownOption[]
  placeholder?: string
  onChange?: (e: { target: { name?: string; value: string } }) => void
}

const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      className,
      value,
      onChange,
      onBlur,
      name,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
    const triggerRef = useRef<HTMLDivElement>(null)

    // Position the portal dropdown under the trigger
    const updatePosition = useCallback(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownHeight = 260 // approx max-height

      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // Flip up
        setDropdownStyle({
          position: 'fixed',
          top: rect.top - dropdownHeight - 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        })
      } else {
        // Drop down (default)
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        })
      }
    }, [])

    useEffect(() => {
      if (!open) return
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }, [open, updatePosition])

    // Close on outside click
    useEffect(() => {
      if (!open) return
      const handler = (e: MouseEvent) => {
        const target = e.target as Node
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          !(document.getElementById('select-portal'))?.contains(target)
        ) {
          setOpen(false)
          setSearch('')
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const filtered = options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    )

    const selectedLabel =
      options.find((o) => String(o.value) === String(value))?.label ?? null

    const handleSelect = useCallback(
      (optValue: string | number) => {
        onChange?.({ target: { name, value: String(optValue) } })
        onBlur?.({ target: { name } } as React.FocusEvent<HTMLSelectElement>)
        setOpen(false)
        setSearch('')
      },
      [onChange, onBlur, name],
    )

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.({ target: { name, value: '' } })
    }

    const hasValue =
      value !== '' &&
      value !== undefined &&
      value !== null &&
      String(value) !== '0'

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
            {props.required && (
              <span className="text-[var(--danger)] ms-1">*</span>
            )}
          </label>
        )}

        <input ref={ref} type="hidden" name={name} value={String(value ?? '')} readOnly />

        {/* Trigger */}
        <div
          ref={triggerRef}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={cn(
            'relative flex items-center gap-2 min-h-[42px]',
            'rounded-[var(--radius)] border bg-[var(--bg-card)] px-3 py-2 cursor-pointer',
            'text-sm transition-all duration-150 select-none',
            'border-[var(--border)]',
            open && 'border-[var(--border-focus)] ring-2 ring-[var(--accent-soft)]',
            error && 'border-[var(--danger)]',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
        >
          <span
            className={cn(
              'flex-1 truncate',
              hasValue ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]',
            )}
          >
            {hasValue ? selectedLabel : (placeholder ?? 'Select…')}
          </span>

          {hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors shrink-0"
            >
              <HiX size={13} />
            </button>
          )}

          <HiChevronDown
            size={15}
            className={cn(
              'text-[var(--text-muted)] transition-transform duration-150 shrink-0',
              open && 'rotate-180',
            )}
          />
        </div>

        {/* Portal dropdown */}
        {open &&
          createPortal(
            <div
              id="select-portal"
              style={dropdownStyle}
              className="rounded-[var(--radius)] border border-[var(--border)]
                bg-[var(--bg-card)] shadow-[var(--shadow)] overflow-hidden animate-fade-in"
            >
              <div className="p-2 border-b border-[var(--border)]">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full bg-[var(--bg-hover)] rounded-md px-2.5 py-1.5 text-sm
                    text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                />
              </div>

              <ul className="max-h-48 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-[var(--text-muted)]">No results</li>
                ) : (
                  filtered.map((opt) => {
                    const isSelected = String(opt.value) === String(value)
                    return (
                      <li
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'px-3 py-2 text-sm cursor-pointer transition-colors',
                          'hover:bg-[var(--bg-hover)]',
                          isSelected
                            ? 'text-[var(--accent)] font-medium bg-[var(--accent-soft)]'
                            : 'text-[var(--text-primary)]',
                        )}
                      >
                        {opt.label}
                      </li>
                    )
                  })
                )}
              </ul>
            </div>,
            document.body,
          )}

        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
export default Select