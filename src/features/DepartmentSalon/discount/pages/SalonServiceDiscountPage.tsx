// ─── SalonServiceDiscountPage ─────────────────────────────────────────────────
//
//  Lists all salon service discounts.
//  Add    → DiscountFormModal
//  View   → navigate to DiscountDetailsPage
//  Approve → inline PUT approveDiscount
//  Stop   → inline DELETE stopDiscount

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiEye, HiCheck, HiBan } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { SalonServiceDiscount } from '../types'
import {
  useGetDiscountsQuery,
  useApproveDiscountMutation,
  useStopDiscountMutation,
} from '../services/salonServiceDiscountApi'
import DiscountFormModal from '../components/DiscountFormModal'
import { getApiError } from '@/services/apiHelpers'

// ── Status badge helpers ──────────────────────────────────────────────────────
function DiscountStatusBadge({ row }: { row: SalonServiceDiscount }) {
  if (row.isStoped) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-[var(--danger)]">
        Stopped
      </span>
    )
  }
  if (row.isApproved) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        Approved
      </span>
    )
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
      Pending
    </span>
  )
}

// ── Default salonId — adjust to come from context/route as needed ─────────────
const DEFAULT_SALON_ID = 0

interface SalonServiceDiscountPageProps {
  salonId?: number
}

export default function SalonServiceDiscountPage({ salonId = DEFAULT_SALON_ID }: SalonServiceDiscountPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: discounts = [], isLoading, isError } = useGetDiscountsQuery()
  const [approveDiscount, { isLoading: isApproving }] = useApproveDiscountMutation()
  const [stopDiscount, { isLoading: isStopping }] = useStopDiscountMutation()

  const [formModal, setFormModal] = useState(false)
  const [approveModal, setApproveModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [stopModal, setStopModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleApprove = async () => {
    if (!approveModal.id) return
    try {
      await approveDiscount(approveModal.id).unwrap()
      toast.success('Discount approved')
    }catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            } finally {
      setApproveModal({ open: false, id: null })
    }
  }

  const handleStop = async () => {
    if (!stopModal.id) return
    try {
      await stopDiscount(stopModal.id).unwrap()
      toast.success('Discount stopped')
    } catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            } finally {
      setStopModal({ open: false, id: null })
    }
  }

  const columns: Column<SalonServiceDiscount>[] = [
    {
      key: 'dateFrom',
      label: 'Period',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{row.dateFrom}</p>
          <p className="text-xs text-[var(--text-muted)]">→ {row.toDate}</p>
        </div>
      ),
    },
    {
      key: 'isApproved',
      label: 'Status',
      width: '100px',
      render: (row) => <DiscountStatusBadge row={row} />,
    },
    {
      key: 'createdBySalon',
      label: 'Created By',
      width: '110px',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.createdBySalon ? 'Salon' : 'Admin'}
        </span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved By',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">{row.approvedBy || '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* View details */}
          <button
            type="button"
            title="View details"
            onClick={() => navigate(`/salon-discounts/${row.id}`)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiEye size={15} />
          </button>

          {/* Approve — only if not yet approved and not stopped */}
          {!row.isApproved && !row.isStoped && (
            <button
              type="button"
              title="Approve discount"
              onClick={() => setApproveModal({ open: true, id: row.id })}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                text-[var(--text-muted)] hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <HiCheck size={15} />
            </button>
          )}

          {/* Stop — only if not already stopped */}
          {!row.isStoped && (
            <button
              type="button"
              title="Stop discount"
              onClick={() => setStopModal({ open: true, id: row.id })}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
            >
              <HiBan size={15} />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load discounts.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Service Discounts</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage salon service discount campaigns</p>
        </div>
        <Button onClick={() => setFormModal(true)} leftIcon={<HiPlus size={15} />}>
          New Discount
        </Button>
      </div>

      <DataTable<SalonServiceDiscount>
        columns={columns}
        tableKey="salonServiceDiscounts"
        data={discounts}
        rowKey="id"
        loading={isLoading}
        searchKeys={['dateFrom', 'toDate', 'approvedBy']}
        searchPlaceholder="Search by date or approver…"
        emptyMessage="No discounts found. Create your first campaign!"
      />

      <DiscountFormModal
        open={formModal}
        onClose={() => setFormModal(false)}
        salonId={salonId}
      />

      <ConfirmModal
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, id: null })}
        onConfirm={handleApprove}
        loading={isApproving}
        title="Approve Discount"
        message="Approve this discount campaign? It will become active for customers."
        variant="approve"
      />

      <ConfirmModal
        open={stopModal.open}
        onClose={() => setStopModal({ open: false, id: null })}
        onConfirm={handleStop}
        loading={isStopping}
        title="Stop Discount"
        message="Stop this entire discount campaign? All service discounts will be deactivated."
        variant="stop"
      />
    </div>
  )
}
