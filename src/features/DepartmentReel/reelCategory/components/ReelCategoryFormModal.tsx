// ─── SizeFormModal ────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast, Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle } from '@/components/shared'
import type { ReelCategory } from '../types'
import { useCreateReelCategoryMutation, useUpdateReelCategoryMutation } from '../services/reelCategoryApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface SizeFormModalProps {
  open: boolean
  onClose: () => void
  reelCategory?: ReelCategory
}

export default function ReelCategoryFormModal({ open, onClose, reelCategory }: SizeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(reelCategory)

  const [createReelCategory, { isLoading: isCreating }] = useCreateReelCategoryMutation()
  const [updateReelCategory, { isLoading: isUpdating }] = useUpdateReelCategoryMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset,control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', isActive: true },
  })

  useEffect(() => {
    if (open) {
      reset(
        reelCategory
          ? { nameAr: reelCategory.nameAr, nameEn: reelCategory.nameEn, isActive: reelCategory.isActive }
          : { nameAr: '', nameEn: '', isActive: true },
      )
    }
  }, [open, reelCategory, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && reelCategory) {
        await updateReelCategory({ id: reelCategory.id, ...values }).unwrap()
      } else {
        await createReelCategory(values).unwrap()
      }
      toast.success(t('common.success'))
      onClose()
    } catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Reel Category' : 'Add Reel Category'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {isEdit ? t('common.save') : t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('nameEn')} label="Name (EN)" placeholder="e.g. Small" error={errors.nameEn?.message} required />
          <Input {...register('nameAr')} label="Name (AR)" placeholder="مثال: صغير" error={errors.nameAr?.message} dir="rtl" required />
        </div>
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
    </Modal>
  )
}