// ─── GoalPage ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { ProductTypeDetail } from '../types'
import { useGetProductTypeDetailsQuery, useDeleteProductTypeDetailMutation, useGetProductTypeDropdownQuery } from '../services/productTypeDetailApi'
import ProductTypeDetailFormModal from '../components/ProductTypeDetailFormModal'
import ProductTypeDetailImageModal from '../components/ProductTypeDetailImageModal'

export default function ProductTypeDetailPage() {
  const { t } = useTranslation()

  const { data: productTypeDetails = [], isLoading, isError } = useGetProductTypeDetailsQuery()
  const { data: productTypes = [] } = useGetProductTypeDropdownQuery()
  const [deleteProductTypeDetail, { isLoading: isDeleting }] = useDeleteProductTypeDetailMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; productTypeDetail?: ProductTypeDetail }>({ open: false })
  const [imageModal, setImageModal] = useState<{ open: boolean; ProductTypeDetailId: number; ProductTypeDetailName: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  // Lookup helper: productTypesId → name
  const bcName = (id: number) => productTypes.find((bc) => bc.id === id)?.name ?? '—'

  const handleCreated = (id: number) => {
    const name = productTypeDetails.find((c) => c.id === id)?.nameEn ?? 'New Product Type Detail'
    setImageModal({ open: true, ProductTypeDetailId: id, ProductTypeDetailName: name })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteProductTypeDetail(deleteModal.id).unwrap()
      toast.success('Product Type Detail deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<ProductTypeDetail>[] = [
    {
      key: 'imageUrl', label: 'Image', width: '56px', align: 'center',
      render: (row) =>
        row.imageUrl ? (
          <img src={row.imageUrl} alt={row.nameEn} className="w-9 h-9 rounded-full object-cover border border-[var(--border)] mx-auto" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mx-auto">
            <HiPhotograph size={16} className="text-[var(--text-muted)]" />
          </div>
        ),
    },
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
    {
      key: 'codeKey', label: 'Code Key',
      render: (row) => <span className="font-mono text-xs bg-[var(--bg-hover)] px-2 py-0.5 rounded">{row.codeKey}</span>,
    },
    {
      key: 'productTypeId', label: 'Product Type',
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{bcName(row.productTypeId)}</span>,
    },
    {
      key: 'sortOrder', label: 'Sort', align: 'center', width: '60px',
      render: (row) => <span className="text-sm text-[var(--text-muted)]">{row.sortOrder}</span>,
    },
    {
      key: 'isActive', label: 'Status', width: '80px',
      render: (row) => <StatusBadge active={row.isActive} />,
    },
    {
      key: 'actions', label: '', align: 'right', width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" title="Upload Image" onClick={() => setImageModal({ open: true, ProductTypeDetailId: row.id, ProductTypeDetailName: row.nameEn })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors">
            <HiPhotograph size={15} />
          </button>
          <button type="button" title="Edit" onClick={() => setFormModal({ open: true, productTypeDetail: row })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors">
            <HiPencil size={15} />
          </button>
          <button type="button" title="Delete" onClick={() => setDeleteModal({ open: true, id: row.id })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors">
            <HiTrash size={15} />
          </button>
        </div>
      ),
    },
  ]

  if (isError) return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load goals.</p></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Product Type Details</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your Product Type Details</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>Add Product Type Detail</Button>
      </div>

      <DataTable<ProductTypeDetail> columns={columns} data={productTypeDetails} rowKey="id" loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'codeKey']} searchPlaceholder="Search by name or code key…" emptyMessage="No Product Type Details found." />

      <ProductTypeDetailFormModal open={formModal.open} onClose={() => setFormModal({ open: false })} productTypeDetail={formModal.productTypeDetail} onCreated={handleCreated} />

      {imageModal && (
        <ProductTypeDetailImageModal open={imageModal.open} onClose={() => setImageModal(null)} ProductTypeDetailId={imageModal.ProductTypeDetailId} ProductTypeDetailName={imageModal.ProductTypeDetailName} />
      )}

      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} loading={isDeleting} title="Delete Product Type Detail" message="Are you sure you want to delete this Product Type Detail?" />
    </div>
  )
}