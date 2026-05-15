// ─── SizePage ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { RoutineType } from '../types'
import { useGetRoutineTypesQuery, useDeleteRoutineTypeMutation } from '../services/routineApi'
import RoutineFormModel from '../components/RoutineFormModel'

export default function RoutineTypePage() {
  const { t } = useTranslation()
  const { data: routineTypes = [], isLoading, isError } = useGetRoutineTypesQuery()
  const [deleteRoutineType, { isLoading: isDeleting }] = useDeleteRoutineTypeMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; routineType?: RoutineType }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteRoutineType(deleteModal.id).unwrap()
      toast.success('Routine Type deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<RoutineType>[] = [
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
    {
      key: 'description',
      label: 'Description',
      render: (row) => <span className="text-sm text-[var(--text-muted)] truncate max-w-xs block">{row.description || '—'}</span>,
    },
    {
      key: 'time',
      label: 'Time',
      render: ({ fromTime, toTime }) =>
        `${fromTime || '—'} – ${toTime || '—'}`,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '88px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => setFormModal({ open: true, routineType: row })}
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

  if (isError) return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load routine types.</p></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Routine Types</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage Routine Types</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>Add Routine Type</Button>
      </div>
      <DataTable<RoutineType> columns={columns} data={routineTypes} rowKey="id" loading={isLoading}
        searchKeys={['nameEn', 'nameAr']} searchPlaceholder="Search by name…" emptyMessage="No routine types found." />
      <RoutineFormModel open={formModal.open} onClose={() => setFormModal({ open: false })} routine={formModal.routineType} />
      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} loading={isDeleting} title="Delete Routine Type" message="Are you sure you want to delete this routine type?" />
    </div>
  )
}