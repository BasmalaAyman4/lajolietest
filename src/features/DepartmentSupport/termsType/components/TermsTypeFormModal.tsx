// ─── SizeFormModal ────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { TermsType } from '../types'
import { useCreateTermsTypeMutation, useUpdateTermsTypeMutation } from '../services/termsTypeApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
})

type FormValues = z.infer<typeof schema>

interface TermsTypeFormModalProps {
  open: boolean
  onClose: () => void
  termsType?: TermsType
}

export default function TermsTypeFormModal({ open, onClose, termsType }: TermsTypeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(termsType)

  const [createTermsType, { isLoading: isCreating }] = useCreateTermsTypeMutation()
  const [updateTermsType, { isLoading: isUpdating }] = useUpdateTermsTypeMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        termsType
          ? { nameAr: termsType.nameAr, nameEn: termsType.nameEn }
          : { nameAr: '', nameEn: '' },
      )
    }
  }, [open, termsType, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && termsType) {
        await updateTermsType({ id: termsType.id, ...values }).unwrap()
      } else {
        await createTermsType(values).unwrap()
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
      title={isEdit ? 'Edit Terms Type' : 'Add Terms Type'}
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
      </div>
    </Modal>
  )
}