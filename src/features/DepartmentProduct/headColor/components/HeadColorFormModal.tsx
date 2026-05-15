// ─── HeadColorFormModal ───────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { HeadColor } from '../types'
import { useCreateHeadColorMutation, useUpdateHeadColorMutation } from '../services/headColorApi'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
})

type FormValues = z.infer<typeof schema>

interface HeadColorFormModalProps {
  open: boolean
  onClose: () => void
  headColor?: HeadColor
}

export default function HeadColorFormModal({ open, onClose, headColor }: HeadColorFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(headColor)
  const [createHeadColor, { isLoading: isCreating }] = useCreateHeadColorMutation()
  const [updateHeadColor, { isLoading: isUpdating }] = useUpdateHeadColorMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '' },
  })

  useEffect(() => {
    if (open) reset(headColor ? { nameAr: headColor.nameAr, nameEn: headColor.nameEn } : { nameAr: '', nameEn: '' })
  }, [open, headColor, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && headColor) {
        await updateHeadColor({ id: headColor.id, ...values }).unwrap()
      } else {
        await createHeadColor(values).unwrap()
      }
      toast.success(t('common.success'))
      onClose()
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Head Color' : 'Add Head Color'} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>{isEdit ? t('common.save') : t('common.add', 'Add')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input {...register('nameEn')} label="Name (EN)" placeholder="e.g. Golden" error={errors.nameEn?.message} required />
        <Input {...register('nameAr')} label="Name (AR)" placeholder="مثال: ذهبي" error={errors.nameAr?.message} dir="rtl" required />
      </div>
    </Modal>
  )
}