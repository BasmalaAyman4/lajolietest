import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiBan, HiPlay } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { AffiliateListItem } from '../types'
import { useGetAdminAffiliatesQuery, useStopAdminAffiliateMutation } from '../services/affiliateApi'
import AffiliateFormModal from '../components/AffiliateFormModal'

const pad = (n: number) => String(n).padStart(2, '0')

/** "HH:mm:ss" → "hh:mm AM/PM" for display */
const formatTimeDisplay = (str: string | undefined): string => {
  if (!str) return ''
  const [hStr, mStr] = str.split(':')
  const h = Number(hStr)
  const period = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${pad(h12)}:${mStr} ${period}`
}

export default function AffiliatePage() {
  const { t } = useTranslation()

  const { data: affiliates = [], isLoading, isError } = useGetAdminAffiliatesQuery()
  const [stopAffiliate, { isLoading: isStopping }] = useStopAdminAffiliateMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; affiliate?: AffiliateListItem }>({ open: false })
  const [stopModal, setStopModal] = useState<{ open: boolean; item: AffiliateListItem | null }>({ open: false, item: null })

  const openAdd = () => setFormModal({ open: true })
  const openEdit = (affiliate: AffiliateListItem) => setFormModal({ open: true, affiliate })
  const closeForm = () => setFormModal({ open: false })

  const confirmToggle = (item: AffiliateListItem) => setStopModal({ open: true, item })

  const handleToggle = async () => {
    if (!stopModal.item) return
    try {
      await stopAffiliate(stopModal.item.id).unwrap()
      toast.success(t('common.success'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setStopModal({ open: false, item: null })
    }
  }

  const columns: Column<AffiliateListItem>[] = [
    {
      key: 'productName',
      label: t('affiliate.item', 'Item'),
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-[var(--text-primary)]">{row.productName}</span>
          {(row.sizeName || row.colorName) && (
            <span className="text-xs text-[var(--text-muted)]">{row.sizeName} {row.colorName && `/ ${row.colorName}`}</span>
          )}
        </div>
      ),
    },
    {
      key: 'sellerName',
      label: t('affiliate.seller', 'Seller'),
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">{row.sellerName}</span>
      ),
    },
    {
      key: 'dateFrom',
      label: t('discount.validity', 'Validity Period'),
      render: (row) => (
        <div className="flex flex-col gap-0.5 text-xs">
          <span>
            <span className="text-[var(--text-muted)] mr-1">{t('common.from', 'From:')} </span>
            {row.dateFrom}
          </span>
          <span>
            <span className="text-[var(--text-muted)] mr-1">{t('common.to', 'To:')} </span>
            {row.dateTo}
          </span>
        </div>
      ),
    },
    {
      key: 'timeFrom',
      label: t('affiliate.time', 'Time'),
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {formatTimeDisplay(row.timeFrom)} — {formatTimeDisplay(row.timeTo)}
        </span>
      ),
    },
    {
      key: 'commission',
      label: t('affiliate.commission', 'Commission'),
      render: (row) => (
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[var(--bg-hover)] border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)]">
          {row.commission}%
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

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">{t('affiliate.loadError', 'Failed to load affiliates.')}</p>
      </div>
    )
  }

  const toggleItem = stopModal.item
  const toggleTitle = toggleItem?.isStoped
    ? t('discount.activateTitle', 'Activate Affiliate')
    : t('discount.stopTitle', 'Stop Affiliate')
  const toggleMessage = toggleItem?.isStoped
    ? t('affiliate.activateMsg', 'Are you sure you want to re-activate this affiliate offer?')
    : t('affiliate.stopMsg', 'Are you sure you want to stop this affiliate offer? It will no longer apply.')

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('affiliate.pageTitle', 'Affiliates')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('affiliate.pageSubtitle', 'Manage seller affiliate commissions per product')}
          </p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          {t('affiliate.addAffiliate', 'Add Affiliate')}
        </Button>
      </div>

      {/* Table */}
      <DataTable<AffiliateListItem>
        columns={columns}
        data={affiliates}
        rowKey="id"
        tableKey="adminAffiliates"
        loading={isLoading}
        searchKeys={['productName', 'sellerName']}
        searchPlaceholder={t('affiliate.searchPlaceholder', 'Search by product or seller...')}
        emptyMessage={t('affiliate.empty', 'No affiliates found. Create your first one!')}
      />

      {/* Form modal */}
      <AffiliateFormModal
        open={formModal.open}
        onClose={closeForm}
        affiliate={formModal.affiliate}
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