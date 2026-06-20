// ─── DiscountDetailsPage ──────────────────────────────────────────────────────
//
//  Full detail view of one discount campaign.
//  Shows date range, status, approval info + service rows with stop buttons.
//  Approve / Stop actions available inline.

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiArrowLeft, HiCheck, HiBan, HiCalendar, HiOfficeBuilding } from 'react-icons/hi'
import { Button, ConfirmModal } from '@/components/shared'
import {
  useGetDiscountQuery,
  useApproveDiscountMutation,
  useStopDiscountMutation,
} from '../services/salonServiceDiscountApi'
import DiscountDetailsPanel from '../components/DiscountDetailsPanel'
import { getApiError } from '@/services/apiHelpers'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function DiscountDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const discountId = Number(id)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: discount, isLoading, isError } = useGetDiscountQuery(discountId)
  const [approveDiscount, { isLoading: isApproving }] = useApproveDiscountMutation()
  const [stopDiscount, { isLoading: isStopping }] = useStopDiscountMutation()

  const [approveModal, setApproveModal] = useState(false)
  const [stopModal, setStopModal] = useState(false)

  const handleApprove = async () => {
    try {
      await approveDiscount(discountId).unwrap()
      toast.success('Discount approved')
    } catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            } finally {
      setApproveModal(false)
    }
  }

  const handleStop = async () => {
    try {
      await stopDiscount(discountId).unwrap()
      toast.success('Discount stopped')
    } catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        } finally {
      setStopModal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !discount) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-[var(--danger)]">Failed to load discount.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const statusColor = discount.isStoped
    ? 'bg-red-50 text-[var(--danger)]'
    : discount.isApproved
    ? 'bg-green-100 text-green-700'
    : 'bg-[var(--accent-soft)] text-[var(--accent)]'

  const statusLabel = discount.isStoped ? 'Stopped' : discount.isApproved ? 'Approved' : 'Pending'

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center
            text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <HiArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              Discount #{discount.id}
            </h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {formatDate(discount.dateFrom)} → {formatDate(discount.toDate)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!discount.isApproved && !discount.isStoped && (
            <Button
              variant="secondary"
              onClick={() => setApproveModal(true)}
              leftIcon={<HiCheck size={14} />}
            >
              Approve
            </Button>
          )}
          {!discount.isStoped && (
            <Button
              variant="danger"
              onClick={() => setStopModal(true)}
              leftIcon={<HiBan size={14} />}
            >
              Stop All
            </Button>
          )}
        </div>
      </div>

      {/* ── Info cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        <div className="flex items-center gap-2.5 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <HiCalendar size={13} className="text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-muted)]">From</p>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{formatDate(discount.dateFrom)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <HiCalendar size={13} className="text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-muted)]">To</p>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{formatDate(discount.toDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <HiOfficeBuilding size={13} className="text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-muted)]">Created By</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {discount.createdBySalon ? 'Salon' : 'Admin'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <HiCheck size={13} className="text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-muted)]">Services</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">{discount.details.length}</p>
          </div>
        </div>
      </div>

      {/* Approved by */}
      {discount.isApproved && discount.approvedBy && (
        <div className="px-4 py-3 rounded-[var(--radius)] bg-green-50 border border-green-200 text-sm text-green-700">
          Approved by <span className="font-medium">{discount.approvedBy}</span>
        </div>
      )}

      {/* ── Services ────────────────────────────────────────────────────── */}
      <div>
        <div className="border-b border-[var(--border)] pb-1 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Services ({discount.details.length})
          </span>
        </div>
        <DiscountDetailsPanel
          discountId={discountId}
          details={discount.details}
          isDiscountStopped={discount.isStoped}
        />
      </div>

      {/* ── Confirm modals ───────────────────────────────────────────────── */}
      <ConfirmModal
        open={approveModal}
        onClose={() => setApproveModal(false)}
        onConfirm={handleApprove}
        loading={isApproving}
        title="Approve Discount"
        message="Approve this discount campaign? It will become active for customers."
      />

      <ConfirmModal
        open={stopModal}
        onClose={() => setStopModal(false)}
        onConfirm={handleStop}
        loading={isStopping}
        title="Stop All Discounts"
        message="Stop this entire campaign? All service discounts will be deactivated."
        variant="stop"
      />
    </div>
  )
}
