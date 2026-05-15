

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge, type FilterConfig } from '@/components/shared'
import type { CollaboratorVoucherDetail } from '../types'
import {
  useGetCollaboratorVoucherQuery,
  useDeleteCollaboratorVoucherMutation,
  useGetCollaboratorDropdownQuery,
} from '../services/collaborationVoucher'
import CollaborationVoucherFormModal from '../components/CollaborationVoucherFormModal'

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CollaborationVoucherPage() {
  const { t } = useTranslation()

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: CollaboratorVouchers = [], isLoading, isError } = useGetCollaboratorVoucherQuery()
  const { data: Collaborators = [] } = useGetCollaboratorDropdownQuery()
  const [deleteCollaboratorVoucher, { isLoading: isDeleting }] = useDeleteCollaboratorVoucherMutation()

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; CollaboratorVoucher?: CollaboratorVoucherDetail }>({
    open: false,
  })

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (CollaboratorVoucher: CollaboratorVoucherDetail) => setFormModal({ open: true, CollaboratorVoucher })
  const closeForm = () => setFormModal({ open: false })

  // After create: auto-open the image upload modal
  const handleCreated = (id: number, name: string) => {
  }



  const confirmDelete = (id: number) => setDeleteModal({ open: true, id })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteCollaboratorVoucher(deleteModal.id).unwrap()
      toast.success(t('Collaboration Voucher deleted'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
  // jobName comes directly from the API — no client-side lookup needed

  // Build filter options from jobs data
  const CollaboratorFilterOptions = Collaborators.map((j) => ({ label: j.name, value: j.name }))

  const tableFilters: FilterConfig[] = [
    { key: 'collaboratorName', label: t('category.name', 'Collaborator Name'), options: CollaboratorFilterOptions },

  ]

  const columns: Column<CollaboratorVoucherDetail>[] = [

  
    {
      key: 'vvalue',
      label: t('specialist.vvalue', 'Value'),
    },
    {
      key: 'fromDate',
      label: t('specialist.fromDate', 'From Date'),
      render: (row) => <span dir="rtl">{row.fromDate}</span>,
    },
    {
      key: 'toDate',
      label: t('specialist.toDate', 'To Date'),
      render: (row) => <span dir="rtl">{row.toDate}</span>,
    },
    {
      key: 'maxDeduct',
      label: t('specialist.maxDeduct', 'maxDeduct'),
      render: (row) => <span dir="rtl">{row.maxDeduct}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">


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
        <p className="text-sm text-[var(--danger)]">Failed to load Collaborator Vouchers.</p>
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
            Collaboration Vouchers
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Manage your Collaboration Vouchers
          </p>
        </div>

        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          Add Collaboration Voucher
        </Button>
      </div>

      {/* DataTable — search + filter + pagination built-in */}
      <DataTable<CollaboratorVoucherDetail>
        columns={columns}
        data={CollaboratorVouchers}
        rowKey="id"
        loading={isLoading}
        searchKeys={['vvalue', 'fromDate', 'toDate', 'collaboratorId', 'maxDeduct']}
        searchPlaceholder={t('specialist.searchPlaceholder', 'Search by value, date, collaborator, maxDeduct')}
        filters={tableFilters}
        emptyMessage={t('specialist.noSpecialists', 'No Collaboration Vouchers found. Add your first one!')}
      // toolbar prop removed
      />

      {/* Add / Edit modal */}
      <CollaborationVoucherFormModal
        open={formModal.open}
        onClose={closeForm}
        CollaboratorVoucher={formModal.CollaboratorVoucher}
        collaborators={Collaborators}
        onCreated={(id) => {
          // Find the name of the just-created specialist from the form is not possible here,
          // so we pass a temporary label; the image modal shows the id as fallback
          handleCreated(id, t('specialist.newCity', 'New Collaboration Voucher'))
        }}
      />



      {/* Delete confirm modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('Delete Collaboration Voucher')}
        message={t('Are you sure you want to delete this Collaboration Voucher? This action cannot be undone.')}
      />
    </div>
  )
}