// ─── ServiceTypeFormModal ─────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle, Select } from '@/components/shared'
import type { ServiceType } from '../types'
import {
  useCreateServiceTypeMutation,
  useUpdateServiceTypeMutation,
  useGetServiceCategoryDropdownQuery,
  useGetChairTypeDropdownQuery,
} from '../services/serviceTypeApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  codeKey: z
    .string()
    .min(1, 'Code key is required')
    .regex(/^[A-Z_]+$/, 'Only capital letters and underscores allowed (e.g. ACNE_CONTROL)'),
  serviceCategoryId: z.coerce.number().min(1, 'Service category is required'),
  chairTypeId: z.coerce.number().min(1, 'Chair type is required'),

  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

type FormValues = z.infer<typeof schema>

interface ServiceTypeFormModalProps {
  open: boolean
  onClose: () => void
  serviceType?: ServiceType
  onCreated?: (id: number) => void
}

export default function ServiceTypeFormModal({ open, onClose, serviceType, onCreated }: ServiceTypeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(serviceType)

  const [createServiceType, { isLoading: isCreating }] = useCreateServiceTypeMutation()
  const [updateServiceType, { isLoading: isUpdating }] = useUpdateServiceTypeMutation()
  const isLoading = isCreating || isUpdating

  const { data: serviceCategories = [] } = useGetServiceCategoryDropdownQuery()
  const serviceCategoryOptions = serviceCategories.map((bc) => ({ value: bc.id, label: bc.name }))
  const { data: chairTypes = [] } = useGetChairTypeDropdownQuery()
  const chairTypeOptions = chairTypes.map((ct) => ({ value: ct.id, label: ct.name }))
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', codeKey: '', serviceCategoryId: 0, chairTypeId: 0, isActive: true, sortOrder: 0 },
  })

  useEffect(() => {
    if (open) {
      reset(
        serviceType
          ? {
            nameAr: serviceType.nameAr,
            nameEn: serviceType.nameEn,
            codeKey: serviceType.codeKey,
            serviceCategoryId: serviceType.serviceCategoryId,
            chairTypeId: serviceType.chairTypeId,
            isActive: serviceType.isActive,
            sortOrder: serviceType.sortOrder,
          }
          : { nameAr: '', nameEn: '', codeKey: '', serviceCategoryId: 0, chairTypeId: 0, isActive: true, sortOrder: 0 },
      )
    }
  }, [open, serviceType, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, isActive: values.isActive ? 1 : 0 }
    try {
      if (isEdit && serviceType) {
        await updateServiceType({ id: serviceType.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createServiceType(payload).unwrap()
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
      title={isEdit ? 'Edit Service Type' : 'Add Service Type'}
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
          <Input {...register('nameEn')} label="Name (EN)" placeholder="e.g. Acne Control" error={errors.nameEn?.message} required />
          <Input {...register('nameAr')} label="Name (AR)" placeholder="مثال: التحكم في حب الشباب" error={errors.nameAr?.message} dir="rtl" required />
        </div>

        <Input
          {...register('codeKey', {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '')
            },
          })}
          label="Code Key"
          placeholder="e.g. ACNE_CONTROL"
          hint="Capital letters and underscores only"
          error={errors.codeKey?.message}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Controller
          control={control}
          name="serviceCategoryId"
          render={({ field }) => (
            <Select
              {...field}
              label="Service Category"
              options={serviceCategoryOptions}
              placeholder="Select service category"
              error={errors.serviceCategoryId?.message}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="chairTypeId"
          render={({ field }) => (
            <Select
              {...field}
              label="Chair Type"
              options={chairTypeOptions}
              placeholder="Select chair type"
              error={errors.chairTypeId?.message}
              required
            />
          )}
        />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('sortOrder')} label="Sort Order" type="number" min={0} placeholder="0" error={errors.sortOrder?.message} />
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