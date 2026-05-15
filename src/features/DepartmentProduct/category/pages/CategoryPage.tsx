

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge, type FilterConfig } from '@/components/shared'
import type { CategoryProduct } from '../types'
import {
  useGetCategoryProductsQuery,
  useDeleteCategoryProductMutation,
} from '../services/categoryProductApi'
import CategoryFormModal from '../components/CategoryFormModal'
import CategoryImageModal from '../components/CategoryImageModal'

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const { t } = useTranslation()

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: categories = [], isLoading, isError } = useGetCategoryProductsQuery()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryProductMutation()

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; category?: CategoryProduct }>({
    open: false,
  })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    categoryId: number
    categoryName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (category: CategoryProduct) => setFormModal({ open: true, category:category })
  const closeForm = () => setFormModal({ open: false })

  // After create: auto-open the image upload modal
  const handleCreated = (id: number, name: string) => {
    setImageModal({ open: true, categoryId: id, categoryName: name })
  }

  const openImageModal = (s: CategoryProduct) =>
    setImageModal({ open: true, categoryId: s.id, categoryName: s.nameEn })

  const closeImageModal = () => setImageModal(null)

  const confirmDelete = (id: number) => setDeleteModal({ open: true, id })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteCategory(deleteModal.id).unwrap()
      toast.success(t('specialist.deleteSuccess', 'Specialist deleted'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }



  const columns: Column<CategoryProduct>[] = [
    {
      key: 'imageUrl',
      label: t('category.image', 'Image'),
      width: '56px',
      align: 'center',
      render: (row) => (
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
        )
      ),
    },
    {
      key: 'nameEn',
      label: t('category.nameEn', 'Name (EN)'),
    },
    {
      key: 'nameAr',
      label: t('category.nameAr', 'Name (AR)'),
      render: (row) => <span dir="rtl">{row.nameAr}</span>,
    },
    
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* Upload image */}
          <button
            type="button"
            title={t('specialist.uploadImage', 'Upload Image')}
            onClick={() => openImageModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]
              transition-colors"
          >
            <HiPhotograph size={15} />
          </button>

          {/* Edit */}
          <button
            type="button"
            title={t('common.edit', 'Edit')}
            onClick={() => openEdit(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]
              transition-colors"
          >
            <HiPencil size={15} />
          </button>

          {/* Delete */}
          <button
            type="button"
            title={t('common.delete')}
            onClick={() => confirmDelete(row.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50
              transition-colors"
          >
            <HiTrash size={15} />
          </button>
        </div>
      ),
    },
  ]

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load Categories Products.</p>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
        Categories Products
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
        Manage your Categories Products
        </p>
      </div>

      <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
        {t('category.addCategory', 'Add Category')}
      </Button>
    </div>

    {/* DataTable — search + filter + pagination built-in */}
    <DataTable<CategoryProduct>
      columns={columns}
      data={categories}
      rowKey="id"
      loading={isLoading}
      searchKeys={['nameEn', 'nameAr', 'description']}
      searchPlaceholder={t('category.searchPlaceholder', 'Search by name ...')}
      emptyMessage={t('category.noCategories', 'No Categories found. Add your first one!')}
    />

      {/* Add / Edit modal */}
      <CategoryFormModal
        open={formModal.open}
        onClose={closeForm}
        categoryProduct={formModal.category}
        onCreated={(id) => {
          handleCreated(id, t('category.newCategory', 'New Category'))
        }}
      />

      {/* Image upload modal */}
      {imageModal && (
        <CategoryImageModal
          open={imageModal.open}
          onClose={closeImageModal}
          categoryId={imageModal.categoryId}
          categoryName={imageModal.categoryName}
        />
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('category.deleteTitle', 'Delete Category Product')}
        message={t('category.deleteMessage', 'Are you sure you want to delete this category product? This action cannot be undone.')}
      />
    </div>
  )
}