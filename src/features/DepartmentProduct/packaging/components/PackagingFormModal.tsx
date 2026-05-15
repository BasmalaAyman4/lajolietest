// ─── PackagingFormModal ───────────────────────────────────────────────────────
//
//  Handles Create and Edit in one modal.
//  When isMultiple is true, fromQty and toQty are required.

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle } from '@/components/shared'
import type { Packaging } from '../types'
import {
  useCreatePackagingMutation,
  useUpdatePackagingMutation,
} from '../services/packagingApi'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z
  .object({
    nameAr: z.string().min(1, 'Arabic name is required'),
    nameEn: z.string().min(1, 'English name is required'),
    price: z.coerce.number().min(0, 'Price must be 0 or more'),
    isMultiple: z.boolean().default(false),
    fromQty: z.coerce.number().min(0).default(0),
    toQty: z.coerce.number().min(0).default(0),
  })
  .refine(
    (data) => !data.isMultiple || data.toQty >= data.fromQty,
    {
      message: 'To Qty must be greater than or equal to From Qty',
      path: ['toQty'],
    },
  )

type FormValues = z.infer<typeof schema>

interface PackagingFormModalProps {
  open: boolean
  onClose: () => void
  packaging?: Packaging
  onCreated?: (id: number) => void
}

export default function PackagingFormModal({
  open,
  onClose,
  packaging,
  onCreated,
}: PackagingFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(packaging)

  const [createPackaging, { isLoading: isCreating }] = useCreatePackagingMutation()
  const [updatePackaging, { isLoading: isUpdating }] = useUpdatePackagingMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameAr: '',
      nameEn: '',
      price: 0,
      isMultiple: false,
      fromQty: 0,
      toQty: 0,
    },
  })

  const isMultiple = watch('isMultiple')

  useEffect(() => {
    if (open) {
      reset(
        packaging
          ? {
              nameAr: packaging.nameAr,
              nameEn: packaging.nameEn,
              price: packaging.price,
              isMultiple: packaging.isMultiple,
              fromQty: packaging.fromQty,
              toQty: packaging.toQty,
            }
          : { nameAr: '', nameEn: '', price: 0, isMultiple: false, fromQty: 0, toQty: 0 },
      )
    }
  }, [open, packaging, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && packaging) {
        await updatePackaging({ id: packaging.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createPackaging(values).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Packaging' : 'Add Packaging'}
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
            placeholder="e.g. Gift Box"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label="Name (AR)"
            placeholder="مثال: صندوق هدايا"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

        {/* Price */}
        <Input
          {...register('price')}
          label="Price"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          error={errors.price?.message}
          required
        />

        {/* Is Multiple toggle */}
        <Controller
          control={control}
          name="isMultiple"
          render={({ field }) => (
            <Toggle
              label="Is Multiple (qty range applies)"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* Qty range — only shown when isMultiple is true */}
        {isMultiple && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('fromQty')}
              label="From Qty"
              type="number"
              min={0}
              placeholder="0"
              error={errors.fromQty?.message}
              required
            />
            <Input
              {...register('toQty')}
              label="To Qty"
              type="number"
              min={0}
              placeholder="0"
              error={errors.toQty?.message}
              required
            />
          </div>
        )}

      </div>
    </Modal>
  )
}
