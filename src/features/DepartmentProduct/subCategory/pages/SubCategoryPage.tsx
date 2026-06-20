// ─── Salon Specialist Page ────────────────────────────────────────────────────
//
//  Lists all specialists in a table.
//  Add / Edit → SpecialistFormModal
//  Upload image → SpecialistImageModal (auto-opens after create, or via icon)
//  Delete → ConfirmModal

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge, type FilterConfig } from '@/components/shared'
import type { SubCategory } from '../types'
import {
  useGetSubCategoryQuery,
  useDeleteSubCategoryMutation,
  useGetCategoryDropdownQuery,
} from '../services/subCategoryApi'
import SubCategoryFormModal from '../components/SubCategoryFormModal'
import SubCategoryImageModal from '../components/SubCategoryImageModal'
import { getApiError } from '@/services/apiHelpers'

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SubCategoryPage() {
  const { t } = useTranslation()

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: subCategories = [], isLoading, isError } = useGetSubCategoryQuery()
  const { data: categories = [] } = useGetCategoryDropdownQuery()
  const [deleteSubCategory, { isLoading: isDeleting }] = useDeleteSubCategoryMutation()

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; subCategory?: SubCategory }>({
    open: false,
  })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    subCategoryId: number
    subCategoryName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (subCategory: SubCategory) => setFormModal({ open: true, subCategory })
  const closeForm = () => setFormModal({ open: false })

  // After create: auto-open the image upload modal
  const handleCreated = (id: number, name: string) => {
    setImageModal({ open: true, subCategoryId: id, subCategoryName: name })
  }

  const openImageModal = (s: SubCategory) =>
    setImageModal({ open: true, subCategoryId: s.id, subCategoryName: s.nameEn })

  const closeImageModal = () => setImageModal(null)

  const confirmDelete = (id: number) => setDeleteModal({ open: true, id })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteSubCategory(deleteModal.id).unwrap()
      toast.success(t('specialist.deleteSuccess', 'Specialist deleted'))
    }catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
  // jobName comes directly from the API — no client-side lookup needed

  // Build filter options from jobs data
  const categoryFilterOptions = categories.map((j) => ({ label: j.name, value: j.name }))

  const tableFilters: FilterConfig[] = [
    { key: 'categoryName', label: t('category.name', 'Category Name'), options: categoryFilterOptions },

  ]

  const columns: Column<SubCategory>[] = [
    {
      key: 'imageUrl',
      label: t('specialist.image', 'Image'),
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
      label: t('specialist.nameEn', 'Name (EN)'),
    },
    {
      key: 'nameAr',
      label: t('specialist.nameAr', 'Name (AR)'),
      render: (row) => <span dir="rtl">{row.nameAr}</span>,
    },
    {
      key: 'categoryName',
      label: t('category.name', 'Category Name'),
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
          {row.categoryName}
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
        <p className="text-sm text-[var(--danger)]">Failed to load subCategories.</p>
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
          Sub Category
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Manage your Sub Category
        </p>
      </div>

      <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
        Add Sub Category
      </Button>
    </div>

    {/* DataTable — search + filter + pagination built-in */}
    <DataTable<SubCategory>
      columns={columns}
      data={subCategories}
      rowKey="id"
      loading={isLoading}
      searchKeys={['nameEn', 'nameAr', 'categoryName']}
      searchPlaceholder={t('specialist.searchPlaceholder', 'Search by name, category')}
      filters={tableFilters}
      emptyMessage={t('specialist.noSpecialists', 'No subCategories found. Add your first one!')}
      // toolbar prop removed
    />

      {/* Add / Edit modal */}
      <SubCategoryFormModal
        open={formModal.open}
        onClose={closeForm}
        subCategory={formModal.subCategory}
        categories={categories}
        onCreated={(id) => {
          // Find the name of the just-created specialist from the form is not possible here,
          // so we pass a temporary label; the image modal shows the id as fallback
          handleCreated(id, t('specialist.newSpecialist', 'New subCategory'))
        }}
      />

      {/* Image upload modal */}
      {imageModal && (
        <SubCategoryImageModal
          open={imageModal.open}
          onClose={closeImageModal}
          subCategoryId={imageModal.subCategoryId}
          subCategoryName={imageModal.subCategoryName}
        />
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('specialist.deleteTitle', 'Delete subCategory')}
        message={t('specialist.deleteMessage', 'Are you sure you want to delete this subCategory? This action cannot be undone.')}
      />
    </div>
  )
}