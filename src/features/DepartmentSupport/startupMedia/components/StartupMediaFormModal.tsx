// ─── StartupMediaFormModal ────────────────────────────────────────────────────

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Button, Toggle, Select } from '@/components/shared'
import DatePicker from '@/components/shared/DatePicker'
import UploadImage, { type UploadedFile } from '@/components/shared/UploadImage'
import {
  useCreateStartupMediaMutation,
  useGetStartupMediaTypeDropdownQuery,
} from '../services/startupMediaApi'
import { MEDIA_TYPE } from '../types/index'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z
  .object({
    startupMediaTypeId: z.coerce.number().min(1, 'Media type is required'),
    fromDate:           z.string().min(1, 'From date is required'),
    toDate:             z.string().min(1, 'To date is required'),
    webFlag:            z.boolean().default(false),
    appFlag:            z.boolean().default(false),
    isActive:           z.boolean().default(true),
    image:              z.array(z.any()).default([]),
    video:              z.array(z.any()).default([]),
  })
  .refine((d) => !d.fromDate || !d.toDate || d.toDate >= d.fromDate, {
    message: 'To date must be on or after From date',
    path: ['toDate'],
  })

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface StartupMediaFormModalProps {
  open: boolean
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StartupMediaFormModal({ open, onClose }: StartupMediaFormModalProps) {
  const { t } = useTranslation()
  const [createStartupMedia, { isLoading }] = useCreateStartupMediaMutation()
  const { data: mediaTypes = [] } = useGetStartupMediaTypeDropdownQuery()

  const toOpts = (items: { id: number; name: string }[]) =>
    items.map((i) => ({ value: i.id, label: i.name }))

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startupMediaTypeId: 0,
      fromDate: '',
      toDate: '',
      webFlag: false,
      appFlag: false,
      isActive: true,
      image: [],
      video: [],
    },
  })

  const mediaTypeId = Number(watch('startupMediaTypeId'))
  const fromDate    = watch('fromDate')
  const isVideo     = mediaTypeId === MEDIA_TYPE.VIDEO
  const isImage     = mediaTypeId === MEDIA_TYPE.IMAGE

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    // Guard: require the correct file type
    if (isImage && values.image.length === 0) {
      toast.error('Please upload an image.')
      return
    }
    if (isVideo && values.video.length === 0) {
      toast.error('Please upload a video.')
      return
    }

    try {
      await createStartupMedia({
        startupMediaTypeId: values.startupMediaTypeId,
        fromDate:           values.fromDate,
        toDate:             values.toDate,
        webFlag:            values.webFlag,
        appFlag:            values.appFlag,
        isActive:           values.isActive,
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
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </span>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Startup Media"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        {/* ── Media type ───────────────────────────────────────────────── */}
        <SectionHeading title="Media Type" />
        <Controller
          control={control}
          name="startupMediaTypeId"
          render={({ field }) => (
            <Select
              {...field}
              label="Media Type"
              options={toOpts(mediaTypes)}
              placeholder="Select media type…"
              error={errors.startupMediaTypeId?.message}
              required
            />
          )}
        />

        {/* ── Schedule ─────────────────────────────────────────────────── */}
        <SectionHeading title="Schedule" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="fromDate"
            render={({ field }) => (
              <DatePicker
                label="From Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.fromDate?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="toDate"
            render={({ field }) => (
              <DatePicker
                label="To Date"
                value={field.value}
                onChange={field.onChange}
                // Prevent selecting a date before fromDate
                minDate={fromDate || undefined}
                error={errors.toDate?.message}
                required
              />
            )}
          />
        </div>

        {/* ── Flags & status ───────────────────────────────────────────── */}
        <SectionHeading title="Settings" />
        <div className="flex flex-wrap items-center gap-6">
          <Controller
            control={control}
            name="webFlag"
            render={({ field }) => (
              <Toggle label="Web" checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="appFlag"
            render={({ field }) => (
              <Toggle label="App" checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Toggle label="Active" checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* ── File upload — shown only after media type is selected ──── */}
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
            <SectionHeading title="Video" />
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
          </>
        )}

      </div>
    </Modal>
  )
}



