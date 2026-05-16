// ─── BrandPage ────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Brand } from '../types'
import { useGetBrandsQuery, useDeleteBrandMutation } from '../services/brandApi'
import BrandFormModal from '../components/BrandFormModal'
import BrandImageModal from '../components/BrandImageModal'

export default function BrandPage() {
  const { t } = useTranslation()

  const { data: brands = [], isLoading, isError } = useGetBrandsQuery()
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; brand?: Brand }>({ open: false })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    brandId: number
    brandName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  const handleCreated = (id: number) => {
    const name = brands.find((b) => b.id === id)?.nameEn ?? 'New Brand'
    setImageModal({ open: true, brandId: id, brandName: name })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteBrand(deleteModal.id).unwrap()
      toast.success('Brand deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<Brand>[] = [
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
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="text-sm text-[var(--text-muted)] truncate max-w-xs block">
          {row.description || '—'}
        </span>
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
            title="Upload Image"
            onClick={() => setImageModal({ open: true, brandId: row.id, brandName: row.nameEn })}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPhotograph size={15} />
          </button>
          <button
            type="button"
            title="Edit"
            onClick={() => setFormModal({ open: true, brand: row })}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPencil size={15} />
          </button>
          <button
            type="button"
            title="Delete"
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
        <p className="text-sm text-[var(--danger)]">Failed to load brands.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Brands</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your brands</p>
        </div>
        <Button
          onClick={() => setFormModal({ open: true })}
          leftIcon={<HiPlus size={15} />}
        >
          Add Brand
        </Button>
      </div>

      <DataTable<Brand>
        columns={columns}
        data={brands}
        tableKey="brand"
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'description']}
        searchPlaceholder="Search by name or description…"
        emptyMessage="No brands found. Add your first one!"
      />

      <BrandFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        brand={formModal.brand}
        onCreated={handleCreated}
      />

      {imageModal && (
        <BrandImageModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          brandId={imageModal.brandId}
          brandName={imageModal.brandName}
        />
      )}

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
      />
    </div>
  )
}
