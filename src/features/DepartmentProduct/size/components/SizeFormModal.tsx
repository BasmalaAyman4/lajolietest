// ─── SizeFormModal ────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { Size } from '../types'
import { useCreateSizeMutation, useUpdateSizeMutation } from '../services/sizeApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().default(''),
})

type FormValues = z.infer<typeof schema>

interface SizeFormModalProps {
  open: boolean
  onClose: () => void
  size?: Size
}

export default function SizeFormModal({ open, onClose, size }: SizeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(size)

  const [createSize, { isLoading: isCreating }] = useCreateSizeMutation()
  const [updateSize, { isLoading: isUpdating }] = useUpdateSizeMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        size
          ? { nameAr: size.nameAr, nameEn: size.nameEn, description: size.description }
          : { nameAr: '', nameEn: '', description: '' },
      )
    }
  }, [open, size, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && size) {
        await updateSize({ id: size.id, ...values }).unwrap()
      } else {
        await createSize(values).unwrap()
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
      title={isEdit ? 'Edit Size' : 'Add Size'}
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
        <Input {...register('description')} label="Description" placeholder="Optional description…" error={errors.description?.message} />
      </div>
    </Modal>
  )
}