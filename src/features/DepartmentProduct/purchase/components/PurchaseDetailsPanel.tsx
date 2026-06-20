// ─── PurchaseDetailsPanel ─────────────────────────────────────────────────────
//
//  Renders the product rows of an existing purchase.
//  Each row has a delete button → DELETE /Purchase/deleteDetail?id={detailId}

import { useState } from 'react'
import { toast } from 'sonner'
import { HiTrash } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '@/components/shared'
import { useDeletePurchaseDetailMutation } from '../services/purchaseApi'
import type { PurchaseDetail } from '../types'
import { getApiError } from '@/services/apiHelpers'

interface PurchaseDetailsPanelProps {
  details: PurchaseDetail[]
}

export default function PurchaseDetailsPanel({ details }: PurchaseDetailsPanelProps) {
  const { t } = useTranslation()
  const [deleteDetail, { isLoading }] = useDeletePurchaseDetailMutation()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const handleDelete = async () => {
    if (confirmId === null) return
    try {
      await deleteDetail(confirmId).unwrap()
      toast.success('Detail removed')
    } catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        } finally {
      setConfirmId(null)
    }
  }

  if (details.length === 0) {
    return <p className="text-sm text-[var(--text-muted)] py-4 text-center">No product details found.</p>
  }

  const total = details.reduce((s, d) => s + d.purchasePrice * d.qty, 0)

  return (
    <>
      {/* Table header */}
      <div className="hidden sm:grid grid-cols-12 gap-3 px-3 pb-1 border-b border-[var(--border)]">
        {['Product', 'Variant', 'Unit Price', 'Qty', 'Subtotal', ''].map((h, i) => (
          <span key={i} className={`text-xs font-medium text-[var(--text-muted)] ${
            i === 0 ? 'col-span-5' :
            i === 1 ? 'col-span-2' :
            i === 2 ? 'col-span-2 text-right' :
            i === 3 ? 'col-span-1 text-center' :
            i === 4 ? 'col-span-1 text-right' : 'col-span-1'
          }`}>{h}</span>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {details.map((d) => (
          <div
            key={d.detailId}
            className="grid grid-cols-12 gap-3 items-center px-3 py-2.5
              rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]"
          >
            {/* Product name */}
            <div className="col-span-11 sm:col-span-5">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{d.productName}</p>
            </div>

            {/* Variant */}
            <div className="col-span-12 sm:col-span-2">
              <span className="text-xs text-[var(--text-muted)]">{d.sizeName} · {d.colorName}</span>
            </div>

            {/* Unit price */}
            <div className="col-span-4 sm:col-span-2 text-right">
              <span className="text-sm text-[var(--text-secondary)]">{d.purchasePrice.toFixed(2)}</span>
            </div>

            {/* Qty */}
            <div className="col-span-3 sm:col-span-1 text-center">
              <span className="text-sm text-[var(--text-secondary)]">{d.qty}</span>
            </div>

            {/* Subtotal */}
            <div className="col-span-4 sm:col-span-1 text-right">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {(d.purchasePrice * d.qty).toLocaleString()}
              </span>
            </div>

            {/* Delete */}
            <div className="col-span-1 flex justify-end">
              <button
                type="button"
                title="Remove detail"
                onClick={() => setConfirmId(d.detailId)}
                disabled={isLoading}
                className="w-7 h-7 rounded-lg flex items-center justify-center
                  text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
              >
                <HiTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total row */}
      <div className="flex justify-end pt-1">
        <div className="flex items-center gap-3 px-4 py-2 rounded-[var(--radius)] bg-[var(--accent-soft)]">
          <span className="text-sm text-[var(--text-secondary)]">Total</span>
          <span className="text-base font-bold text-[var(--accent)]">{total.toLocaleString()}</span>
        </div>
      </div>

      <ConfirmModal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={isLoading}
        title="Remove Detail"
        message="Remove this product from the purchase? This cannot be undone."
      />
    </>
  )
}
