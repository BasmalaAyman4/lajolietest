

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge, type FilterConfig } from '@/components/shared'
import type { FqaType } from '../types'
import {
  useGetFqaTypesQuery,
  useDeleteFqaTypeMutation,
} from '../services/fqaTypeApi'
import FqaTypeFormModal from '../components/FqaTypeFormModal'
import FqaTypeImageModal from '../components/FqaTypeImageModal'

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FqaTypePage() {
  const { t } = useTranslation()

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: fqaTypes = [], isLoading, isError } = useGetFqaTypesQuery()
  const [deleteFqaType, { isLoading: isDeleting }] = useDeleteFqaTypeMutation()

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; fqaType?: FqaType }>({
    open: false,
  })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    fqaTypeId: number
    fqaTypeName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (fqaType: FqaType) => setFormModal({ open: true, fqaType: fqaType })
  const closeForm = () => setFormModal({ open: false })

  // After create: auto-open the image upload modal
  const handleCreated = (id: number, name: string) => {
    setImageModal({ open: true, fqaTypeId: id, fqaTypeName: name })
  }

  const openImageModal = (s: FqaType) =>
    setImageModal({ open: true, fqaTypeId: s.id, fqaTypeName: s.nameEn })

  const closeImageModal = () => setImageModal(null)

  const confirmDelete = (id: number) => setDeleteModal({ open: true, id })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteFqaType(deleteModal.id).unwrap()
      toast.success(t('fqaType.deleteSuccess', 'FqaType deleted'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }



  const columns: Column<FqaType>[] = [
    {
      key: 'imageUrl',
      label: t('fqaType.image', 'Image'),
      width: '56px',
      align: 'center',
      render: (row) => (
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
        )
      ),
    },
    {
      key: 'nameEn',
      label: t('fqaType.nameEn', 'Name (EN)'),
    },
    {
      key: 'nameAr',
      label: t('fqaType.nameAr', 'Name (AR)'),
      render: (row) => <span dir="rtl">{row.nameAr}</span>,
    },

    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* Upload image */}
          <button
            type="button"
            title={t('fqaType.uploadFqaTypeImage')}
            onClick={() => openImageModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]
              transition-colors"
          >
            <HiPhotograph size={15} />
          </button>

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
        <p className="text-sm text-[var(--danger)]">Failed to load Categories Products.</p>
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
            FAQ Types
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Manage your FAQ Types
          </p>
        </div>

        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          {t('fqaType.addFqaType', 'Add FAQ Type')}
        </Button>
      </div>

      {/* DataTable — search + filter + pagination built-in */}
      <DataTable<FqaType>
        columns={columns}
        tableKey='fqaTypes'
        data={fqaTypes}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr']}
        searchPlaceholder={t('fqaType.searchPlaceholder', 'Search by name ...')}
        emptyMessage={t('fqaType.noFqaTypes', 'No FqaTypes found. Add your first one!')}
      />

      {/* Add / Edit modal */}
      <FqaTypeFormModal
        open={formModal.open}
        onClose={closeForm}
        fqaType={formModal.fqaType}
        onCreated={(id) => {
          handleCreated(id, t('fqaType.newFqaType', 'New FqaType'))
        }}
      />

      {/* Image upload modal */}
      {imageModal && (
        <FqaTypeImageModal
          open={imageModal.open}
          onClose={closeImageModal}
          fqaTypeId={imageModal.fqaTypeId}
          fqaTypeName={imageModal.fqaTypeName}
        />
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('fqaType.deleteTitle', 'Delete FqaType')}
        message={t('fqaType.deleteMessage', 'Are you sure you want to delete this fqaType? This action cannot be undone.')}
      />
    </div>
  )
}