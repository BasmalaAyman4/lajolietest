// ─── BeautyCategoryFormModal ──────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle } from '@/components/shared'
import type { ChairType } from '../types'
import {
  useCreateChairTypeMutation,
  useUpdateChairTypeMutation,
} from '../services/chairTypeApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

type FormValues = z.infer<typeof schema>

interface ChairTypeFormModalProps {
  open: boolean
  onClose: () => void
  chairType?: ChairType

}

export default function ChairTypeFormModal({
  open,
  onClose,
  chairType,
}: ChairTypeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(chairType)

  const [createChairType, { isLoading: isCreating }] = useCreateChairTypeMutation()
  const [updateChairType, { isLoading: isUpdating }] = useUpdateChairTypeMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '',  isActive: true, sortOrder: 0 },
  })

  useEffect(() => {
    if (open) {
      reset(
        chairType
          ? {
              nameAr: chairType.nameAr,
              nameEn: chairType.nameEn,
              isActive: chairType.isActive,
              sortOrder: chairType.sortOrder,
            }
          : { nameAr: '', nameEn: '', isActive: true, sortOrder: 0 },
      )
    }
  }, [open, chairType, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values}
    try {
      if (isEdit && chairType) {
        await updateChairType({ id: chairType.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createChairType(payload).unwrap()
        toast.success(t('common.success'))
        onClose()
      }
    }  catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Chair Type' : 'Add Chair Type'}
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
            placeholder="e.g. Haircut chair"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label="Name (AR)"
            placeholder="مثال: كرسي قص الشعر"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>


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
