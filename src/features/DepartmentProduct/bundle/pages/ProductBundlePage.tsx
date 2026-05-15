// ─── ProductBundlePage ────────────────────────────────────────────────────────
//
//  List of all bundles with search.
//  Add  → BundleFormModal (create) → then auto-opens image upload
//  Edit → navigates to BundleDetailsPage (details + edit form)
//  Delete → ConfirmModal

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { ProductBundle } from '../types'
import {
  useGetProductBundlesQuery,
  useDeleteProductBundleMutation,
} from '../services/productBundleApi'
import BundleFormModal from '../components/BundleFormModal'
import BundleImageModal from '../components/BundleImageModal'

export default function ProductBundlePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: bundles = [], isLoading, isError } = useGetProductBundlesQuery()
  const [deleteBundle, { isLoading: isDeleting }] = useDeleteProductBundleMutation()

  const [formModal, setFormModal] = useState(false)
  const [imageModal, setImageModal] = useState<{ open: boolean; bundleId: number; bundleName: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  // After create → open image upload, then navigate to detail
  const handleCreated = (id: number) => {
    const name = bundles.find((b) => b.id === id)?.nameEn ?? 'New Bundle'
    setImageModal({ open: true, bundleId: id, bundleName: name })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteBundle(deleteModal.id).unwrap()
      toast.success('Bundle deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<ProductBundle>[] = [
    {
      key: 'imageUrl',
      label: 'Image',
      width: '56px',
      align: 'center',
      render: (row) =>
        row.imageUrl ? (
          <img src={row.imageUrl} alt={row.nameEn} className="w-9 h-9 rounded-full object-cover border border-[var(--border)] mx-auto" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mx-auto">
            <HiPhotograph size={16} className="text-[var(--text-muted)]" />
          </div>
        ),
    },
    {
      key: 'nameEn',
      label: 'Name',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{row.nameEn}</p>
          <p className="text-xs text-[var(--text-muted)]" dir="rtl">{row.nameAr}</p>
        </div>
      ),
    },
    {
      key: 'bundlePrice',
      label: 'Bundle Price',
      align: 'center',
      render: (row) => (
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--accent)]">{row.bundlePrice.toFixed(2)}</p>
          <p className="text-xs text-[var(--text-muted)] line-through">{row.priceBefore.toFixed(2)}</p>
        </div>
      ),
    },
    {
      key: 'qty',
      label: 'Qty',
      align: 'center',
      width: '64px',
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.qty}</span>,
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
            title="Upload Image"
            onClick={() => setImageModal({ open: true, bundleId: row.id, bundleName: row.nameEn })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPhotograph size={15} />
          </button>
          <button
            type="button"
            title="Edit"
            onClick={() => navigate(`/product-bundles/${row.id}`)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPencil size={15} />
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

  if (isError) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-[var(--danger)]">Failed to load bundles.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Product Bundles</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your product bundles</p>
        </div>
        <Button onClick={() => setFormModal(true)} leftIcon={<HiPlus size={15} />}>
          Add Bundle
        </Button>
      </div>

      <DataTable<ProductBundle>
        columns={columns}
        data={bundles}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr']}
        searchPlaceholder="Search by name…"
        emptyMessage="No bundles found. Create your first bundle!"
      />

      <BundleFormModal
        open={formModal}
        onClose={() => setFormModal(false)}
        onCreated={handleCreated}
      />

      {imageModal && (
        <BundleImageModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          bundleId={imageModal.bundleId}
          bundleName={imageModal.bundleName}
        />
      )}

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Bundle"
        message="Are you sure you want to delete this bundle? This action cannot be undone."
      />
    </div>
  )
}
