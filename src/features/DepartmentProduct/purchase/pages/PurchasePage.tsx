// ─── PurchasePage ─────────────────────────────────────────────────────────────
//
//  Lists all purchases (product + packaging together).
//  Two "Add" actions:
//    • "Add Product Purchase"   → ProductPurchaseModal
//    • "Add Packaging Purchase" → PackagingPurchaseModal
//  Row click → navigate to PurchaseDetailsPage

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HiPlus, HiEye, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Purchase } from '../types'
import { useGetPurchasesQuery, useDeletePurchaseMutation } from '../services/purchaseApi'
import ProductPurchaseModal from '../components/ProductPurchaseModal'
import PackagingPurchaseModal from '../components/PackagingPurchaseModal'
import { toast } from 'sonner'

export default function PurchasePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: purchases = [], isLoading, isError, refetch } = useGetPurchasesQuery()
  const [deletePurchase, { isLoading: isDeleting }] = useDeletePurchaseMutation()

  const [productModal, setProductModal] = useState(false)
  const [packagingModal, setPackagingModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleCreated = () => {

  }
  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deletePurchase(deleteModal.id).unwrap()
      toast.success('Purchase deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<Purchase>[] = [
    {
      key: 'purchaseDate',
      label: 'Date',
      width: '110px',
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">{row.purchaseDate}</span>
      ),
    },
    {
      key: 'vendorName',
      label: 'Vendor',
      render: (row) => (
        <div>
          <p className="text-sm text-[var(--text-primary)]">{row.vendorName}</p>
        </div>
      ),
    },
    {
      key: 'storeName',
      label: 'Store / Branch',
      render: (row) => (
        <div>
          <p className="text-sm text-[var(--text-primary)]">{row.storeName}</p>
          <p className="text-xs text-[var(--text-muted)]">{row.branchName}</p>
        </div>
      ),
    },
    {
      key: 'qty',
      label: 'Qty',
      align: 'center',
      width: '72px',
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.qty.toLocaleString()}</span>,
    },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      width: '110px',
      render: (row) => (
        <span className="text-sm font-semibold text-[var(--accent)]">{row.total.toLocaleString()}</span>
      ),
    },
    {
      key: 'note',
      label: 'Note',
      render: (row) => (
        <span className="text-sm text-[var(--text-muted)] truncate max-w-[180px] block">
          {row.note || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '56px',
      render: (row) => (
                <div className="flex items-center justify-end gap-1">

        <button
          type="button"
          title="View details"
          onClick={() => navigate(`/purchases/${row.id}`)}
          className="w-8 h-8 rounded-lg flex items-center justify-center
            text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
        >
          <HiEye size={15} />
        </button>
        <button
                    type="button"
                    title="Delete"
                    onClick={() => setDeleteModal({ open: true, id: row.id })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
                  >
                    <HiTrash size={15} />
                  </button>
                    </div>

      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load purchases.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Purchases</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">All product and packaging purchase orders</p>
        </div>
        <div className="flex items-center gap-2">
     {/*      <Button
            variant="secondary"
            onClick={() => setPackagingModal(true)}
            leftIcon={<HiPlus size={15} />}
          >
            Packaging Purchase
          </Button> */}
          <Button
            onClick={() => setProductModal(true)}
            leftIcon={<HiPlus size={15} />}
          >
            Product Purchase
          </Button>
        </div>
      </div>

      <DataTable<Purchase>
        columns={columns}
        data={purchases}
        rowKey="id"
        loading={isLoading}
        searchKeys={['vendorName', 'storeName', 'branchName', 'note']}
        searchPlaceholder="Search by vendor, store, branch or note…"
        emptyMessage="No purchases found. Create your first purchase order!"
      />

      <ProductPurchaseModal
        open={productModal}
        onClose={() => setProductModal(false)}
        onCreated={handleCreated}
      />

      <PackagingPurchaseModal
        open={packagingModal}
        onClose={() => setPackagingModal(false)}
        onCreated={handleCreated}
      />
  <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This action cannot be undone."
      />
    </div>
  )
}
