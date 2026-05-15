// ─── PackagingDetailRow ───────────────────────────────────────────────────────
//
//  One packaging row in the packaging purchase form.
//  Simpler than PurchaseDetailRow — packaging has no variants.

import { HiTrash } from 'react-icons/hi'
import { Input, Select } from '@/components/shared'
import { useGetPackagingDropdownQuery } from '../services/purchaseApi'
import type { PackagingPurchaseDetailRequest } from '../types'

interface PackagingDetailRowProps {
  index: number
  value: PackagingPurchaseDetailRequest
  onChange: (value: PackagingPurchaseDetailRequest) => void
  onRemove: () => void
}

export default function PackagingDetailRow({ index, value, onChange, onRemove }: PackagingDetailRowProps) {
  const { data: packagings = [] } = useGetPackagingDropdownQuery()
  const packagingOptions = packagings.map((p) => ({ value: p.id, label: p.name }))
  const isFirst = index === 0

  return (
    <div className="grid grid-cols-12 gap-3 items-end p-3 rounded-[var(--radius)] bg-[var(--bg-hover)] border border-[var(--border)]">

      {/* Index badge */}
      <div className="col-span-12 sm:col-span-1 flex items-center justify-center">
        <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
      </div>

      {/* Packaging */}
      <div className="col-span-12 sm:col-span-5">
        <Select
          label={isFirst ? 'Packaging' : undefined}
          options={packagingOptions}
          placeholder="Select packaging…"
          value={value.packagingId || ''}
          onChange={(e) => onChange({ ...value, packagingId: Number(e.target.value) })}
          required
        />
      </div>

      {/* Unit price */}
      <div className="col-span-5 sm:col-span-3">
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
      <div className="col-span-5 sm:col-span-2">
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

    </div>
  )
}
