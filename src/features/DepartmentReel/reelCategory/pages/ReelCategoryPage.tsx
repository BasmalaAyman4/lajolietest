// ─── SizePage ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { ReelCategory } from '../types'
import { useGetReelCategoriesQuery, useDeleteReelCategoryMutation } from '../services/reelCategoryApi'
import ReelCategoryFormModal from '../components/ReelCategoryFormModal'
import ReelCategoryImageModal from '../components/ReelCategoryImageModal'
export default function ReelCategoryPage() {
  const { t } = useTranslation()
  const { data: reelCategory = [], isLoading, isError } = useGetReelCategoriesQuery()
  const [deleteReelCategory, { isLoading: isDeleting }] = useDeleteReelCategoryMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; reelCategory?: ReelCategory }>({ open: false })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    reelCategoryId: number
    reelCategoryName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const handleCreated = (id: number) => {
    const name = reelCategory.find((b) => b.id === id)?.nameEn ?? 'New Reel Category'
    setImageModal({ open: true, reelCategoryId: id, reelCategoryName: name })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteReelCategory(deleteModal.id).unwrap()
      toast.success('Reel Category deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<ReelCategory>[] = [
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
      key: 'isActive',
      label: 'Active',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.isActive
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '88px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
             <button
                      type="button"
                      title="Upload Image"
                      onClick={() => setImageModal({ open: true, reelCategoryId: row.id, reelCategoryName: row.nameEn })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                    >
                      <HiPhotograph size={15} />
                    </button>
          <button type="button" onClick={() => setFormModal({ open: true, reelCategory: row })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors">
            <HiPencil size={15} />
          </button>
          <button type="button" onClick={() => setDeleteModal({ open: true, id: row.id })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors">
            <HiTrash size={15} />
          </button>
        </div>
      ),
    },
  ]

  if (isError) return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load sizes.</p></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Reel Category</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage Reel Category</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>Add Reel Category</Button>
      </div>
      <DataTable<ReelCategory> columns={columns} tableKey="reel-category" data={reelCategory} rowKey="id" loading={isLoading}
        searchKeys={['nameEn', 'nameAr']} searchPlaceholder="Search by name…" emptyMessage="No Reel Category found." />
      <ReelCategoryFormModal open={formModal.open} onClose={() => setFormModal({ open: false })} reelCategory={formModal.reelCategory} />
         {imageModal && (
              <ReelCategoryImageModal
                open={imageModal.open}
                onClose={() => setImageModal(null)}
                reelCategoryId={imageModal.reelCategoryId}
                reelCategoryName={imageModal.reelCategoryName}
              />
            )}
      
      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} loading={isDeleting} title="Delete Reel Category" message="Are you sure you want to delete this Reel Category?" />
    </div>
  )
}