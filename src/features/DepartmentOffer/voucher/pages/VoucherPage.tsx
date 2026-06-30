import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiBan, HiPlay } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { Voucher, VoucherListItem } from '../types'
import { useGetVouchersQuery, useDeleteVoucherMutation, useStopVoucherMutation } from '../services/voucherApi'
import VoucherFormModal from '../components/VoucherFormModal'

export default function VoucherPage() {
  const { t } = useTranslation()

  // ── RTK Query Data ──────────────────────────────────────────────────────────
  const { data: vouchers = [], isLoading, isError } = useGetVouchersQuery()
  const [deleteVoucher, { isLoading: isDeleting }] = useDeleteVoucherMutation()
  const [stopVoucher, { isLoading: isStopping }] = useStopVoucherMutation()

  // ── Modals State ────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; voucher?: VoucherListItem }>({
    open: false,
  })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })
  const [stopModal, setStopModal] = useState<{ open: boolean; id: number | null, isStoped: boolean }>({
    open: false,
    id: null,
    isStoped: false,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (voucher: VoucherListItem) => setFormModal({ open: true, voucher })
  const closeForm = () => setFormModal({ open: false })

  const confirmDelete = (id: number) => setDeleteModal({ open: true, id })
  const confirmStop = (id: number, isStoped: boolean) => setStopModal({ open: true, id, isStoped })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteVoucher(deleteModal.id).unwrap()
      toast.success(t('Voucher deleted successfully'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const handleStop = async () => {
    if (!stopModal.id) return
    try {
      await stopVoucher(stopModal.id).unwrap()
      toast.success(t(stopModal.isStoped ? 'Voucher activated successfully' : 'Voucher stopped successfully'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setStopModal({ open: false, id: null, isStoped: false })
    }
  }

  // ── Columns Definition ──────────────────────────────────────────────────────
  const columns: Column<VoucherListItem>[] = [
    {
      key: 'vcode',
      label: t('voucher.code', 'Voucher Code'),
      render: (row) => (
        <span className="font-mono bg-[var(--bg-hover)] border border-[var(--border)] px-2 py-0.5 rounded text-sm text-[var(--accent)] font-semibold">
          {row.vcode}
        </span>
      ),
    },
    {
      key: 'vvalue',
      label: t('voucher.value', 'Discount Value'),
      render: (row) => (
        <span className="font-semibold text-sm">
          {row.vvalue}
          {row.isPercentage ? '%' : ' EGP'}
        </span>
      ),
    },
    {
      key: 'minimumEligibleAmount',
      label: t('voucher.minSpend', 'Min Spend'),
      render: (row) => <span>{row.minimumEligibleAmount ? `${row.minimumEligibleAmount} EGP` : '—'}</span>,
    },
    {
      key: 'maxDiscountAmount',
      label: t('voucher.maxDiscount', 'Max Discount'),
      render: (row) => <span>{row.maxDiscountAmount ? `${row.maxDiscountAmount} EGP` : '—'}</span>,
    },
    {
      key: 'fromDate',
      label: t('voucher.validity', 'Validity Period'),
      render: (row) => {
        const from = row.fromDate ? row.fromDate.split('T')[0] : ''
        const to = row.toDate ? row.toDate.split('T')[0] : ''
        return (
          <div className="flex flex-col gap-0.5 text-xs">
            <span>
              <span className="text-[var(--text-muted)] mr-1">From:</span>
              {from}
            </span>
            <span>
              <span className="text-[var(--text-muted)] mr-1">To:</span>
              {to}
            </span>
          </div>
        )
      },
    },
    {
      key: 'maxTotalUses',
      label: t('voucher.usage', 'Usage Limits'),
      render: (row) => (
        <div className="flex flex-col gap-0.5 text-xs text-[var(--text-secondary)]">
          <span>Total: {row.maxTotalUses || 'Unlimited'}</span>
          <span>Per User: {row.maxUsesPerUser || 'Unlimited'}</span>
        </div>
      ),
    },
    {
      key: 'paymentModes',
      label: t('voucher.payments', 'Payment Modes'),
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.forCash && <StatusBadge variant="info" label="Cash" />}
          {row.forVisa && <StatusBadge variant="success" label="Visa" />}
        </div>
      ),
    },
    {
      key: 'isStoped',
      label: t('voucher.status', 'Status'),
      render: (row) => (
        <StatusBadge
          variant={row.isStoped ? 'danger' : 'success'}
          label={row.isStoped ? 'Stopped' : 'Active'}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '120px',
    render: (row) => (
  <div className="flex items-center justify-end gap-1">
    <button
      type="button"
      title={t('common.edit', 'Edit')}
      onClick={() => openEdit(row)}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
    >
      <HiPencil size={15} />
    </button>

    <button
      type="button"
      title={row.isStoped ? t('voucher.activate', 'Activate') : t('voucher.stop', 'Stop')}
      onClick={() => confirmStop(row.id, row.isStoped)}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        row.isStoped
          ? 'text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-green-50'
          : 'text-[var(--text-muted)] hover:text-[var(--warning)] hover:bg-yellow-50'
      }`}
    >
      {row.isStoped ? <HiPlay size={15} /> : <HiBan size={15} />}
    </button>
  </div>
),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load vouchers.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Voucher Details</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage and configure promotional vouchers</p>
        </div>

        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          Add Voucher
        </Button>
      </div>

      {/* DataTable */}
      <DataTable<VoucherListItem>
        columns={columns}
        data={vouchers}
        rowKey="id"
        tableKey="vouchers"
        loading={isLoading}
        searchKeys={['vcode', 'description']}
        searchPlaceholder={t('voucher.searchPlaceholder', 'Search by voucher code or description...')}
        emptyMessage={t('voucher.empty', 'No vouchers found. Create your first voucher!')}
      />

      {/* Form Modal */}
      <VoucherFormModal
        open={formModal.open}
        onClose={closeForm}
        voucher={formModal.voucher}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('Delete Voucher')}
        message={t('Are you sure you want to delete this voucher? This action cannot be undone.')}
      />

      {/* Stop Confirmation Modal */}
     <ConfirmModal
        variant={stopModal.isStoped ?"active" : "stop" }
        open={stopModal.open}
        onClose={() => setStopModal({ open: false, id: null, isStoped: false })}
        onConfirm={handleStop}
        loading={isStopping}
        title={t(stopModal.isStoped ? 'voucher.stop' : 'voucher.activate', 'Toggle Voucher Status')}
        message={t(stopModal.isStoped ? 'voucher.stopMsg' : 'voucher.activateMsg', 'Are you sure you want to change this voucher\'s status?')}
/>
    </div>
  )
}
