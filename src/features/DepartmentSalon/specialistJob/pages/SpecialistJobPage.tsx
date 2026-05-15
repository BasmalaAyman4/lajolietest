// ─── SizePage ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { SpecialistJob } from '../types'
import { useGetSpecialistJobsQuery, useDeleteSpecialistJobMutation } from '../services/specialistJobApi'
import SpecialistJobFormModal from '../components/SpecialistJobFormModal'

export default function SpecialistJobPage() {
  const { t } = useTranslation()
  const { data: SpecialistJob = [], isLoading, isError } = useGetSpecialistJobsQuery()
  const [deleteSpecialistJob, { isLoading: isDeleting }] = useDeleteSpecialistJobMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; specialistJob?: SpecialistJob }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteSpecialistJob(deleteModal.id).unwrap()
      toast.success('SpecialistJob deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<SpecialistJob>[] = [
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
          <button type="button" onClick={() => setFormModal({ open: true, specialistJob: row })}
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

  if (isError) return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load Specialist Jobs.</p></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Specialist Jobs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage Specialist Jobs</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>Add Specialist Job</Button>
      </div>
      <DataTable<SpecialistJob> columns={columns} data={SpecialistJob} rowKey="id" loading={isLoading}
        searchKeys={['nameEn', 'nameAr']} searchPlaceholder="Search by name…" emptyMessage="No Specialist Jobs found." />
      <SpecialistJobFormModal open={formModal.open} onClose={() => setFormModal({ open: false })} specialistJob={formModal.specialistJob} />
      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} loading={isDeleting} title="Delete Specialist Job" message="Are you sure you want to delete this Specialist Job?" />
    </div>
  )
}