import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiBan, HiPlay } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { DiscountListItem } from '../types'
import { useGetAdminDiscountsQuery, useStopAdminDiscountMutation } from '../services/adminDiscountApi'
import AdminDiscountFormModal from '../components/AdminDiscountFormModal'

export default function AdminDiscountPage() {
  const { t } = useTranslation()

  const { data: adminDiscounts = [], isLoading, isError } = useGetAdminDiscountsQuery()
  const [stopDiscount, { isLoading: isStopping }] = useStopAdminDiscountMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; discount?: DiscountListItem }>({ open: false })
  const [stopModal, setStopModal] = useState<{ open: boolean; item: DiscountListItem | null }>({ open: false, item: null })

  const openAdd = () => setFormModal({ open: true })
  const openEdit = (discount: DiscountListItem) => setFormModal({ open: true, discount })
  const closeForm = () => setFormModal({ open: false })

  const confirmToggle = (item: DiscountListItem) => setStopModal({ open: true, item })

  const handleToggle = async () => {
    if (!stopModal.item) return
    try {
      await stopDiscount(stopModal.item.id).unwrap()
      toast.success(t('common.success'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setStopModal({ open: false, item: null })
    }
  }

  const columns: Column<DiscountListItem>[] = [
    {
      key: 'discountTypeName',
      label: t('discount.type', 'Discount Type'),
      render: (row) => (
        <span className="font-medium text-sm text-[var(--text-primary)]">{row.discountTypeName}</span>
      ),
    },
    {
      key: 'dateFrom',
      label: t('discount.validity', 'Validity Period'),
      render: (row) => {
        const from = row.dateFrom ? row.dateFrom.split('T')[0] : ''
        const to = row.toDate ? row.toDate.split('T')[0] : ''
        return (
          <div className="flex flex-col gap-0.5 text-xs">
            <span>
              <span className="text-[var(--text-muted)] mr-1">{t('common.from', 'From:')} </span>
              {from}
            </span>
            <span>
              <span className="text-[var(--text-muted)] mr-1">{t('common.to', 'To:')} </span>
              {to}
            </span>
          </div>
        )
      },
    },
    {
      key: 'noOfProducts',
      label: t('discount.noOfProducts', 'No. of Items'),
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-hover)] border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)]">
          {row.noOfProducts}
        </span>
      ),
    },
    {
      key: 'isStoped',
      label: t('discount.status', 'Status'),
      render: (row) => (
        <StatusBadge
          variant={row.isStoped ? 'danger' : 'success'}
          label={row.isStoped ? t('common.stopped', 'Stopped') : t('common.active', 'Active')}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '90px',
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
            title={row.isStoped ? t('common.activate', 'Activate') : t('common.stop', 'Stop')}
            onClick={() => confirmToggle(row)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${row.isStoped
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
  console.log(adminDiscounts)
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">{t('discount.loadError', 'Failed to load discounts.')}</p>
      </div>
    )
  }

  // Derive toggle modal message from the current item state
  const toggleItem = stopModal.item
  const toggleTitle = toggleItem?.isStoped
    ? t('discount.activateTitle', 'Activate Discount')
    : t('discount.stopTitle', 'Stop Discount')
  const toggleMessage = toggleItem?.isStoped
    ? t('discount.activateMsg', 'Are you sure you want to re-activate this discount?')
    : t('discount.stopMsg', 'Are you sure you want to stop this discount? It will no longer apply to orders.')

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('discount.pageTitle', 'Discounts')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('discount.pageSubtitle', 'Manage product, category, and brand discounts')}
          </p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          {t('discount.addDiscount', 'Add Discount')}
        </Button>
      </div>

      {/* Table */}
      <DataTable<DiscountListItem>
        columns={columns}
        data={adminDiscounts}
        rowKey="id"
        tableKey="adminDiscounts"
        loading={isLoading}
        searchKeys={['discountTypeName']}
        searchPlaceholder={t('discount.searchPlaceholder', 'Search by discount type...')}
        emptyMessage={t('discount.empty', 'No discounts found. Create your first discount!')}
      />

      {/* Form modal */}
      <AdminDiscountFormModal
        open={formModal.open}
        onClose={closeForm}
        discount={formModal.discount}
      />

      {/* Toggle confirm modal */}
      <ConfirmModal
        variant={toggleItem?.isStoped ? "active" : "stop"}
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