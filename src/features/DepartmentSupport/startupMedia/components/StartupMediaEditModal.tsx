
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPhotograph, HiFilm, HiSwitchHorizontal } from 'react-icons/hi'
import { Modal, Button, Toggle, Select } from '@/components/shared'
import DatePicker from '@/components/shared/DatePicker'
import UploadImage, { type UploadedFile } from '@/components/shared/UploadImage'
import {
  useUpdateStartupMediaMutation,
  useGetStartupMediaTypeDropdownQuery,
} from '../services/startupMediaApi'
import type { StartupMedia } from '../types'
import { MEDIA_TYPE } from '../types'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z
  .object({
    startupMediaTypeId: z.coerce.number().min(1, 'Media type is required'),
    fromDate:           z.string().min(1, 'From date is required'),
    toDate:             z.string().min(1, 'To date is required'),
    webFlag:            z.boolean(),
    appFlag:            z.boolean(),
    isActive:           z.boolean(),
    image:              z.array(z.any()).default([]),
    video:              z.array(z.any()).default([]),
  })
  .refine((d) => !d.fromDate || !d.toDate || d.toDate >= d.fromDate, {
    message: 'To date must be on or after From date',
    path: ['toDate'],
  })

type FormValues = z.infer<typeof schema>

// ── Helpers ───────────────────────────────────────────────────────────────────
/** "2026-06-04T00:00:00" → "2026-06-04" */
const isoToDate = (iso: string) => (iso ? iso.slice(0, 10) : '')

// ── Props ─────────────────────────────────────────────────────────────────────
interface StartupMediaEditModalProps {
  item: StartupMedia | null   // null = closed
  onClose: () => void
}


// ── Component ─────────────────────────────────────────────────────────────────
export default function StartupMediaEditModal({ item, onClose }: StartupMediaEditModalProps) {
    const { t } = useTranslation()
    const [updateStartupMedia, { isLoading }] = useUpdateStartupMediaMutation()
    const { data: mediaTypes = [] } = useGetStartupMediaTypeDropdownQuery()
  
    // Whether the user wants to replace the existing file
    const [replaceFile, setReplaceFile] = useState(false)
  
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
  
    // Pre-fill whenever the item changes
    useEffect(() => {
      if (!item) return
      setReplaceFile(false)
      reset({
        startupMediaTypeId: item.startupMediaTypeId,
        fromDate:           isoToDate(item.fromDate),
        toDate:             isoToDate(item.toDate),
        webFlag:            item.webFlag,
        appFlag:            item.appFlag,
        isActive:           item.isActive,
        image:              [],
        video:              [],
      })
    }, [item, reset])
  
    const mediaTypeId = Number(watch('startupMediaTypeId'))
    const fromDate    = watch('fromDate')
    const isVideo     = mediaTypeId === MEDIA_TYPE.VIDEO
    const isImage     = mediaTypeId === MEDIA_TYPE.IMAGE
  
    const handleClose = () => {
      reset()
      setReplaceFile(false)
      onClose()
    }
  
    const onSubmit = async (values: FormValues) => {
      if (!item) return
  
      // If replacing, require a new file
      if (replaceFile) {
        if (isImage && values.image.length === 0) {
          toast.error('Please upload a replacement image.')
          return
        }
        if (isVideo && values.video.length === 0) {
          toast.error('Please upload a replacement video.')
          return
        }
      }
  
      try {
        await updateStartupMedia({
          id:                 item.id,
          startupMediaTypeId: values.startupMediaTypeId,
          fromDate:           values.fromDate,
          toDate:             values.toDate,
          webFlag:            values.webFlag,
          appFlag:            values.appFlag,
          isActive:           values.isActive,
          // Only send the file if the user chose to replace
          image: replaceFile && isImage  ? (values.image[0]?.file ?? null) : undefined,
          video: replaceFile && isVideo  ? (values.video[0]?.file ?? null) : undefined,
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
  
    // Current file preview (shown when not replacing)
    const currentFileUrl = item?.filePath ?? null
    const currentThumb   = item?.thumbnailPath ?? null
  
    return (
      <Modal
        open={!!item}
        onClose={handleClose}
        title="Edit Startup Media"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
              {t('common.save', 'Save')}
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
  
          {/* ── Media file ───────────────────────────────────────────────── */}
          {(isImage || isVideo) && (
            <>
              <SectionHeading title={isVideo ? 'Video' : 'Image'} />
  
              {!replaceFile ? (
                /* Current file preview */
                <div className="flex flex-col gap-2">
                  <div className="relative rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-hover)]">
                    {isVideo ? (
                      <div className="aspect-video">
                        {currentThumb ? (
                          <img src={currentThumb} alt="current thumbnail" className="w-full h-full object-cover" />
                        ) : currentFileUrl ? (
                          <video src={currentFileUrl} className="w-full h-full object-cover" muted />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiFilm size={28} className="text-[var(--text-muted)]" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video">
                        {currentFileUrl ? (
                          <img src={currentFileUrl} alt="current media" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiPhotograph size={28} className="text-[var(--text-muted)]" />
                          </div>
                        )}
                      </div>
                    )}
  
                    {/* Current label */}
                    <span className="absolute top-2 start-2 text-xs font-medium px-2 py-0.5 rounded-full
                      bg-black/50 text-white backdrop-blur-sm">
                      Current
                    </span>
                  </div>
  
                  {/* Replace toggle */}
                  <button
                    type="button"
                    onClick={() => setReplaceFile(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]
                      hover:underline w-fit"
                  >
                    <HiSwitchHorizontal size={13} />
                    Replace {isVideo ? 'video' : 'image'}
                  </button>
                </div>
              ) : (
                /* New file uploader */
                <div className="flex flex-col gap-2">
                  {isImage ? (
                    <Controller
                      control={control}
                      name="image"
                      render={({ field }) => (
                        <UploadImage
                          label="New Image"
                          mode="image"
                          value={field.value as UploadedFile[]}
                          onChange={field.onChange}
                          error={errors.image?.message as string | undefined}
                          required
                        />
                      )}
                    />
                  ) : (
                    <Controller
                      control={control}
                      name="video"
                      render={({ field }) => (
                        <UploadImage
                          label="New Video"
                          mode="video"
                          value={field.value as UploadedFile[]}
                          onChange={field.onChange}
                          error={errors.video?.message as string | undefined}
                          required
                        />
                      )}
                    />
                  )}
  
                  {/* Cancel replace */}
                  <button
                    type="button"
                    onClick={() => setReplaceFile(false)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]
                      hover:underline w-fit"
                  >
                    Keep existing {isVideo ? 'video' : 'image'}
                  </button>
                </div>
              )}
            </>
          )}
  
        </div>
      </Modal>
    )
  }
  