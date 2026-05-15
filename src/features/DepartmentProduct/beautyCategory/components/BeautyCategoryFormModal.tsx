// ─── BeautyCategoryFormModal ──────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle } from '@/components/shared'
import type { BeautyCategory } from '../types'
import {
  useCreateBeautyCategoryMutation,
  useUpdateBeautyCategoryMutation,
} from '../services/beautyCategoryApi'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  codeKey: z
    .string()
    .min(1, 'Code key is required')
    .regex(/^[A-Z_]+$/, 'Only capital letters and underscores allowed (e.g. SKIN_CARE)'),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

type FormValues = z.infer<typeof schema>

interface BeautyCategoryFormModalProps {
  open: boolean
  onClose: () => void
  beautyCategory?: BeautyCategory
  onCreated?: (id: number) => void
}

export default function BeautyCategoryFormModal({
  open,
  onClose,
  beautyCategory,
  onCreated,
}: BeautyCategoryFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(beautyCategory)

  const [createBeautyCategory, { isLoading: isCreating }] = useCreateBeautyCategoryMutation()
  const [updateBeautyCategory, { isLoading: isUpdating }] = useUpdateBeautyCategoryMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', codeKey: '', isActive: true, sortOrder: 0 },
  })

  useEffect(() => {
    if (open) {
      reset(
        beautyCategory
          ? {
              nameAr: beautyCategory.nameAr,
              nameEn: beautyCategory.nameEn,
              codeKey: beautyCategory.codeKey,
              isActive: beautyCategory.isActive,
              sortOrder: beautyCategory.sortOrder,
            }
          : { nameAr: '', nameEn: '', codeKey: '', isActive: true, sortOrder: 0 },
      )
    }
  }, [open, beautyCategory, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, isActive: values.isActive ? 1 : 0 }
    try {
      if (isEdit && beautyCategory) {
        await updateBeautyCategory({ id: beautyCategory.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createBeautyCategory(payload).unwrap()
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
      title={isEdit ? 'Edit Beauty Category' : 'Add Beauty Category'}
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
            placeholder="e.g. Skin Care"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label="Name (AR)"
            placeholder="مثال: العناية بالبشرة"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

        <Input
          {...register('codeKey', {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '')
            },
          })}
          label="Code Key"
          placeholder="e.g. SKIN_CARE"
          hint="Capital letters and underscores only"
          error={errors.codeKey?.message}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('sortOrder')}
            label="Sort Order"
            type="number"
            min={0}
            placeholder="0"
            error={errors.sortOrder?.message}
          />
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
