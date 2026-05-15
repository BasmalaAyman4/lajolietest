// ─── BarcodeTypeFormModal ─────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { BarcodeType } from '../types'
import { useCreateBarcodeTypeMutation, useUpdateBarcodeTypeMutation } from '../services/barcodeTypeApi'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
})

type FormValues = z.infer<typeof schema>

interface BarcodeTypeFormModalProps {
  open: boolean
  onClose: () => void
  barcodeType?: BarcodeType
}

export default function BarcodeTypeFormModal({ open, onClose, barcodeType }: BarcodeTypeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(barcodeType)
  const [createBarcodeType, { isLoading: isCreating }] = useCreateBarcodeTypeMutation()
  const [updateBarcodeType, { isLoading: isUpdating }] = useUpdateBarcodeTypeMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '' },
  })

  useEffect(() => {
    if (open) reset(barcodeType ? { nameAr: barcodeType.nameAr, nameEn: barcodeType.nameEn } : { nameAr: '', nameEn: '' })
  }, [open, barcodeType, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && barcodeType) {
        await updateBarcodeType({ id: barcodeType.id, ...values }).unwrap()
      } else {
        await createBarcodeType(values).unwrap()
      }
      toast.success(t('common.success'))
      onClose()
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Barcode Type' : 'Add Barcode Type'} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>{isEdit ? t('common.save') : t('common.add', 'Add')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input {...register('nameEn')} label="Name (EN)" placeholder="e.g. QR Code" error={errors.nameEn?.message} required />
        <Input {...register('nameAr')} label="Name (AR)" placeholder="مثال: كيو آر" error={errors.nameAr?.message} dir="rtl" required />
      </div>
    </Modal>
  )
}