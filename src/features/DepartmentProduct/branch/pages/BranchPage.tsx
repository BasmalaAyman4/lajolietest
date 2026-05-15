// ─── BranchPage ───────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Branch } from '../types'
import { useGetBranchesQuery, useDeleteBranchMutation } from '../services/branchApi'
import BranchFormModal from '../components/BranchFormModal'

export default function BranchPage() {
  const { t } = useTranslation()

  const { data: branches = [], isLoading, isError } = useGetBranchesQuery()
  const [deleteBranch, { isLoading: isDeleting }] = useDeleteBranchMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; branch?: Branch }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteBranch(deleteModal.id).unwrap()
      toast.success('Branch deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<Branch>[] = [
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
      width: '88px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Edit"
            onClick={() => setFormModal({ open: true, branch: row })}
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
        <p className="text-sm text-[var(--danger)]">Failed to load branches.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Branches</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your branches</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>
          Add Branch
        </Button>
      </div>

      <DataTable<Branch>
        columns={columns}
        data={branches}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'description']}
        searchPlaceholder="Search by name or description…"
        emptyMessage="No branches found. Add your first one!"
      />

      <BranchFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        branch={formModal.branch}
      />

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Branch"
        message="Are you sure you want to delete this branch? This action cannot be undone."
      />
    </div>
  )
}
