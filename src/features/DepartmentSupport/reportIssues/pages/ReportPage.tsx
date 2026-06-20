// ─── BranchPage ───────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Report } from '../types'
import { useGetReportsQuery, useDeleteReportMutation } from '../services/reportApi'
import ReportFormModal from '../components/ReportFormModel'
import { getApiError } from '@/services/apiHelpers'

export default function ReportPage() {
  const { t } = useTranslation()

  const { data: reports = [], isLoading, isError } = useGetReportsQuery()
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; report?: Report }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteReport(deleteModal.id).unwrap()
      toast.success('Report deleted')
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<Report>[] = [
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
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
            onClick={() => setFormModal({ open: true, report: row })}
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
        <p className="text-sm text-[var(--danger)]">Failed to load reports.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Reports</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your reports</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>
          Add Report
        </Button>
      </div>

      <DataTable<Report>
        columns={columns}
        data={reports}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr']}
        searchPlaceholder="Search by name…"
        emptyMessage="No reports found. Add your first one!"
      />

      <ReportFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        report={formModal.report}
      />

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
      />
    </div>
  )
}
