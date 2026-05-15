// ─── BeautyCategoryPage ───────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { BeautyCategory } from '../types'
import {
  useGetBeautyCategoriesQuery,
  useDeleteBeautyCategoryMutation,
} from '../services/beautyCategoryApi'
import BeautyCategoryFormModal from '../components/BeautyCategoryFormModal'
import BeautyCategoryImageModal from '../components/BeautyCategoryImageModal'

export default function BeautyCategoryPage() {
  const { t } = useTranslation()

  const { data: beautyCategories = [], isLoading, isError } = useGetBeautyCategoriesQuery()
  const [deleteBeautyCategory, { isLoading: isDeleting }] = useDeleteBeautyCategoryMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; beautyCategory?: BeautyCategory }>({ open: false })
  const [imageModal, setImageModal] = useState<{ open: boolean; beautyCategoryId: number; beautyCategoryName: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const openAdd = () => setFormModal({ open: true })
  const openEdit = (bc: BeautyCategory) => setFormModal({ open: true, beautyCategory: bc })
  const closeForm = () => setFormModal({ open: false })

  const handleCreated = (id: number) => {
    const name = beautyCategories.find((bc) => bc.id === id)?.nameEn ?? 'New Beauty Category'
    setImageModal({ open: true, beautyCategoryId: id, beautyCategoryName: name })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteBeautyCategory(deleteModal.id).unwrap()
      toast.success('Beauty category deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<BeautyCategory>[] = [
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
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
    {
      key: 'codeKey',
      label: 'Code Key',
      render: (row) => (
        <span className="font-mono text-xs bg-[var(--bg-hover)] px-2 py-0.5 rounded">{row.codeKey}</span>
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
          <button type="button" title="Upload Image" onClick={() => setImageModal({ open: true, beautyCategoryId: row.id, beautyCategoryName: row.nameEn })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors">
            <HiPhotograph size={15} />
          </button>
          <button type="button" title="Edit" onClick={() => openEdit(row)}
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

  if (isError) {
    return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load beauty categories.</p></div>
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Beauty Categories</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your beauty categories</p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>Add Beauty Category</Button>
      </div>

      <DataTable<BeautyCategory>
        columns={columns}
        data={beautyCategories}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'codeKey']}
        searchPlaceholder="Search by name or code key…"
        emptyMessage="No beauty categories found. Add your first one!"
      />

      <BeautyCategoryFormModal
        open={formModal.open}
        onClose={closeForm}
        beautyCategory={formModal.beautyCategory}
        onCreated={handleCreated}
      />

      {imageModal && (
        <BeautyCategoryImageModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          beautyCategoryId={imageModal.beautyCategoryId}
          beautyCategoryName={imageModal.beautyCategoryName}
        />
      )}

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Beauty Category"
        message="Are you sure you want to delete this beauty category? This action cannot be undone."
      />
    </div>
  )
}
