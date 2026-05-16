// ─── DefaultImageFormModal ────────────────────────────────────────────────────

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Select, Button, Toggle } from '@/components/shared'
import type { DefaultImage } from '../types'
import {
  useCreateDefaultImageMutation,
  useUpdateDefaultImageMutation,
  useGetImagePhotoTypeDropdownQuery,
  useGetImageSectionDropdownQuery,
} from '../services/defaultImageApi'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  defaultImageSectionId: z.coerce.number().min(1, 'Image Section is required'),
  defaultImagePhotoTypeId: z.coerce.number().min(1, 'Image Photo Type is required'),
  altText: z.string().min(1, 'Alt Text is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0, 'Sort order must be 0 or more').default(0),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface DefaultImageFormModalProps {
  open: boolean
  onClose: () => void
  defaultImage?: DefaultImage
  onCreated?: (id: number) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DefaultImageFormModal({
  open,
  onClose,
  defaultImage,
  onCreated,
}: DefaultImageFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(defaultImage)

  const [createDefaultImage, { isLoading: isCreating }] = useCreateDefaultImageMutation()
  const [updateDefaultImage, { isLoading: isUpdating }] = useUpdateDefaultImageMutation()

  // ── Fix 1: renamed raw query results to avoid collision ───────────────────
  const { data: rawImageSectionOptions = [] } = useGetImageSectionDropdownQuery()
  const { data: rawImagePhotoTypeOptions = [] } = useGetImagePhotoTypeDropdownQuery()

  const isLoading = isCreating || isUpdating

  // ── Fix 1 cont: map with different variable names ─────────────────────────
  const imageSectionOptions = rawImageSectionOptions.map((bc) => ({ value: bc.id, label: bc.name }))
  const imagePhotoTypeOptions = rawImagePhotoTypeOptions.map((bc) => ({ value: bc.id, label: bc.name }))

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // ── Fix 2: default values match schema field names ─────────────────────
    defaultValues: {
      defaultImageSectionId: 0,
      defaultImagePhotoTypeId: 0,
      altText: '',
      sortOrder: 0,
      isActive: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        defaultImage
          ? {
              // ── Fix 2 cont: field names aligned with schema + DefaultImage type
              defaultImageSectionId: defaultImage.defaultImageSectionId,
              defaultImagePhotoTypeId: defaultImage.defaultImagePhotoTypeId,
              altText: defaultImage.altText ?? '',
              sortOrder: defaultImage.sortOrder ?? 0,
              isActive: defaultImage.isActive,
            }
          : {
              defaultImageSectionId: 0,
              defaultImagePhotoTypeId: 0,
              altText: '',
              sortOrder: 0,
              isActive: true,
            },
      )
    }
  }, [open, defaultImage, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && defaultImage) {
        await updateDefaultImage({ id: defaultImage.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createDefaultImage(values).unwrap()
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
      title={
        isEdit
          ? t('defaultImage.editDefaultImage', 'Edit Default Image')
          : t('defaultImage.addDefaultImage', 'Add Default Image')
      }
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
        {/* ── Fix 2 cont: Controller name aligned with schema ── */}
        <Controller
          name="defaultImageSectionId"
          control={control}
          render={({ field }) => (
            <Select
              label={t('defaultImage.imageSectionId', 'Image Section')}
              options={imageSectionOptions}
              placeholder={t('defaultImage.selectImageSection', 'Select an image section')}
              error={errors.defaultImageSectionId?.message}
              required
              name={field.name}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          name="defaultImagePhotoTypeId"
          control={control}
          render={({ field }) => (
            <Select
              label={t('defaultImage.imagePhotoTypeId', 'Image Photo Type')}
              options={imagePhotoTypeOptions}
              placeholder={t('defaultImage.selectImagePhotoType', 'Select an image photo type')}
              error={errors.defaultImagePhotoTypeId?.message}
              required
              name={field.name}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('altText')}
            label={t('defaultImage.altText', 'Alt Text')}
            placeholder="e.g. Hero banner image"
            error={errors.altText?.message}
            required
          />
          <Input
            {...register('sortOrder')}
            label="Sort Order"
            type="number"
            min={0}
            placeholder="0"
            error={errors.sortOrder?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center pt-6">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Toggle label="Active" checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}