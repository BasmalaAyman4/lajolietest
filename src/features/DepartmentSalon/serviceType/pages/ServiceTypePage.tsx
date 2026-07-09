// ─── ServiceTypePage ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { ServiceType } from '../types'
import { useGetServiceTypesQuery, useDeleteServiceTypeMutation, useGetServiceCategoryDropdownQuery , useGetChairTypeDropdownQuery} from '../services/serviceTypeApi'
import ServiceTypeFormModal from '../components/ServiceTypeFormModal'
import ServiceTypeImageModal from '../components/ServiceTypeImageModal'
import { getApiError } from '@/services/apiHelpers'

export default function ServiceTypePage() {
  const { t } = useTranslation()

  const { data: serviceTypes = [], isLoading, isError } = useGetServiceTypesQuery()
  const { data: serviceCategories = [] } = useGetServiceCategoryDropdownQuery()
  const { data: chairTypes = [] } = useGetChairTypeDropdownQuery()
  const [deleteServiceType, { isLoading: isDeleting }] = useDeleteServiceTypeMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; serviceType?: ServiceType }>({ open: false })
  const [imageModal, setImageModal] = useState<{ open: boolean; serviceTypeId: number; serviceTypeName: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  // Lookup helper: serviceCategoriesId → name
  const scName = (id: number) => serviceCategories.find((sc) => sc.id === id)?.name ?? '—'

  const handleCreated = (id: number) => {
    const name = serviceTypes.find((c) => c.id === id)?.nameEn ?? 'New Service Type'
    setImageModal({ open: true, serviceTypeId: id, serviceTypeName: name })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteServiceType(deleteModal.id).unwrap()
      toast.success('Service Type deleted')
    }catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<ServiceType>[] = [
    {
      key: 'imageUrl', label: 'Image', width: '56px', align: 'center',
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
      key: 'codeKey', label: 'Code Key',
      render: (row) => <span className="font-mono text-xs bg-[var(--bg-hover)] px-2 py-0.5 rounded">{row.codeKey}</span>,
    },
    {
      key: 'serviceCategoryId', label: 'Service Category',
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{scName(row.serviceCategoryId)}</span>,
    },
    {
      key: 'chairTypeName', label: 'Chair Type',
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.chairTypeName}</span>,
    },
    {
      key: 'sortOrder', label: 'Sort', align: 'center', width: '60px',
      render: (row) => <span className="text-sm text-[var(--text-muted)]">{row.sortOrder}</span>,
    },
    {
      key: 'isActive', label: 'Status', width: '80px',
      render: (row) => <StatusBadge active={row.isActive} />,
    },
    {
      key: 'actions', label: '', align: 'right', width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" title="Upload Image" onClick={() => setImageModal({ open: true, serviceTypeId: row.id, serviceTypeName: row.nameEn })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors">
            <HiPhotograph size={15} />
          </button>
          <button type="button" title="Edit" onClick={() => setFormModal({ open: true, serviceType: row })}
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

  if (isError) return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load service types.</p></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Service Types</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your service types</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>Add Service Type</Button>
      </div>

      <DataTable<ServiceType>  columns={columns} tableKey='servicetypesalon' data={serviceTypes} rowKey="id" loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'codeKey']} searchPlaceholder="Search by name or code key…" emptyMessage="No service types found." />

      <ServiceTypeFormModal open={formModal.open} onClose={() => setFormModal({ open: false })} serviceType={formModal.serviceType} onCreated={handleCreated} />

      {imageModal && (
        <ServiceTypeImageModal open={imageModal.open} onClose={() => setImageModal(null)} serviceTypeId={imageModal.serviceTypeId} serviceTypeName={imageModal.serviceTypeName} />
      )}

      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} loading={isDeleting} title="Delete Service Type" message="Are you sure you want to delete this service type?" />
    </div>
  )
}