// ─── SizePage ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Size } from '../types'
import { useGetSizesQuery, useDeleteSizeMutation } from '../services/sizeApi'
import SizeFormModal from '../components/SizeFormModal'
import { getApiError } from '@/services/apiHelpers'

export default function SizePage() {
  const { t } = useTranslation()
  const { data: sizes = [], isLoading, isError } = useGetSizesQuery()
  const [deleteSize, { isLoading: isDeleting }] = useDeleteSizeMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; size?: Size }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteSize(deleteModal.id).unwrap()
      toast.success('Size deleted')
    } catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        }finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<Size>[] = [
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
    {
      key: 'description',
      label: 'Description',
      render: (row) => <span className="text-sm text-[var(--text-muted)] truncate max-w-xs block">{row.description || '—'}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '88px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => setFormModal({ open: true, size: row })}
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
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Sizes</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage product sizes</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>Add Size</Button>
      </div>
      <DataTable<Size> columns={columns} data={sizes} rowKey="id" loading={isLoading}
        searchKeys={['nameEn', 'nameAr']} searchPlaceholder="Search by name…" emptyMessage="No sizes found." />
      <SizeFormModal open={formModal.open} onClose={() => setFormModal({ open: false })} size={formModal.size} />
      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} loading={isDeleting} title="Delete Size" message="Are you sure you want to delete this size?" />
    </div>
  )
}