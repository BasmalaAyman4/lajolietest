// ─── ProductPackagingSection ──────────────────────────────────────────────────
//
//  View/Edit table for product packaging.
//  View mode → read-only table with "Stop" per row.
//  Edit mode → inline selects/inputs, add/remove rows, save all.

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  FiPlus,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiXCircle,
} from 'react-icons/fi'
import { Input, Select, Button, ConfirmModal } from '@/components/shared'
import {
  useSaveProductPackagingMutation,
  useStopPackagingMutation,
  useGetSizeDropdownQuery,
  useGetPackagingDropdownQuery,
} from '../services/productApi'
import type { ProductFull, SavePackagingItem } from '../types'

interface Row {
  productPackagingId: number
  sizeId: string
  sizeName: string
  packagingId: string
  packagingName: string
  qty: number
  price: number
  isStoped: boolean
}

interface ProductPackagingSectionProps {
  productId: number
  product: ProductFull
  onUpdate: () => void
}

export default function ProductPackagingSection({
  productId,
  product,
  onUpdate,
}: ProductPackagingSectionProps) {
  const [viewMode, setViewMode] = useState(true)
  const [rows, setRows] = useState<Row[]>([])
  const [editRows, setEditRows] = useState<Row[]>([])
  const [stopId, setStopId] = useState<number | null>(null)

  const { data: sizes = [], isLoading: sizesLoading } = useGetSizeDropdownQuery()
  const { data: packagings = [], isLoading: pkgLoading } = useGetPackagingDropdownQuery()

  const [savePackaging, { isLoading: isSaving }] = useSaveProductPackagingMutation()
  const [stopPackaging, { isLoading: isStopping }] = useStopPackagingMutation()

  // Populate from product
  useEffect(() => {
    const data = (product?.productPackaging ?? []).map<Row>((p) => ({
      productPackagingId: p.productPackagingId ?? 0,
      sizeId: String(p.sizeId ?? ''),
      sizeName: p.sizeName ?? '',
      packagingId: String(p.packagingId ?? ''),
      packagingName: p.packagingName ?? '',
      qty: p.qty ?? 0,
      price: p.price ?? 0,
      isStoped: p.isStoped ?? false,
    }))
    setRows(data)
    setEditRows(data)
  }, [product])

  const enterEdit = () => {
    setEditRows([...rows])
    setViewMode(false)
  }

  const cancelEdit = () => {
    setEditRows([...rows])
    setViewMode(true)
  }

  const addRow = () =>
    setEditRows((prev) => [
      ...prev,
      {
        productPackagingId: 0,
        sizeId: '',
        sizeName: '',
        packagingId: '',
        packagingName: '',
        qty: 0,
        price: 0,
        isStoped: false,
      },
    ])

  const removeRow = (idx: number) => setEditRows((prev) => prev.filter((_, i) => i !== idx))

  const updateRow = <K extends keyof Row>(idx: number, key: K, val: Row[K]) =>
    setEditRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r)))

  const validate = (): string | null => {
    if (editRows.length === 0) return 'Add at least one packaging entry'
    for (let i = 0; i < editRows.length; i++) {
      const r = editRows[i]
      if (!r.sizeId) return `Row ${i + 1}: size is required`
      if (!r.packagingId) return `Row ${i + 1}: packaging is required`
      if (r.qty <= 0) return `Row ${i + 1}: quantity must be > 0`
      if (r.price < 0) return `Row ${i + 1}: price cannot be negative`
    }
    return null
  }

  const handleSave = async () => {
    const err = validate()
    if (err) { toast.error(err); return }

    const saveProductPackagings: SavePackagingItem[] = editRows.map((r) => {
      const item: SavePackagingItem = {
        productId,
        sizeId: parseInt(r.sizeId),
        packagingId: parseInt(r.packagingId),
        qty: parseFloat(String(r.qty)),
        price: parseFloat(String(r.price)),
      }
      if (r.productPackagingId > 0) item.productPackagingId = r.productPackagingId
      return item
    })

    try {
      await savePackaging({ saveProductPackagings }).unwrap()
      toast.success('Packaging saved successfully!')
      setViewMode(true)
      onUpdate()
    } catch {
      toast.error('Failed to save packaging')
    }
  }

  const handleStop = async () => {
    if (!stopId) return
    try {
      await stopPackaging(stopId).unwrap()
      toast.success('Packaging stopped')
      setStopId(null)
      onUpdate()
    } catch {
      toast.error('Failed to stop packaging')
    }
  }

  const dropdownsLoading = sizesLoading || pkgLoading
  const displayRows = viewMode ? rows : editRows

  const sizeOpts = sizes.map((s) => ({ value: String(s.id), label: s.name }))
  const pkgOpts = packagings.map((p) => ({ value: String(p.id), label: p.name }))

  return (
    <>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <span className="font-semibold text-sm text-[var(--text-primary)]">Product Packaging</span>
          {viewMode ? (
            <Button onClick={enterEdit} leftIcon={<FiEdit size={14} />}>Edit</Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={addRow}
                disabled={dropdownsLoading}
                leftIcon={<FiPlus size={13} />}
              >
                Add Row
              </Button>
              <Button variant="secondary" onClick={cancelEdit} leftIcon={<FiX size={13} />}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={isSaving}
                disabled={editRows.length === 0 || dropdownsLoading}
                leftIcon={<FiSave size={13} />}
              >
                Save All
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {dropdownsLoading ? (
          <div className="px-4 py-6 text-sm text-[var(--text-muted)]">Loading options…</div>
        ) : rows.length === 0 && viewMode ? (
          <div className="px-4 py-8 text-sm text-center text-[var(--text-muted)]">
            No packaging entries yet. Click &quot;Edit&quot; to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
                  {['Size', 'Packaging', 'Qty', 'Price', 'Status', !viewMode ? 'Remove' : ''].filter(Boolean).map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-[var(--border)] ${
                      row.isStoped ? 'opacity-50 bg-gray-50' : ''
                    }`}
                  >
                    {/* Size */}
                    <td className="px-4 py-2">
                      {viewMode ? (
                        <span>{row.sizeName || '—'}</span>
                      ) : (
                        <Select
                          label=""
                          value={row.sizeId}
                          onChange={(e) => updateRow(idx, 'sizeId', e.target.value)}
                          options={sizeOpts}
                          placeholder="Size"
                          required
                          disabled={row.isStoped}
                        />
                      )}
                    </td>

                    {/* Packaging */}
                    <td className="px-4 py-2">
                      {viewMode ? (
                        <span>{row.packagingName || '—'}</span>
                      ) : (
                        <Select
                          label=""
                          value={row.packagingId}
                          onChange={(e) => updateRow(idx, 'packagingId', e.target.value)}
                          options={pkgOpts}
                          placeholder="Packaging"
                          required
                          disabled={row.isStoped}
                        />
                      )}
                    </td>

                    {/* Qty */}
                    <td className="px-4 py-2">
                      {viewMode ? (
                        <span>{row.qty}</span>
                      ) : (
                        <Input
                          label=""
                          type="number"
                          value={String(row.qty)}
                          onChange={(e) => updateRow(idx, 'qty', parseFloat(e.target.value) || 0)}
                          disabled={row.isStoped}
                        />
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-2">
                      {viewMode ? (
                        <span>{row.price} EGP</span>
                      ) : (
                        <Input
                          label=""
                          type="number"
                          value={String(row.price)}
                          onChange={(e) => updateRow(idx, 'price', parseFloat(e.target.value) || 0)}
                          disabled={row.isStoped}
                        />
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2">
                      {viewMode ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            row.isStoped ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'
                          }`}>
                            {row.isStoped ? 'Stopped' : 'Active'}
                          </span>
                          {!row.isStoped && row.productPackagingId > 0 && (
                            <button
                              type="button"
                              onClick={() => setStopId(row.productPackagingId)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Stop"
                            >
                              <FiXCircle size={16} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          row.isStoped ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'
                        }`}>
                          {row.isStoped ? 'Stopped' : 'Active'}
                        </span>
                      )}
                    </td>

                    {/* Remove (edit mode only, new rows only) */}
                    {!viewMode && (
                      <td className="px-4 py-2">
                        {row.productPackagingId === 0 && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(stopId)}
        onClose={() => setStopId(null)}
        onConfirm={handleStop}
        loading={isStopping}
        title="Stop Packaging"
        message="Are you sure you want to stop this packaging entry?"
      />
    </>
  )
}