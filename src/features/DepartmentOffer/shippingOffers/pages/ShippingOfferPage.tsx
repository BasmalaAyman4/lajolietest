import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiBan, HiPlay } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { ShippingOffer } from '../types'
import { useGetShippingOffersQuery, useStopShippingOfferMutation } from '../services/shippingOfferApi'
import ShippingOfferFormModal from '../components/ShippingOfferFormModal'

export default function ShippingOfferPage() {
  const { t } = useTranslation()

  // ── Pagination State ───────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  // ── API Queries/Mutations ──────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetShippingOffersQuery({
    pageNo: page,
    pageSize: limit,
  })
  const [stopShippingOffer, { isLoading: isStopping }] = useStopShippingOfferMutation()

  // ── Local State ────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; offer?: ShippingOffer }>({ open: false })
  const [stopModal, setStopModal] = useState<{ open: boolean; item: ShippingOffer | null }>({ open: false, item: null })

  // Derived variables for pagination
  const offers = data?.shippingOffers ?? []
  const lastPageNo = data?.lastPageNo ?? 1
  const total = lastPageNo * limit

  // -- Modal Action Handlers
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (offer: ShippingOffer) => setFormModal({ open: true, offer })
  const closeForm = () => setFormModal({ open: false })

  const confirmToggle = (item: ShippingOffer) => setStopModal({ open: true, item })

  const handleToggle = async () => {
    if (!stopModal.item) return
    try {
      await stopShippingOffer(stopModal.item.id).unwrap()
      toast.success(t('common.success', 'Status updated successfully'))
    } catch {
      toast.error(t('common.error', 'Failed to update status'))
    } finally {
      setStopModal({ open: false, item: null })
    }
  }

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns: Column<ShippingOffer>[] = [
    {
      key: 'id',
      label: t('shippingOffer.id', 'ID'),
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">{row.id}</span>
      ),
    },
    {
      key: 'orderValue',
      label: t('shippingOffer.orderValue', 'Minimum Order Value'),
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {row.orderValue}
        </span>
      ),
    },
    {
      key: 'offerValue',
      label: t('shippingOffer.offerValue', 'Shipping Offer Value'),
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {row.offerValue}
        </span>
      ),
    },
    {
      key: 'dateFrom',
      label: t('shippingOffer.validity', 'Validity Period'),
      render: (row) => {
        const from = row.fromDate ? row.fromDate.split('T')[0] : ''
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
      key: 'isStoped',
      label: t('shippingOffer.status', 'Status'),
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
        <p className="text-sm text-[var(--danger)]">{t('shippingOffer.loadError', 'Failed to load shipping offers.')}</p>
      </div>
    )
  }

  // Derive toggle modal message from the current item state
  const toggleItem = stopModal.item
  const toggleTitle = toggleItem?.isStoped
    ? t('shippingOffer.activateTitle', 'Activate Shipping Offer')
    : t('shippingOffer.stopTitle', 'Stop Shipping Offer')
  const toggleMessage = toggleItem?.isStoped
    ? t('shippingOffer.activateMsg', 'Are you sure you want to re-activate this shipping offer?')
    : t('shippingOffer.stopMsg', 'Are you sure you want to stop this shipping offer? It will no longer apply to orders.')

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('shippingOffer.pageTitle', 'Shipping Offers')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('shippingOffer.pageSubtitle', 'Manage minimum spend and shipping rate adjustments')}
          </p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          {t('shippingOffer.addOffer', 'Add Shipping Offer')}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
        <DataTable<ShippingOffer>
          columns={columns}
          data={offers}
          rowKey="id"
          tableKey="shippingOffers"
          loading={isLoading}
          searchKeys={[]} // Local search is disabled/unnecessary as backend API doesn't support query filters for shipping offers
          searchPlaceholder={t('shippingOffer.searchPlaceholder', 'Search...')}
          emptyMessage={t('shippingOffer.empty', 'No shipping offers found. Create your first shipping offer!')}
          // server-side pagination props
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Form modal */}
      <ShippingOfferFormModal
        open={formModal.open}
        onClose={closeForm}
        offer={formModal.offer}
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
