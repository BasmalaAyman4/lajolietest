import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiBan, HiPlay } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { SellerListItem } from '../types'
import { useGetAdminSellerListQuery, useStopAdminSellerMutation } from '../services/sellerApi'
import SellerFormModal from '../components/SellerFormModal'

export default function SellerPage() {
  const { t } = useTranslation()

  const { data: sellers = [], isLoading, isError } = useGetAdminSellerListQuery()
  const [stopSeller, { isLoading: isStopping }] = useStopAdminSellerMutation()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [stopModal, setStopModal] = useState<{ open: boolean; item: SellerListItem | null }>({ open: false, item: null })

  const confirmToggle = (item: SellerListItem) => setStopModal({ open: true, item })

  const handleToggle = async () => {
    if (!stopModal.item) return
    try {
      await stopSeller(stopModal.item.sellerId).unwrap()
      toast.success(t('common.success'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setStopModal({ open: false, item: null })
    }
  }

  const columns: Column<SellerListItem>[] = [
    {
      key: 'firstName',
      label: t('seller.name', 'Name'),
      render: (row) => (
        <span className="font-medium text-sm text-[var(--text-primary)]">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: 'mobile',
      label: t('seller.mobile', 'Mobile'),
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">{row.mobile}</span>
      ),
    },
    {
      key: 'isStop',
      label: t('discount.status', 'Status'),
      render: (row) => (
        <StatusBadge
          variant={row.isStop ? 'danger' : 'success'}
          label={row.isStop ? t('common.stopped', 'Stopped') : t('common.active', 'Active')}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '60px',
      render: (row) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            title={row.isStop ? t('common.activate', 'Activate') : t('common.stop', 'Stop')}
            onClick={() => confirmToggle(row)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${row.isStop
                ? 'text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-green-50'
                : 'text-[var(--text-muted)] hover:text-[var(--warning)] hover:bg-yellow-50'
              }`}
          >
            {row.isStop ? <HiPlay size={15} /> : <HiBan size={15} />}
          </button>
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">{t('seller.loadError', 'Failed to load sellers.')}</p>
      </div>
    )
  }

  const toggleItem = stopModal.item
  const toggleTitle = toggleItem?.isStop
    ? t('discount.activateTitle', 'Activate Seller')
    : t('discount.stopTitle', 'Stop Seller')
  const toggleMessage = toggleItem?.isStop
    ? t('seller.activateMsg', 'Are you sure you want to re-activate this seller?')
    : t('seller.stopMsg', 'Are you sure you want to stop this seller? They will no longer be able to sell.')

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('seller.pageTitle', 'Sellers')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('seller.pageSubtitle', 'Manage seller accounts')}
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} leftIcon={<HiPlus size={15} />}>
          {t('seller.addSeller', 'Add Seller')}
        </Button>
      </div>

      {/* Table */}
      <DataTable<SellerListItem>
        columns={columns}
        data={sellers}
        rowKey="sellerId"
        tableKey="adminSellers"
        loading={isLoading}
        searchKeys={['firstName', 'lastName', 'mobile']}
        searchPlaceholder={t('seller.searchPlaceholder', 'Search by name or mobile...')}
        emptyMessage={t('seller.empty', 'No sellers found. Add your first one!')}
      />

      {/* Add modal */}
      <SellerFormModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

      {/* Toggle confirm modal */}
      <ConfirmModal
        variant={toggleItem?.isStop ? "active" : "stop"}
        open={stopModal.open}
        onClose={() => setStopModal({ open: false, item: null })}
        onConfirm={handleToggle}
        loading={isStopping}
        title={toggleTitle}
        message={toggleMessage}
      />
    </div>
  )
}