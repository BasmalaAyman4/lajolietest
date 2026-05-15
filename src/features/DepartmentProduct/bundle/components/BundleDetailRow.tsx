// ─── BundleDetailRow ──────────────────────────────────────────────────────────
//
//  A single row in the bundle details editor.
//  - User picks a product from dropdown → triggers lazy fetch of its detail options
//  - User picks a detail (size + color) from the fetched options
//  - User enters priceInBundle and qty
//  - Remove button calls onRemove()

import { useState, useEffect } from 'react'
import { HiTrash } from 'react-icons/hi'
import { Input, Select } from '@/components/shared'
import { useLazyGetProductDetailsQuery, useGetProductDropdownQuery } from '../services/productBundleApi'
import type { BundleDetailRequest, ProductDetailOption } from '../types'

interface BundleDetailRowProps {
  index: number
  value: BundleDetailRequest & { _productId?: number }
  onChange: (value: BundleDetailRequest & { _productId?: number }) => void
  onRemove: () => void
}

export default function BundleDetailRow({ index, value, onChange, onRemove }: BundleDetailRowProps) {
  const { data: products = [] } = useGetProductDropdownQuery()
  const [fetchDetails, { data: detailOptions = [], isFetching }] = useLazyGetProductDetailsQuery()
  const [localDetails, setLocalDetails] = useState<ProductDetailOption[]>(detailOptions)

  // When product changes, fetch its details
  useEffect(() => {
    if (value._productId) {
      fetchDetails(value._productId).then((res) => {
        if (res.data) setLocalDetails(res.data)
      })
    }
  }, [value._productId, fetchDetails])

  // Keep localDetails in sync when RTK returns data
  useEffect(() => {
    if (detailOptions.length > 0) setLocalDetails(detailOptions)
  }, [detailOptions])

  const productOptions = products.map((p) => ({ value: p.id, label: p.name }))

  const detailSelectOptions = localDetails.map((d) => ({
    value: d.detailId,
    label: `${d.sizeName} – ${d.colorName}  (Cost: ${d.purchasePrice})`,
  }))

  const handleProductChange = (e: { target: { value: string } }) => {
    const productId = Number(e.target.value)
    // Reset detail when product changes
    onChange({ ...value, _productId: productId, productDetailId: 0 })
    if (productId) fetchDetails(productId)
  }

  const handleDetailChange = (e: { target: { value: string } }) => {
    onChange({ ...value, productDetailId: Number(e.target.value) })
  }

  return (
    <div className="grid grid-cols-12 gap-3 items-end p-3 rounded-[var(--radius)] bg-[var(--bg-hover)] border border-[var(--border)]">

      {/* Row number */}
      <div className="col-span-12 sm:col-span-1 flex items-center justify-center">
        <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold flex items-center justify-center">
          {index + 1}
        </span>
      </div>

      {/* Product select */}
      <div className="col-span-12 sm:col-span-4">
        <Select
          label={index === 0 ? 'Product' : undefined}
          options={productOptions}
          placeholder="Select product…"
          value={value._productId ?? ''}
          onChange={handleProductChange}
          required
        />
      </div>

      {/* Detail select (size + color) */}
      <div className="col-span-12 sm:col-span-3">
        <Select
          label={index === 0 ? 'Size / Color' : undefined}
          options={detailSelectOptions}
          placeholder={isFetching ? 'Loading…' : value._productId ? 'Select detail…' : 'Pick product first'}
          value={value.productDetailId || ''}
          onChange={handleDetailChange}
          disabled={!value._productId || isFetching}
          required
        />
      </div>

      {/* Price in bundle */}
      <div className="col-span-5 sm:col-span-2">
        <Input
          label={index === 0 ? 'Price' : undefined}
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={value.priceInBundle}
          onChange={(e) => onChange({ ...value, priceInBundle: Number(e.target.value) })}
          required
        />
      </div>

      {/* Qty */}
      <div className="col-span-5 sm:col-span-1">
        <Input
          label={index === 0 ? 'Qty' : undefined}
          type="number"
          min={1}
          placeholder="1"
          value={value.qty}
          onChange={(e) => onChange({ ...value, qty: Number(e.target.value) })}
          required
        />
      </div>

      {/* Remove */}
      <div className={`col-span-2 sm:col-span-1 flex justify-end ${index === 0 ? 'pb-0 sm:pb-0 pt-5' : ''}`}>
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          className="w-8 h-8 rounded-lg flex items-center justify-center
            text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
        >
          <HiTrash size={15} />
        </button>
      </div>

    </div>
  )
}
