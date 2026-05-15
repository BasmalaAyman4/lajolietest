// ─── SizeListManager ─────────────────────────────────────────────────────────
//
//  Renders a list of size rows (sizeId + purchasePrice + salesPrice).
//  Existing rows lock the size dropdown; new rows allow full edit.

import {
  FiPlus,
  FiX,
} from 'react-icons/fi'
import { Input, Select, Button } from '@/components/shared'
import { useGetSizeDropdownQuery } from '../services/productApi'
import type { SizeDetailEntry } from '../types'

// ── Extended entry used internally ────────────────────────────────────────────
export interface SizeRow extends SizeDetailEntry {
  detailId?: number
  isExisting?: boolean
}

interface SizeListManagerProps {
  value: SizeRow[]
  onChange: (rows: SizeRow[]) => void
  /** Allow adding new rows (false when editing a single-size row) */
  allowAddMore?: boolean
  required?: boolean
}

export default function SizeListManager({
  value,
  onChange,
  allowAddMore = true,
  required,
}: SizeListManagerProps) {
  const { data: sizes = [], isLoading } = useGetSizeDropdownQuery()

  const addRow = () =>
    onChange([
      ...value,
      { sizeId: 0, purchasePrice: 0, salesPrice: 0, detailId: 0, isExisting: false },
    ])

  const removeRow = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  const updateRow = (idx: number, field: keyof SizeRow, val: number | boolean) =>
    onChange(value.map((row, i) => (i === idx ? { ...row, [field]: val } : row)))

  const sizeOptions = sizes.map((s) => ({ value: s.id, label: s.name }))

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] py-2">
        <span className="animate-spin">⟳</span> Loading sizes…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Sizes {required && <span className="text-[var(--danger)]">*</span>}
        </span>
        {allowAddMore && (
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
          >
            <FiPlus size={13} /> Add Size
          </button>
        )}
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic py-1">
          No sizes yet. Click &quot;Add Size&quot; to start.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {value.map((row, idx) => (
            <div
              key={idx}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-3 flex flex-col gap-3"
            >
              {/* Size label + badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Size #{idx + 1}
                  </span>
                  {row.isExisting ? (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      Existing
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-green-50 text-green-700">
                      New
                    </span>
                  )}
                </div>
                {!row.isExisting && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>

              {/* Fields */}
              {!row.isExisting ? (
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    label="Size"
                    value={String(row.sizeId)}
                    onChange={(e) => updateRow(idx, 'sizeId', Number(e.target.value))}
                    options={sizeOptions.map((o) => ({ value: String(o.value), label: o.label }))}
                    placeholder="Select size"
                    required
                  />
                  <Input
                    label="Purchase Price"
                    type="number"
                    value={String(row.purchasePrice)}
                    onChange={(e) => updateRow(idx, 'purchasePrice', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label="Sales Price"
                    type="number"
                    value={String(row.salesPrice)}
                    onChange={(e) => updateRow(idx, 'salesPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Locked size */}
                  <div className="px-3 py-2 rounded-[var(--radius)] bg-[var(--bg-hover)] border border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Size (locked)</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {sizes.find((s) => s.id === row.sizeId)?.name ?? `ID: ${row.sizeId}`}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Purchase Price"
                      type="number"
                      value={String(row.purchasePrice)}
                      onChange={(e) => updateRow(idx, 'purchasePrice', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      label="Sales Price"
                      type="number"
                      value={String(row.salesPrice)}
                      onChange={(e) => updateRow(idx, 'salesPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}