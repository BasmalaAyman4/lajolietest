// ─── VendorPage ───────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Vendor } from '../types'
import { useGetVendorsQuery, useDeleteVendorMutation } from '../service/vendorApi'
import VendorFormModal from '../components/VendorFormModal'
import { getApiError } from '@/services/apiHelpers'

export default function VendorPage() {
  const { t } = useTranslation()
  const { data: vendors = [], isLoading, isError } = useGetVendorsQuery()
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; vendor?: Vendor }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteVendor(deleteModal.id).unwrap()
      toast.success('Vendor deleted')
    }catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<Vendor>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'email', label: 'Email',
      render: (row) => <a href={`mailto:${row.email}`} className="text-sm text-[var(--accent)] hover:underline">{row.email}</a>,
    },
    { key: 'mobile', label: 'Mobile', render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.mobile}</span> },
    { key: 'telephone', label: 'Telephone', render: (row) => <span className="text-sm text-[var(--text-muted)]">{row.telephone || '—'}</span> },
    {
      key: 'address', label: 'Address',
      render: (row) => <span className="text-sm text-[var(--text-muted)] truncate max-w-xs block">{row.address}</span>,
    },
    {
      key: 'actions', label: '', align: 'right', width: '88px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => setFormModal({ open: true, vendor: row })}
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

  if (isError) return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load vendors.</p></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Vendors</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your vendors</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>Add Vendor</Button>
      </div>
      <DataTable<Vendor> columns={columns} data={vendors} rowKey="id" loading={isLoading}
        searchKeys={['name', 'email', 'mobile', 'address']} searchPlaceholder="Search by name, email or mobile…" emptyMessage="No vendors found." />
      <VendorFormModal open={formModal.open} onClose={() => setFormModal({ open: false })} vendor={formModal.vendor} />
      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} loading={isDeleting} title="Delete Vendor" message="Are you sure you want to delete this vendor?" />
    </div>
  )
}