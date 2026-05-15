// ─── BrandPage ────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { ServiceCode } from '../types'
import { useGetServiceCodesQuery, useDeleteServiceCodeMutation } from '../services/serviceCodeApi'
import ServiceCodeFormModal from '../components/ServiceCodeFormModal'
import ServiceCodeImageModal from '../components/ServiceCodeImageModal'

export default function ServiceCodePage() {
  const { t } = useTranslation()

  const { data: ServiceCodes = [], isLoading, isError } = useGetServiceCodesQuery()
  const [deleteServiceCode, { isLoading: isDeleting }] = useDeleteServiceCodeMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; ServiceCode?: ServiceCode }>({ open: false })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    serviceCodeId: number
    serviceCodeName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  const handleCreated = (id: number) => {
    const name = ServiceCodes.find((b) => b.id === id)?.nameEn ?? 'New ServiceCode'
    setImageModal({ open: true, serviceCodeId: id, serviceCodeName: name })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteServiceCode(deleteModal.id).unwrap()
      toast.success('ServiceCode deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<ServiceCode>[] = [
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
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Upload Image"
            onClick={() => setImageModal({ open: true, serviceCodeId: row.id, serviceCodeName: row.nameEn })}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPhotograph size={15} />
          </button>
          <button
            type="button"
            title="Edit"
            onClick={() => setFormModal({ open: true, ServiceCode: row })}
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
        <p className="text-sm text-[var(--danger)]">Failed to load ServiceCodes.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">ServiceCodes</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your ServiceCodes</p>
        </div>
        <Button
          onClick={() => setFormModal({ open: true })}
          leftIcon={<HiPlus size={15} />}
        >
          Add ServiceCode
        </Button>
      </div>

      <DataTable<ServiceCode>
        columns={columns}
        data={ServiceCodes}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'description']}
        searchPlaceholder="Search by name or description…"
        emptyMessage="No ServiceCodes found. Add your first one!"
      />

      <ServiceCodeFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        serviceCode={formModal.ServiceCode}
        onCreated={handleCreated}
      />

      {imageModal && (
        <ServiceCodeImageModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          serviceCodeId={imageModal.serviceCodeId}
          serviceCodeName={imageModal.serviceCodeName}
        />
      )}

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete ServiceCode"
        message="Are you sure you want to delete this ServiceCode? This action cannot be undone."
      />
    </div>
  )
}
