// ─── PurchaseDetailRow ────────────────────────────────────────────────────────
//
//  One product row in the purchase form.
//  - Pick product → lazy-fetch its size/color variants
//  - Pick a variant → auto-fills purchasePrice from the variant's cost
//  - Override price and qty freely

import { useState, useEffect } from 'react'
import { HiTrash } from 'react-icons/hi'
import { Input, Select } from '@/components/shared'
import {
  useGetProductDropdownQuery,
  useLazyGetProductDetailsQuery,
} from '../services/purchaseApi'
import type { PurchaseDetailRequest, ProductDetailOption } from '../types'

export type ProductDetailRow = PurchaseDetailRequest & { _productId?: number }

interface PurchaseDetailRowProps {
  index: number
  value: ProductDetailRow
  onChange: (value: ProductDetailRow) => void
  onRemove: () => void
  hideRemove?: boolean 
}

export default function PurchaseDetailRow({ index, value, onChange, onRemove,hideRemove  }: PurchaseDetailRowProps) {
  const { data: products = [] } = useGetProductDropdownQuery()
  const [fetchDetails, { isFetching }] = useLazyGetProductDetailsQuery()
  const [variantOptions, setVariantOptions] = useState<ProductDetailOption[]>([])

  // Re-fetch variants when the product changes
  useEffect(() => {
    if (!value._productId) { setVariantOptions([]); return }
    fetchDetails(value._productId).then((res) => {
      if (res.data) setVariantOptions(res.data)
    })
  }, [value._productId, fetchDetails])

  const productOptions = products.map((p) => ({ value: p.id, label: p.name }))
  const variantSelectOptions = variantOptions.map((v) => ({
    value: v.detailId,
    label: `${v.sizeName} · ${v.colorName}`,
  }))

  const handleProductChange = (e: { target: { value: string } }) => {
    onChange({ ...value, _productId: Number(e.target.value), productDetailId: 0, purchasePrice: 0 })
  }

  const handleVariantChange = (e: { target: { value: string } }) => {
    const detailId = Number(e.target.value)
    const variant = variantOptions.find((v) => v.detailId === detailId)
    onChange({
      ...value,
      productDetailId: detailId,
      purchasePrice: variant?.purchasePrice ?? value.purchasePrice,
    })
  }

  const isFirst = index === 0

  return (
    <div className="grid grid-cols-12 gap-3 items-end p-3 rounded-[var(--radius)] bg-[var(--bg-hover)] border border-[var(--border)]">

      {/* Index badge */}
      <div className="col-span-12 sm:col-span-1 flex items-center justify-center sm:pb-0 pb-0">
        <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
      </div>

      {/* Product */}
      <div className="col-span-12 sm:col-span-4">
        <Select
          label={isFirst ? 'Product' : undefined}
          options={productOptions}
          placeholder="Select product…"
          value={value._productId ?? ''}
          onChange={handleProductChange}
          required
        />
      </div>

      {/* Variant (size + color) */}
      <div className="col-span-12 sm:col-span-3">
        <Select
          label={isFirst ? 'Size / Color' : undefined}
          options={variantSelectOptions}
          placeholder={isFetching ? 'Loading…' : value._productId ? 'Select variant…' : 'Pick product first'}
          value={value.productDetailId || ''}
          onChange={handleVariantChange}
          disabled={!value._productId || isFetching}
          required
        />
      </div>

      {/* Purchase price — auto-filled, editable */}
      <div className="col-span-5 sm:col-span-2">
        <Input
          label={isFirst ? 'Unit Price' : undefined}
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={value.purchasePrice}
          onChange={(e) => onChange({ ...value, purchasePrice: Number(e.target.value) })}
          required
        />
      </div>

      {/* Qty */}
      <div className="col-span-5 sm:col-span-1">
        <Input
          label={isFirst ? 'Qty' : undefined}
          type="number"
          min={1}
          placeholder="1"
          value={value.qty}
          onChange={(e) => onChange({ ...value, qty: Number(e.target.value) })}
          required
        />
      </div>

     

      {/* Remove */}
{!hideRemove && (
  <div className={`col-span-2 sm:col-span-1 flex justify-end ${isFirst ? 'pt-5' : ''}`}>
    <button
      type="button"
      onClick={onRemove}
      title="Remove row"
      className="w-8 h-8 rounded-lg flex items-center justify-center
        text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
    >
      <HiTrash size={15} />
    </button>
  </div>
)}

    </div>
  )
}
