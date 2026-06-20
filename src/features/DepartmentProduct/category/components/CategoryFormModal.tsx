
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Textarea } from '@/components/shared'
import type { CategoryProduct } from '../types'
import {
  useCreateCategoryProductMutation,
  useUpdateCategoryProductMutation,
} from '../services/categoryProductApi'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().min(1, 'Description is required'),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface CategoryProductFormModalProps {
  open: boolean
  onClose: () => void
  /** Pass to enter edit mode */
  categoryProduct?: CategoryProduct
  /** Called after successful create, with the new category id */
  onCreated?: (id: number) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CategoryProductFormModal({
  open,
  onClose,
  categoryProduct,
  onCreated,
}: CategoryProductFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(categoryProduct)

  const [createCategoryProduct, { isLoading: isCreating }] = useCreateCategoryProductMutation()
  const [updateCategoryProduct, { isLoading: isUpdating }] = useUpdateCategoryProductMutation()
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

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        categoryProduct
          ? { nameAr: categoryProduct.nameAr, nameEn: categoryProduct.nameEn, description: categoryProduct.description }
          : { nameAr: '', nameEn: '', description: '' },
      )
    }
  }, [open, categoryProduct, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && categoryProduct) {
        await updateCategoryProduct({ id: categoryProduct.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createCategoryProduct(values).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    }  catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('category.editCategory', 'Edit Category') : t('category.addCategory', 'Add Category')}
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
            label={t('category.nameEn', 'Name (EN)')}
            placeholder="e.g. Electronics"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label={t('category.nameAr', 'Name (AR)')}
            placeholder="مثال: إلكترونيات"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

        {/* Description */}
        <Textarea
          {...register('description')}
          label={t('category.description', 'Description')}
          placeholder={t('category.descriptionPlaceholder', 'Short description about the category…')}
          error={errors.description?.message}
                  rows={3}
          required
        />
      </div>
    </Modal>
  )
}