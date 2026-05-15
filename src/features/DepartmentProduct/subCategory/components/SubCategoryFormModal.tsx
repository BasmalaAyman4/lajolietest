// ─── SpecialistFormModal ──────────────────────────────────────────────────────
//
//  Handles both Create and Edit in one modal.
//  Pass `specialist` to enter edit mode; omit it for create mode.

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Select, Button, Textarea } from '@/components/shared'
import type { DropdownOption } from '@/types'
import type { CategoryOption, SubCategory } from '../types'
import {
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
} from '../services/subCategoryApi'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  categoryId: z.coerce.number().min(1, 'Category is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface SubCategoryFormModalProps {
  open: boolean
  onClose: () => void
  /** Pass to enter edit mode */
  subCategory?: SubCategory
  categories: CategoryOption[]
  /** Called after successful create, with the new specialist id */
  onCreated?: (id: number) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SubCategoryFormModal({
  open,
  onClose,
  subCategory,
  categories,
  onCreated,
}: SubCategoryFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(subCategory)

  const [createSubCategory, { isLoading: isCreating }] = useCreateSubCategoryMutation()
  const [updateSubCategory, { isLoading: isUpdating }] = useUpdateSubCategoryMutation()
  const isLoading = isCreating || isUpdating

  const categoryOptions: DropdownOption[] = categories.map((j) => ({
    value: j.id,
    label: j.name,
  }))

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: 0, nameAr: '', nameEn: '' },
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        subCategory
          ? { categoryId: subCategory.categoryId, nameAr: subCategory.nameAr, nameEn: subCategory.nameEn }
          : { categoryId: 0, nameAr: '', nameEn: '' },
      )
    }
  }, [open, subCategory, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && subCategory) {
        await updateSubCategory({ id: subCategory.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createSubCategory(values).unwrap()
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
      title={isEdit ? t('subCategory.editSubCategory', 'Edit Sub Category') : t('subCategory.addSubCategory', 'Add Sub Category')}
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
        {/* Job */}
     <Controller
  name="categoryId"
  control={control}
  render={({ field }) => (
    <Select
      label={t('subCategory.category', 'Category')}
      options={categoryOptions}
      placeholder={t('subCategory.selectCategory', 'Select a category')}
      error={errors.categoryId?.message}
      required
      name={field.name}
      value={field.value}
      onChange={(e) => field.onChange(Number(e.target.value))}
      onBlur={field.onBlur}
    />
  )}
/>

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('nameEn')}
            label={t('specialist.nameEn', 'Name (EN)')}
            placeholder="e.g. Sarah Ahmed"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label={t('specialist.nameAr', 'Name (AR)')}
            placeholder="مثال: سارة أحمد"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

      </div>
    </Modal>
  )
}