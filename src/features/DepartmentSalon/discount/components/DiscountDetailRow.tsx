// ─── DiscountDetailRow ────────────────────────────────────────────────────────
//
//  One service row in the discount create form.
//  Picks a salon service + sets discount percentage.

import { HiTrash } from 'react-icons/hi'
import { Input, Select } from '@/components/shared'
import { useGetSalonServiceDropdownQuery } from '../services/salonServiceDiscountApi'
import type { DiscountDetailRequest } from '../types'

interface DiscountDetailRowProps {
  index: number
  value: DiscountDetailRequest
  onChange: (value: DiscountDetailRequest) => void
  onRemove: () => void
  usedServiceIds: number[]   // prevent duplicate service selection
}

export default function DiscountDetailRow({
  index,
  value,
  onChange,
  onRemove,
  usedServiceIds,
}: DiscountDetailRowProps) {
  const { data: services = [] } = useGetSalonServiceDropdownQuery()

  // Exclude already-selected services (except the current row's own selection)
  const serviceOptions = services
    .filter((s) => s.id === value.salonServiceId || !usedServiceIds.includes(s.id))
    .map((s) => ({ value: s.id, label: s.name }))

  const isFirst = index === 0

  return (
    <div className="grid grid-cols-12 gap-3 items-end p-3 rounded-[var(--radius)] bg-[var(--bg-hover)] border border-[var(--border)]">

      {/* Index badge */}
      <div className="col-span-1 flex items-center justify-center">
        <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
      </div>

      {/* Service select */}
      <div className="col-span-12 sm:col-span-7">
        <Select
          label={isFirst ? 'Salon Service' : undefined}
          options={serviceOptions}
          placeholder="Select service…"
          value={value.salonServiceId || ''}
          onChange={(e) => onChange({ ...value, salonServiceId: Number(e.target.value) })}
          required
        />
      </div>

      {/* Discount % */}
      <div className="col-span-9 sm:col-span-3">
        <Input
          label={isFirst ? 'Discount %' : undefined}
          type="number"
          min={1}
          max={100}
          placeholder="e.g. 20"
          value={value.discountValue || ''}
          onChange={(e) => onChange({ ...value, discountValue: Number(e.target.value) })}
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
