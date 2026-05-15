// ─── ServiceCodeFormModal ───────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { ServiceCode } from '../types'
import { useCreateServiceCodeMutation, useUpdateServiceCodeMutation } from '../services/serviceCodeApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().default(''),
})

type FormValues = z.infer<typeof schema>

interface ServiceCodeFormModalProps {
  open: boolean
  onClose: () => void
  serviceCode?: ServiceCode
  onCreated?: (id: number) => void
}

export default function ServiceCodeFormModal({
  open,
  onClose,
  serviceCode,
  onCreated,
}: ServiceCodeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(serviceCode)

  const [createServiceCode, { isLoading: isCreating }] = useCreateServiceCodeMutation()
  const [updateServiceCode, { isLoading: isUpdating }] = useUpdateServiceCodeMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        serviceCode
          ? { nameAr: serviceCode.nameAr, nameEn: serviceCode.nameEn, description: serviceCode.description }
          : { nameAr: '', nameEn: '', description: '' },
      )
    }
  }, [open, serviceCode, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && serviceCode) {
        await updateServiceCode({ id: serviceCode.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createServiceCode(values).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    } catch (error) {
toast.error(getApiError(error, t('common.error')))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Service Code' : 'Add Service Code'}
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
            placeholder="e.g. L'Oréal"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label="Name (AR)"
            placeholder="مثال: لوريال"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

        <Input
          {...register('description')}
          label="Description"
          placeholder="Optional description…"
          error={errors.description?.message}
        />

      </div>
    </Modal>
  )
}
