// ─── ProductTypeFormModal ─────────────────────────────────────────────────────
//
//  Handles Create and Edit in one modal.
//  Pass `productType` to enter edit mode; omit for create mode.
//  codeKey only accepts CAPITAL LETTERS and underscores (e.g. HAIR_CARE).

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle } from '@/components/shared'
import type { ProductType } from '../types'
import {
  useCreateProductTypeMutation,
  useUpdateProductTypeMutation,
} from '../services/productTypeApi'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  codeKey: z
    .string()
    .min(1, 'Code key is required')
    .regex(/^[A-Z_]+$/, 'Only capital letters and underscores allowed (e.g. HAIR_CARE)'),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0, 'Sort order must be 0 or more').default(0),
})

type FormValues = z.infer<typeof schema>

interface ProductTypeFormModalProps {
  open: boolean
  onClose: () => void
  productType?: ProductType
  onCreated?: (id: number) => void
}

export default function ProductTypeFormModal({
  open,
  onClose,
  productType,
  onCreated,
}: ProductTypeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(productType)

  const [createProductType, { isLoading: isCreating }] = useCreateProductTypeMutation()
  const [updateProductType, { isLoading: isUpdating }] = useUpdateProductTypeMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', codeKey: '', isActive: true, sortOrder: 0 },
  })

  useEffect(() => {
    if (open) {
      reset(
        productType
          ? {
              nameAr: productType.nameAr,
              nameEn: productType.nameEn,
              codeKey: productType.codeKey,
              isActive: productType.isActive,
              sortOrder: productType.sortOrder,
            }
          : { nameAr: '', nameEn: '', codeKey: '', isActive: true, sortOrder: 0 },
      )
    }
  }, [open, productType, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, isActive: values.isActive ? 1 : 0 }
    try {
      if (isEdit && productType) {
        await updateProductType({ id: productType.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createProductType(payload).unwrap()
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
      title={isEdit ? 'Edit Product Type' : 'Add Product Type'}
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

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('nameEn')}
            label="Name (EN)"
            placeholder="e.g. Hair Care"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label="Name (AR)"
            placeholder="مثال: العناية بالشعر"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

        {/* Code Key — auto-uppercased, only A-Z and _ */}
        <Input
          {...register('codeKey', {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '')
            },
          })}
          label="Code Key"
          placeholder="e.g. HAIR_CARE"
          hint="Capital letters and underscores only"
          error={errors.codeKey?.message}
          required
        />

        {/* Sort order + Active */}
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
