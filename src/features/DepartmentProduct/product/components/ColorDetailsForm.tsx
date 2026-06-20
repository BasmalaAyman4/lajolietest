// ─── ColorDetailsForm ─────────────────────────────────────────────────────────
//
//  Unified form for:
//   - Adding a new color + sizes (default)
//   - Sizes-only mode (isDisappearColor = true)  →  no color fields
//   - Color-only mode (isDisappearSize = true)   →  no size section
//   - Adding more sizes to an existing color      →  addSizesToColor set
//   - Editing an existing color row

import { useState } from 'react'
import { toast } from 'sonner'
import { Input, Select, Button } from '@/components/shared'
import DualColorPicker from './DualColorPicker'
import SizeListManager, { type SizeRow } from './SizeListManager'
import {
  useSaveProductDetailsMutation,
  useUpdateProductDetailsMutation,
  useGetHeadColorDropdownQuery,
} from '../services/productApi'
import type { ProductColor, ProductFull, SizeDetailEntry } from '../types'
import { getApiError } from '@/services/apiHelpers'
import { useTranslation } from 'react-i18next'

// ── helpers ───────────────────────────────────────────────────────────────────
const rgbToHex = (rgb: string | undefined): string => {
  if (!rgb || rgb.startsWith('#')) return rgb ?? '#000000'
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!m) return '#000000'
  return `#${[m[1], m[2], m[3]]
    .map((n) => parseInt(n).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`
}

// ── types ─────────────────────────────────────────────────────────────────────
interface ColorDetailsFormProps {
  productId: number
  product: ProductFull
  onSave: (message: string) => void
  onCancel: () => void
  /** Provide when editing an existing color row */
  initialData?: ProductColor | null
  /** When true: show sizes only, no color fields (isDisappearColor) */
  sizesOnly?: boolean
  /** When true: show color only, no size section (isDisappearSize) */
  isDisappearSize?: boolean
  /** When set: add new sizes to this existing color */
  addSizesToColor?: ProductColor | null
}

// ── form state shape ──────────────────────────────────────────────────────────
interface FormState {
  headColorId: number | null
  colorNameAr: string
  colorNameEn: string
  colorHex: string
  purchasePrice: number
  salesPrice: number
  sizes: SizeRow[]
}

export default function ColorDetailsForm({
  productId,
  product,
  onSave,
  onCancel,
  initialData = null,
  sizesOnly = false,
  isDisappearSize = false,
  addSizesToColor = null,
}: ColorDetailsFormProps) {
  const isEdit = Boolean(initialData)
  const { t } = useTranslation()

  // ── RTK mutations ──────────────────────────────────────────────────────────
  const [saveDetails, { isLoading: isSaving }] = useSaveProductDetailsMutation()
  const [updateDetails, { isLoading: isUpdating }] = useUpdateProductDetailsMutation()
  const isLoading = isSaving || isUpdating

  // ── Head color dropdown (only for new color, not sizes-only / addSizes) ────
  const shouldFetchHeadColors = !sizesOnly && !addSizesToColor && !isEdit
  const { data: headColors = [] } = useGetHeadColorDropdownQuery(undefined, {
    skip: !shouldFetchHeadColors,
  })

  // ── Initial form state ─────────────────────────────────────────────────────
  const buildInitial = (): FormState => {
    if (addSizesToColor) {
      return {
        headColorId: addSizesToColor.headColorId ?? null,
        colorNameAr: addSizesToColor.nameAr,
        colorNameEn: addSizesToColor.nameEn,
        colorHex: rgbToHex(addSizesToColor.colorHex),
        purchasePrice: addSizesToColor.purchasePrice ?? 0,
        salesPrice: addSizesToColor.salesPrice ?? 0,
        sizes: [],
      }
    }
    if (!initialData) {
      return {
        headColorId: null,
        colorNameAr: '',
        colorNameEn: '',
        colorHex: '#000000',
        purchasePrice: 0,
        salesPrice: 0,
        sizes: [],
      }
    }
    if (sizesOnly) {
      const sizes = product.details.map<SizeRow>((d) => ({
        sizeId: d.sizeId,
        purchasePrice: d.purchasePrice ?? 0,
        salesPrice: d.salesPrice ?? d.saleaPrice ?? 0,
        detailId: d.detailId,
        isExisting: true,
      }))
      return {
        headColorId: null,
        colorNameAr: '',
        colorNameEn: '',
        colorHex: '#000000',
        purchasePrice: 0,
        salesPrice: 0,
        sizes,
      }
    }
    // edit color
    const sizes = (initialData.sizes ?? []).map<SizeRow>((s) => {
      const detail = product.details.find(
        (d) => d.colorId === initialData.id && d.sizeId === s.sizeId,
      )
      return {
        sizeId: s.sizeId,
        purchasePrice: s.purchasePrice,
        salesPrice: s.salesPrice,
        detailId: detail?.detailId ?? 0,
        isExisting: true,
      }
    })
    return {
      headColorId: initialData.headColorId ?? null,
      colorNameAr: initialData.nameAr,
      colorNameEn: initialData.nameEn,
      colorHex: rgbToHex(initialData.colorHex),
      purchasePrice: initialData.purchasePrice ?? 0,
      salesPrice: initialData.salesPrice ?? 0,
      sizes,
    }
  }

  const [form, setForm] = useState<FormState>(buildInitial)
  const [errors, setErrors] = useState<string[]>([])

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: string[] = []

    if (!sizesOnly && !addSizesToColor) {
      if (!isEdit && !form.headColorId) errs.push('Please select a head color')
      if (!form.colorNameAr.trim()) errs.push('Arabic color name is required')
      if (!form.colorNameEn.trim()) errs.push('English color name is required')
      if (!/^#[0-9A-Fa-f]{6}$/.test(form.colorHex)) errs.push('Please select a valid color')
    }

    if (!isDisappearSize || addSizesToColor) {
      if (form.sizes.length === 0) errs.push('Please add at least one size')
      form.sizes.forEach((s, i) => {
        if (!s.sizeId) errs.push(`Size #${i + 1}: please select a size`)
      })
    }

    setErrors(errs)
    return errs.length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return

    try {
      if (isEdit) {
        // Update mode — use updateProductDetails
        let details: Array<{ sizeId: number; purchasePrice: number; salesPrice: number; detailId: number | null }>

        if (isDisappearSize) {
          details = []
        } else {
          details = form.sizes.map((s) => ({
            sizeId: s.sizeId,
            purchasePrice: s.purchasePrice,
            salesPrice: s.salesPrice,
            detailId: s.detailId ?? null,
          }))
        }

        await updateDetails({
          productId,
          details,
        }).unwrap()
      } else {
        // Create mode
        const sizeIds: SizeDetailEntry[] = form.sizes.map((s) => ({
          sizeId: s.sizeId,
          purchasePrice: s.purchasePrice,
          salesPrice: s.salesPrice,
        }))

        if (sizesOnly) {
          await saveDetails({
            productId,
            sizeIds,
            headColorId: null,
            colorNameAr: null,
            colorNameEn: null,
            colorHex: null,
          }).unwrap()
        } else if (isDisappearSize) {
          await saveDetails({
            productId,
            sizeIds: [],
            headColorId: form.headColorId,
            colorNameAr: form.colorNameAr,
            colorNameEn: form.colorNameEn,
            colorHex: form.colorHex,
            purchasePrice: form.purchasePrice,
            salesPrice: form.salesPrice,
          }).unwrap()
        } else if (addSizesToColor) {
          await saveDetails({
            productId,
            sizeIds,
            headColorId: addSizesToColor.headColorId ?? null,
            colorNameAr: addSizesToColor.nameAr,
            colorNameEn: addSizesToColor.nameEn,
            colorHex: addSizesToColor.colorHex,
            purchasePrice: addSizesToColor.purchasePrice,
            salesPrice: addSizesToColor.salesPrice,
          }).unwrap()
        } else {
          await saveDetails({
            productId,
            sizeIds,
            headColorId: form.headColorId,
            colorNameAr: form.colorNameAr,
            colorNameEn: form.colorNameEn,
            colorHex: form.colorHex,
            purchasePrice: form.purchasePrice,
            salesPrice: form.salesPrice,
          }).unwrap()
        }
      }

      const msg = addSizesToColor
        ? 'Sizes added successfully!'
        : sizesOnly
        ? `Sizes ${isEdit ? 'updated' : 'saved'} successfully!`
        : `Color ${isEdit ? 'updated' : 'saved'} successfully!`

      onSave(msg)
    }  catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        }
  }

  // ── Title ──────────────────────────────────────────────────────────────────
  const title = addSizesToColor
    ? `Add sizes to ${addSizesToColor.nameEn ?? addSizesToColor.nameAr}`
    : sizesOnly
    ? isEdit ? 'Edit Sizes & Pricing' : 'Add Sizes & Pricing'
    : isDisappearSize
    ? isEdit ? `Edit color: ${initialData?.nameEn}` : 'Add New Color'
    : isEdit ? `Edit: ${initialData?.nameEn}` : 'Add New Color'

  return (
    <div className="rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--bg-subtle,#f9fafb)] p-4 mb-4 flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h4>

      {/* ── Color fields (not in sizes-only / addSizesToColor) ───────────── */}
      {!sizesOnly && !addSizesToColor && (
        <>
          {/* Head color — only on new */}
          {!isEdit && (
            <Select
              label="Head Color"
              value={String(form.headColorId ?? '')}
              onChange={(e) => set('headColorId', Number(e.target.value))}
              options={headColors.map((h) => ({ value: String(h.id), label: h.name }))}
              placeholder="Select head color"
              required
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Color Name (Arabic)"
              value={form.colorNameAr}
              onChange={(e) => set('colorNameAr', e.target.value)}
              dir="rtl"
              required
            />
            <Input
              label="Color Name (English)"
              value={form.colorNameEn}
              onChange={(e) => set('colorNameEn', e.target.value)}
              required
            />
          </div>

          {!isDisappearSize && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Base Purchase Price"
                type="number"
                value={String(form.purchasePrice)}
                onChange={(e) => set('purchasePrice', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Base Sales Price"
                type="number"
                value={String(form.salesPrice)}
                onChange={(e) => set('salesPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {/* Disappear-size: price at color level, no sizes */}
          {isDisappearSize && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Purchase Price"
                type="number"
                value={String(form.purchasePrice)}
                onChange={(e) => set('purchasePrice', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Sales Price"
                type="number"
                value={String(form.salesPrice)}
                onChange={(e) => set('salesPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {/* Color picker — always for new color */}
          {!isEdit && (
            <DualColorPicker
              value={form.colorHex}
              onChange={(hex) => set('colorHex', hex)}
              required
            />
          )}
        </>
      )}

      {/* ── Size section ──────────────────────────────────────────────────── */}
      {(!isDisappearSize || addSizesToColor) && (
        <SizeListManager
          value={form.sizes}
          onChange={(rows) => set('sizes', rows)}
          allowAddMore={!(isEdit && (initialData?.sizes?.length ?? 0) <= 1)}
          required
        />
      )}

      {/* ── Validation errors ─────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <ul className="text-xs text-[var(--danger)] flex flex-col gap-0.5">
          {errors.map((e, i) => <li key={i}>• {e}</li>)}
        </ul>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={isLoading}>
          {sizesOnly
            ? isEdit ? 'Update Sizes' : 'Save Sizes'
            : isEdit ? 'Update Color' : 'Save Color'}
        </Button>
      </div>
    </div>
  )
}