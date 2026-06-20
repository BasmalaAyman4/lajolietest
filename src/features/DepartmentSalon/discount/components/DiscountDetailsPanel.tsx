// ─── DiscountDetailsPanel ─────────────────────────────────────────────────────
//
//  Renders detail rows of an existing discount.
//  Each row shows service name, discount %, status and a stop button.

import { useState } from 'react'
import { toast } from 'sonner'
import { HiStop, HiBan } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '@/components/shared'
import { useStopDiscountDetailMutation } from '../services/salonServiceDiscountApi'
import type { DiscountDetail } from '../types'
import { getApiError } from '@/services/apiHelpers'

interface DiscountDetailsPanelProps {
  discountId: number
  details: DiscountDetail[]
  isDiscountStopped: boolean
}

export default function DiscountDetailsPanel({
  discountId,
  details,
  isDiscountStopped,
}: DiscountDetailsPanelProps) {
  const { t } = useTranslation()
  const [stopDetail, { isLoading }] = useStopDiscountDetailMutation()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const handleStop = async () => {
    if (confirmId === null) return
    try {
      await stopDetail({ discountId, detailId: confirmId }).unwrap()
      toast.success('Service discount stopped')
    }catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            } finally {
      setConfirmId(null)
    }
  }

  if (details.length === 0) {
    return <p className="text-sm text-[var(--text-muted)] py-4 text-center">No services in this discount.</p>
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {details.map((d) => (
          <div
            key={d.detailId}
            className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]"
          >
            {/* Service name */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${d.isStoped ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                {d.name}
              </p>
            </div>

            {/* Discount badge */}
            <span className={`shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              d.isStoped
                ? 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                : 'bg-green-100 text-green-700'
            }`}>
              {d.discountValue}% off
            </span>

            {/* Status */}
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
              d.isStoped
                ? 'bg-red-50 text-[var(--danger)]'
                : 'bg-[var(--accent-soft)] text-[var(--accent)]'
            }`}>
              {d.isStoped ? 'Stopped' : 'Active'}
            </span>

            {/* Stop button — only if not already stopped and discount itself is not stopped */}
            {!d.isStoped && !isDiscountStopped && (
              <button
                type="button"
                title="Stop this service discount"
                onClick={() => setConfirmId(d.detailId)}
                disabled={isLoading}
                className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center
                  text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
              >
                <HiBan size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={handleStop}
        loading={isLoading}
        title="Stop Service Discount"
        message="Are you sure you want to stop this service discount? This cannot be undone."
        variant="stop"
      />
    </>
  )
}
