// ─── ProductFormModal ─────────────────────────────────────────────────────────
//
//  Handles Create and Edit in one modal.
//  Pass `product` to enter edit mode; omit for create mode.

import { useEffect, useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Select, Button, Toggle } from '@/components/shared'
import MultiSelect from '@/components/shared/MultiSelect'
import RichEditor from '@/components/shared/RichEditor'
import type { ProductFull, CreateProductRequest } from '../types'
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetCategoryDropdownQuery,
  useGetSubCategoryDropdownQuery,
  useGetProductTypeDropdownQuery,
  useGetProductTypeDetailDropdownQuery,
  useGetBrandDropdownQuery,
  useGetHairTypeDropdownQuery,
  useGetSkinTypeDropdownQuery,
  useGetBeautyCategoryDropdownQuery,
  useGetConcernDropdownQuery,
  useGetInterestDropdownQuery,
  useGetGoalDropdownQuery,
} from '../services/productApi'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, 'Arabic name is required'),
  enName: z.string().min(1, 'English name is required'),
  brandId: z.coerce.number().min(1, 'Brand is required'),
  categoryId: z.coerce.number().min(1, 'Category is required'),
  subCategoryId: z.array(z.number()).min(1, 'At least one sub-category is required'),
  productTypeId: z.coerce.number().min(1, 'Product type is required'),
  howToUse: z.string().default(''),
  description: z.string().default(''),
  ingredients: z.string().default(''),
  isVegan: z.boolean().default(false),
  forChildren: z.boolean().default(false),
  canTry: z.boolean().default(false),
  isDisappearColor: z.boolean().default(false),
  isDisappearSize: z.boolean().default(false),
  hairTypes: z.array(z.number()).default([]),
  skinTypes: z.array(z.number()).default([]),
  productTypeDetailIds: z.array(z.number()).default([]),
  isSensitiveSkin: z.boolean().default(false),
  isActive: z.boolean().default(true),
  beautyCategoryIds: z.array(z.number()).default([]),
  concernIds: z.array(z.number()).default([]),
  interestIds: z.array(z.number()).default([]),
  goalIds: z.array(z.number()).default([]),
})

type FormValues = z.infer<typeof schema>
type SkinHairMode = 'none' | 'hair' | 'skin'

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  product?: ProductFull
  onCreated?: (id: number) => void
}

export default function ProductFormModal({
  open,
  onClose,
  product,
  onCreated,
}: ProductFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(product)

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const isLoading = isCreating || isUpdating

  // ── Dropdowns ──────────────────────────────────────────────────────────────
  const { data: categories = [] } = useGetCategoryDropdownQuery()
  const { data: allSubCategories = [] } = useGetSubCategoryDropdownQuery()
  const { data: productTypes = [] } = useGetProductTypeDropdownQuery()
  const { data: brands = [] } = useGetBrandDropdownQuery()
  const { data: hairTypes = [] } = useGetHairTypeDropdownQuery()
  const { data: skinTypes = [] } = useGetSkinTypeDropdownQuery()
  const { data: beautyCategories = [] } = useGetBeautyCategoryDropdownQuery()
  const { data: concerns = [] } = useGetConcernDropdownQuery()
  const { data: interests = [] } = useGetInterestDropdownQuery()
  const { data: goals = [] } = useGetGoalDropdownQuery()

  const [watchedCategoryId, setWatchedCategoryId] = useState(0)
  const [watchedProductTypeId, setWatchedProductTypeId] = useState(0)
  const [skinHairMode, setSkinHairMode] = useState<SkinHairMode>('none')

  const { data: productTypeDetails = [] } = useGetProductTypeDetailDropdownQuery(
    watchedProductTypeId,
    { skip: watchedProductTypeId === 0 },
  )

  const filteredSubCategories = useMemo(
    () => allSubCategories.filter((s) => s.categoryId === watchedCategoryId),
    [allSubCategories, watchedCategoryId],
  )

  const {
    register, handleSubmit, reset, control, setValue, watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', enName: '', brandId: 0, categoryId: 0,
      subCategoryId: [], productTypeId: 0,
      howToUse: '', description: '', ingredients: '',
      isVegan: false, forChildren: false, canTry: false,
      isDisappearColor: false, isDisappearSize: false,
      hairTypes: [], skinTypes: [], productTypeDetailIds: [],
      isSensitiveSkin: false, isActive: true,
      beautyCategoryIds: [], concernIds: [], interestIds: [], goalIds: [],
    },
  })

  const categoryIdValue = watch('categoryId')
  const productTypeIdValue = watch('productTypeId')

  useEffect(() => {
    setWatchedCategoryId(Number(categoryIdValue) || 0)
    setValue('subCategoryId', [])
  }, [categoryIdValue, setValue])

  useEffect(() => {
    setWatchedProductTypeId(Number(productTypeIdValue) || 0)
    setValue('productTypeDetailIds', [])
  }, [productTypeIdValue, setValue])

  useEffect(() => {
    if (!open) return
    if (product) {
      const hairMode: SkinHairMode =
        (product.hairTypes?.length ?? 0) > 0 ? 'hair' :
        (product.skinTypes?.length ?? 0) > 0 ? 'skin' : 'none'
      setSkinHairMode(hairMode)
      setWatchedCategoryId(product.categoryId)
      setWatchedProductTypeId(product.productTypeId)
      reset({
        name: product.name,
        enName: product.enName,
        brandId: product.brandId,
        categoryId: product.categoryId,
        subCategoryId: (product.subCategories ?? []).map((s) => s.id),
        productTypeId: product.productTypeId,
        howToUse: product.howToUse ?? '',
        description: product.description ?? '',
        ingredients: product.ingredients ?? '',
        isVegan: product.isVegan,
        forChildren: product.forChildren,
        canTry: product.canTry,
        isDisappearColor: product.isDisappearColor,
        isDisappearSize: product.isDisappearSize,
        hairTypes: (product.hairTypes ?? []).map((h) => h.id),
        skinTypes: (product.skinTypes ?? []).map((s) => s.id),
        productTypeDetailIds: [],
        isSensitiveSkin: product.isSensitiveSkin,
        isActive: product.isActive,
        beautyCategoryIds: product.concernIds ?? [],
        concernIds: product.concernIds ?? [],
        interestIds: product.interestIds ?? [],
        goalIds: product.goalIds ?? [],
      })
    } else {
      setSkinHairMode('none')
      setWatchedCategoryId(0)
      setWatchedProductTypeId(0)
      reset({
        name: '', enName: '', brandId: 0, categoryId: 0,
        subCategoryId: [], productTypeId: 0,
        howToUse: '', description: '', ingredients: '',
        isVegan: false, forChildren: false, canTry: false,
        isDisappearColor: false, isDisappearSize: false,
        hairTypes: [], skinTypes: [], productTypeDetailIds: [],
        isSensitiveSkin: false, isActive: true,
        beautyCategoryIds: [], concernIds: [], interestIds: [], goalIds: [],
      })
    }
  }, [open, product, reset])

  const onSubmit = async (values: FormValues) => {
    const payload: CreateProductRequest = {
      ...values,
      hairTypes: skinHairMode === 'hair' ? values.hairTypes : [],
      skinTypes: skinHairMode === 'skin' ? values.skinTypes : [],
    }
    try {
      if (isEdit && product) {
        await updateProduct({ id: product.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createProduct(payload).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    } catch {
      toast.error(t('common.error'))
    }
  }

  const toOpts = (items: { id: number; name: string }[]) =>
    items.map((i) => ({ value: i.id, label: i.name }))

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[var(--border)] pb-1 mb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </span>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      size="xl"
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
      <div className="flex flex-col gap-5">

        <SectionHeading title="Basic Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('enName')} label="Name (EN)" placeholder="e.g. Clary Hair Conditioner" error={errors.enName?.message} required />
          <Input {...register('name')} label="Name (AR)" placeholder="مثال: كلاري بلسم" error={errors.name?.message} dir="rtl" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
  name="brandId"
  control={control}
  render={({ field }) => (
    <Select  label="Brand" 
    options={toOpts(brands)} 
    placeholder="Select a brand" 
    error={errors.brandId?.message} 
    required 
    value={field.value}
    onChange={(e) => field.onChange(Number(e.target.value))}
    onBlur={field.onBlur}
    />

  )}
/>
          <div className="flex items-center gap-4 pt-6">
            <Controller control={control} name="isActive" render={({ field }) => (
              <Toggle label="Active" checked={field.value} onChange={field.onChange} />
            )} />
          </div>
        </div>

        <SectionHeading title="Category" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
   <Controller
  name="categoryId"
  control={control}
  render={({ field }) => (
    <Select  label="Category" 
    options={toOpts(categories)} 
    placeholder="Select category" 
    error={errors.categoryId?.message} 
    required 
    value={field.value}
    onChange={(e) => field.onChange(Number(e.target.value))}
    onBlur={field.onBlur}
    />

  )}
/>
          <Controller control={control} name="subCategoryId" render={({ field }) => (
            <MultiSelect
              label="Sub Category"
              options={watchedCategoryId ? toOpts(filteredSubCategories) : []}
              value={field.value}
              onChange={field.onChange}
              placeholder={watchedCategoryId ? 'Select sub-categories' : 'Select category first'}
              disabled={!watchedCategoryId}
              error={errors.subCategoryId?.message}
              required
            />
          )} />
        </div>

        <SectionHeading title="Product Type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Controller
  name="productTypeId"
  control={control}
  render={({ field }) => (
    <Select  label="Product Type" 
    options={toOpts(productTypes)} 
    placeholder="Select product type" 
    error={errors.productTypeId?.message} 
    required 
    value={field.value}
    onChange={(e) => field.onChange(Number(e.target.value))}
    onBlur={field.onBlur}
    />

  )}
/>
          <Controller control={control} name="productTypeDetailIds" render={({ field }) => (
            <MultiSelect
              label="Product Type Details"
              options={watchedProductTypeId ? toOpts(productTypeDetails) : []}
              value={field.value}
              onChange={field.onChange}
              placeholder={watchedProductTypeId ? 'Select details' : 'Select product type first'}
              disabled={!watchedProductTypeId}
            />
          )} />
        </div>

        <SectionHeading title="Hair / Skin" />
        <div className="flex items-center gap-3 flex-wrap">
          {(['none', 'hair', 'skin'] as SkinHairMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSkinHairMode(mode)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${skinHairMode === mode
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                }`}
            >
              {mode === 'none' ? 'None' : mode === 'hair' ? 'Hair' : 'Skin'}
            </button>
          ))}
        </div>

        {skinHairMode === 'hair' && (
          <Controller control={control} name="hairTypes" render={({ field }) => (
            <MultiSelect label="Hair Types" options={toOpts(hairTypes)} value={field.value} onChange={field.onChange} placeholder="Select hair types" />
          )} />
        )}

        {skinHairMode === 'skin' && (
          <div className="flex flex-col gap-3">
            <Controller control={control} name="skinTypes" render={({ field }) => (
              <MultiSelect label="Skin Types" options={toOpts(skinTypes)} value={field.value} onChange={field.onChange} placeholder="Select skin types" />
            )} />
            <Controller control={control} name="isSensitiveSkin" render={({ field }) => (
              <Toggle label="Sensitive Skin" checked={field.value} onChange={field.onChange} />
            )} />
          </div>
        )}

        <SectionHeading title="Flags" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([
            { name: 'isVegan', label: 'Vegan' },
            { name: 'forChildren', label: 'For Children' },
            { name: 'canTry', label: 'Can Try' },
            { name: 'isDisappearColor', label: 'Disappear Color' },
            { name: 'isDisappearSize', label: 'Disappear Size' },
          ] as { name: keyof FormValues; label: string }[]).map(({ name, label }) => (
            <Controller key={name} control={control} name={name} render={({ field }) => (
              <Toggle label={label} checked={field.value as boolean} onChange={field.onChange} />
            )} />
          ))}
        </div>

        <SectionHeading title="Categorization" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller control={control} name="beautyCategoryIds" render={({ field }) => (
            <MultiSelect label="Beauty Categories" options={toOpts(beautyCategories)} value={field.value} onChange={field.onChange} placeholder="Select beauty categories" />
          )} />
          <Controller control={control} name="concernIds" render={({ field }) => (
            <MultiSelect label="Concerns" options={toOpts(concerns)} value={field.value} onChange={field.onChange} placeholder="Select concerns" />
          )} />
          <Controller control={control} name="interestIds" render={({ field }) => (
            <MultiSelect label="Interests" options={toOpts(interests)} value={field.value} onChange={field.onChange} placeholder="Select interests" />
          )} />
          <Controller control={control} name="goalIds" render={({ field }) => (
            <MultiSelect label="Goals" options={toOpts(goals)} value={field.value} onChange={field.onChange} placeholder="Select goals" />
          )} />
        </div>

        <SectionHeading title="Content" />
        <Controller control={control} name="description" render={({ field }) => (
          <RichEditor label="Description" value={field.value} onChange={field.onChange} height={200} />
        )} />
        <Controller control={control} name="howToUse" render={({ field }) => (
          <RichEditor label="How To Use" value={field.value} onChange={field.onChange} height={200} />
        )} />
        <Controller control={control} name="ingredients" render={({ field }) => (
          <RichEditor label="Ingredients" value={field.value} onChange={field.onChange} height={200} />
        )} />

      </div>
    </Modal>
  )
}