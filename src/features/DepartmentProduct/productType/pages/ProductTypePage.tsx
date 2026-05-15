// ─── ProductTypePage ──────────────────────────────────────────────────────────
//
//  Lists product types with search + pagination.
//  Add → ProductTypeFormModal (then auto-opens image upload)
//  Edit → ProductTypeFormModal
//  Delete → ConfirmModal

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { ProductType } from '../types'
import {
  useGetProductTypesQuery,
  useDeleteProductTypeMutation,
} from '../services/productTypeApi'
import ProductTypeFormModal from '../components/ProductTypeFormModal'
import ProductTypeImageModal from '../components/ProductTypeImageModal'

export default function ProductTypePage() {
  const { t } = useTranslation()

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: productTypes = [], isLoading, isError } = useGetProductTypesQuery()
  const [deleteProductType, { isLoading: isDeleting }] = useDeleteProductTypeMutation()

  // ── Modal state ───────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; productType?: ProductType }>({
    open: false,
  })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    productTypeId: number
    productTypeName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (pt: ProductType) => setFormModal({ open: true, productType: pt })
  const closeForm = () => setFormModal({ open: false })

  const handleCreated = (id: number) => {
    const name = productTypes.find((pt) => pt.id === id)?.nameEn ?? 'New Product Type'
    setImageModal({ open: true, productTypeId: id, productTypeName: name })
  }

  const openImageModal = (pt: ProductType) =>
    setImageModal({ open: true, productTypeId: pt.id, productTypeName: pt.nameEn })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteProductType(deleteModal.id).unwrap()
      toast.success('Product type deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<ProductType>[] = [
    {
      key: 'imageUrl',
      label: 'Image',
      width: '56px',
      align: 'center',
      render: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.nameEn}
            className="w-9 h-9 rounded-full object-cover border border-[var(--border)] mx-auto"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mx-auto">
            <HiPhotograph size={16} className="text-[var(--text-muted)]" />
          </div>
        ),
    },
    {
      key: 'nameEn',
      label: 'Name (EN)',
    },
    {
      key: 'nameAr',
      label: 'Name (AR)',
      render: (row) => <span dir="rtl">{row.nameAr}</span>,
    },
    {
      key: 'codeKey',
      label: 'Code Key',
      render: (row) => (
        <span className="font-mono text-xs bg-[var(--bg-hover)] px-2 py-0.5 rounded">
          {row.codeKey}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Sort',
      align: 'center',
      width: '60px',
      render: (row) => <span className="text-sm text-[var(--text-muted)]">{row.sortOrder}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '80px',
      render: (row) => <StatusBadge active={row.isActive} />,
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
            onClick={() => openImageModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPhotograph size={15} />
          </button>
          <button
            type="button"
            title={t('common.edit', 'Edit')}
            onClick={() => openEdit(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPencil size={15} />
          </button>
          <button
            type="button"
            title={t('common.delete')}
            onClick={() => setDeleteModal({ open: true, id: row.id })}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
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
        <p className="text-sm text-[var(--danger)]">Failed to load product types.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Product Types</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your product types</p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          Add Product Type
        </Button>
      </div>

      {/* Table */}
      <DataTable<ProductType>
        columns={columns}
        data={productTypes}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'codeKey']}
        searchPlaceholder="Search by name or code key…"
        emptyMessage="No product types found. Add your first one!"
      />

      {/* Add / Edit modal */}
      <ProductTypeFormModal
        open={formModal.open}
        onClose={closeForm}
        productType={formModal.productType}
        onCreated={handleCreated}
      />

      {/* Image upload modal */}
      {imageModal && (
        <ProductTypeImageModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          productTypeId={imageModal.productTypeId}
          productTypeName={imageModal.productTypeName}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Product Type"
        message="Are you sure you want to delete this product type? This action cannot be undone."
      />
    </div>
  )
}
