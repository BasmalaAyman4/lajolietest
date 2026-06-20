// ─── ProductTypeDetailFormModal ─────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle, Select } from '@/components/shared'
import type { ProductTypeDetail } from '../types'
import {
  useCreateProductTypeDetailMutation,
  useUpdateProductTypeDetailMutation,
  useGetProductTypeDropdownQuery,
} from '../services/productTypeDetailApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  codeKey: z
    .string()
    .min(1, 'Code key is required')
    .regex(/^[A-Z_]+$/, 'Only capital letters and underscores allowed (e.g. ACNE_CONTROL)'),
  productTypeId: z.coerce.number().min(1, 'Product type is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

type FormValues = z.infer<typeof schema>

interface ProductTypeDetailFormModalProps {
  open: boolean
  onClose: () => void
  productTypeDetail?: ProductTypeDetail
  onCreated?: (id: number) => void
}

export default function ProductTypeDetailFormModal({ open, onClose, productTypeDetail, onCreated }: ProductTypeDetailFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(productTypeDetail)

  const [createProductTypeDetail, { isLoading: isCreating }] = useCreateProductTypeDetailMutation()
  const [updateProductTypeDetail, { isLoading: isUpdating }] = useUpdateProductTypeDetailMutation()
  const isLoading = isCreating || isUpdating

  const { data: productTypes = [] } = useGetProductTypeDropdownQuery()
  const productTypeOptions = productTypes.map((pt) => ({ value: pt.id, label: pt.name }))

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', codeKey: '', productTypeId: 0, isActive: true, sortOrder: 0 },
  })

  useEffect(() => {
    if (open) {
      reset(
        productTypeDetail
          ? {
              nameAr: productTypeDetail.nameAr,
              nameEn: productTypeDetail.nameEn,
              codeKey: productTypeDetail.codeKey,
              productTypeId: productTypeDetail.productTypeId,
              isActive: productTypeDetail.isActive,
              sortOrder: productTypeDetail.sortOrder,
            }
          : { nameAr: '', nameEn: '', codeKey: '', productTypeId: 0, isActive: true, sortOrder: 0 },
      )
    }
  }, [open, productTypeDetail, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, isActive: values.isActive ? 1 : 0 }
    try {
      if (isEdit && productTypeDetail) {
        const data = await updateProductTypeDetail({ id: productTypeDetail.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createProductTypeDetail(payload).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product Type Detail' : 'Add Product Type Detail'}
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

        <Controller
          control={control}
          name="productTypeId"
          render={({ field }) => (
            <Select
              {...field}
              label="Product Type"
              options={productTypeOptions}
              placeholder="Select product type"
              error={errors.productTypeId?.message}
              required
            />
          )}
        />

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