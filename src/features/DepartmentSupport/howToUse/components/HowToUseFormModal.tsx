// ─── HowToUseFormModal ────────────────────────────────────────────────────────

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle, Select } from '@/components/shared'
import UploadImage, { type UploadedFile } from '@/components/shared/UploadImage'
import {
  useCreateHowToUseMutation,
  useGetMediaTypeDropdownQuery,
  useGetPurposeDropdownQuery,
} from '../services/howToUseApi'
import { MEDIA_TYPE } from '../types'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  titleEn:             z.string().min(1, 'English title is required'),
  titleAr:             z.string().min(1, 'Arabic title is required'),
  descriptionEn:       z.string().default(''),
  descriptionAr:       z.string().default(''),
  howToUsePurposeId:   z.coerce.number().min(1, 'Purpose is required'),
  howToUseMediaTypeId: z.coerce.number().min(1, 'Media type is required'),
  sortOrder:           z.coerce.number().min(0).default(0),
  isActive:            z.boolean().default(true),
  // Files managed via Controller → UploadImage
  image:               z.array(z.any()).default([]),
  video:               z.array(z.any()).default([]),
})

type FormValues = z.infer<typeof schema>

interface HowToUseFormModalProps {
  open: boolean
  onClose: () => void
}

export default function HowToUseFormModal({ open, onClose }: HowToUseFormModalProps) {
  const { t } = useTranslation()
  const [createHowToUse, { isLoading }] = useCreateHowToUseMutation()
  const { data: mediaTypes = [] } = useGetMediaTypeDropdownQuery()
  const { data: purposes = [] } = useGetPurposeDropdownQuery()

  const toOpts = (items: { id: number; name: string }[]) =>
    items.map((i) => ({ value: i.id, label: i.name }))

  const {
    register, handleSubmit, reset, control, watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '',
      howToUsePurposeId: 0, howToUseMediaTypeId: 0, sortOrder: 0, isActive: true,
      image: [], video: [],
    },
  })

  const mediaTypeId = Number(watch('howToUseMediaTypeId'))
  const isVideo = mediaTypeId === MEDIA_TYPE.VIDEO
  const isImage = mediaTypeId === MEDIA_TYPE.IMAGE

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    if (isImage && values.image.length === 0) {
      return // zod refinement could also handle this
    }
    if (isVideo && values.video.length === 0) {
      return
    }

    try {
      await createHowToUse({
        titleEn:             values.titleEn,
        titleAr:             values.titleAr,
        descriptionEn:       values.descriptionEn,
        descriptionAr:       values.descriptionAr,
        howToUsePurposeId:   values.howToUsePurposeId,
        howToUseMediaTypeId: values.howToUseMediaTypeId,
        sortOrder:           values.sortOrder,
        isActive:            values.isActive,
        image: values.image[0]?.file ?? null,
        video: values.video[0]?.file ?? null,
      }).unwrap()
      toast.success(t('common.success'))
      handleClose()
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }
  }

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[var(--border)] pb-1 mb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</span>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add How To Use"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>{t('common.add', 'Add')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        <SectionHeading title="Content" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('titleEn')} label="Title (EN)" placeholder="e.g. How to book a service" error={errors.titleEn?.message} required />
          <Input {...register('titleAr')} label="Title (AR)" placeholder="مثال: كيفية حجز خدمة" error={errors.titleAr?.message} dir="rtl" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('descriptionEn')} label="Description (EN)" placeholder="Optional…" error={errors.descriptionEn?.message} />
          <Input {...register('descriptionAr')} label="Description (AR)" placeholder="اختياري…" error={errors.descriptionAr?.message} dir="rtl" />
        </div>

        <SectionHeading title="Settings" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="howToUsePurposeId"
            render={({ field }) => (
              <Select {...field} label="Purpose" options={toOpts(purposes)} placeholder="Select purpose…" error={errors.howToUsePurposeId?.message} required />
            )}
          />
          <Controller
            control={control}
            name="howToUseMediaTypeId"
            render={({ field }) => (
              <Select {...field} label="Media Type" options={toOpts(mediaTypes)} placeholder="Select media type…" error={errors.howToUseMediaTypeId?.message} required />
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('sortOrder')} label="Sort Order" type="number" min={0} placeholder="0" error={errors.sortOrder?.message} />
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

        {/* ── Media upload — shown only after media type is selected ──────── */}
        {isImage && (
          <>
            <SectionHeading title="Image" />
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <UploadImage
                  label="Image"
                  mode="image"
                  value={field.value as UploadedFile[]}
                  onChange={field.onChange}
                  error={errors.image?.message as string | undefined}
                  required
                />
              )}
            />
          </>
        )}

        {isVideo && (
          <>
            <SectionHeading title="Video & Thumbnail" />
            <Controller
              control={control}
              name="video"
              render={({ field }) => (
                <UploadImage
                  label="Video"
                  mode="video"
                  value={field.value as UploadedFile[]}
                  onChange={field.onChange}
                  error={errors.video?.message as string | undefined}
                  required
                />
              )}
            />
           {/*  <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <UploadImage
                  label="Thumbnail Image (optional)"
                  mode="image"
                  value={field.value as UploadedFile[]}
                  onChange={field.onChange}
                />
              )}
            /> */}
          </>
        )}

      </div>
    </Modal>
  )
}