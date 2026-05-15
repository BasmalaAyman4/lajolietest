// ─── SizeFormModal ────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { SpecialistJob } from '../types'
import { useCreateSpecialistJobMutation, useUpdateSpecialistJobMutation } from '../services/specialistJobApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().default(''),
})

type FormValues = z.infer<typeof schema>

interface SpecialistJobFormModalProps {
  open: boolean
  onClose: () => void
  specialistJob?: SpecialistJob
}

export default function SpecialistJobFormModal({ open, onClose, specialistJob }: SpecialistJobFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(specialistJob)

  const [createSpecialistJob, { isLoading: isCreating }] = useCreateSpecialistJobMutation()
  const [updateSpecialistJob, { isLoading: isUpdating }] = useUpdateSpecialistJobMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        specialistJob
          ? { nameAr: specialistJob.nameAr, nameEn: specialistJob.nameEn, description: specialistJob.description }
          : { nameAr: '', nameEn: '', description: '' },
      )
    }
  }, [open, specialistJob, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && specialistJob) {
        await updateSpecialistJob({ id: specialistJob.id, ...values }).unwrap()
      } else {
        await createSpecialistJob(values).unwrap()
      }
      toast.success(t('common.success'))
      onClose()
    } catch (error) {
toast.error(getApiError(error, t('common.error')))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit SpecialistJob' : 'Add SpecialistJob'}
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