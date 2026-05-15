// ─── BundleDetailsPanel ───────────────────────────────────────────────────────
//
//  Displays the products inside an existing bundle and allows removing them
//  one by one via DELETE /ProductBundle/{bundleId}/{productDetailId}.
//  Used inside BundleDetailsPage.

import { useState } from 'react'
import { toast } from 'sonner'
import { HiTrash } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '@/components/shared'
import { useRemoveBundleDetailMutation } from '../services/productBundleApi'
import type { ProductBundleDetail } from '../types'

interface BundleDetailsPanelProps {
  bundleId: number
  details: ProductBundleDetail[]
}

export default function BundleDetailsPanel({ bundleId, details }: BundleDetailsPanelProps) {
  const { t } = useTranslation()
  const [removeDetail, { isLoading }] = useRemoveBundleDetailMutation()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const handleRemove = async () => {
    if (!confirmId) return
    try {
      await removeDetail({ bundleId, productDetailId: confirmId }).unwrap()
      toast.success('Product removed from bundle')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setConfirmId(null)
    }
  }

  if (details.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-4 text-center">
        No products in this bundle yet.
      </p>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {details.map((d) => (
          <div
            key={d.bandleDetsilId}
            className="flex items-center gap-3 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]"
          >
            {/* Product info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{d.productName}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {d.sizeName} · {d.colorName}
              </p>
            </div>

            {/* Price in bundle */}
            <div className="text-center shrink-0">
              <p className="text-xs text-[var(--text-muted)]">Price</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{d.priceInBundle.toFixed(2)}</p>
            </div>

            {/* Qty */}
            <div className="text-center shrink-0">
              <p className="text-xs text-[var(--text-muted)]">Qty</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{d.qty}</p>
            </div>

            {/* Remove button */}
            <button
              type="button"
              title="Remove from bundle"
              onClick={() => setConfirmId(d.productDetailId)}
              disabled={isLoading}
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center
                text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
            >
              <HiTrash size={15} />
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={handleRemove}
        loading={isLoading}
        title="Remove Product"
        message="Remove this product from the bundle?"
      />
    </>
  )
}
