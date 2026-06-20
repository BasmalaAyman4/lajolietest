// ─── InterestPage ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { DefaultImage } from '../types'
import {
  useGetDefaultImageQuery,
  useDeleteDefaultImageMutation,

} from '../services/defaultImageApi'
import DefaultImageFormModal from '../components/DefaultImageFormModal'
import DefaultImageModal from '../components/DefaultImageModal'
import { getApiError } from '@/services/apiHelpers'

export default function DefaultImagePage() {
  const { t } = useTranslation()

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: DefaultImage = [], isLoading, isError } = useGetDefaultImageQuery()
 
  const [deleteDefaultImage, { isLoading: isDeleting }] = useDeleteDefaultImageMutation()

  // ── Modal state ───────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; DefaultImage?: DefaultImage }>({
    open: false,
  })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    DefaultImageId: number
    DefaultImageName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (DefaultImage: DefaultImage) => setFormModal({ open: true, DefaultImage })
  const closeForm = () => setFormModal({ open: false })

  const handleCreated = (id: number) => {
    const name = DefaultImage.find((i) => i.id === id)?.defaultImageSectionName ?? 'New DefaultImage'
    setImageModal({ open: true, DefaultImageId: id, DefaultImageName: name })
  }

  const openImageModal = (DefaultImage: DefaultImage) =>
    setImageModal({ open: true, DefaultImageId: DefaultImage.id, DefaultImageName: DefaultImage.defaultImageSectionName })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteDefaultImage(deleteModal.id).unwrap()
      toast.success('DefaultImage deleted')
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<DefaultImage>[] = [
    {
      key: 'imageUrl',
      label: 'Image',
      width: '56px',
      align: 'center',
      render: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.defaultImageSectionName}
            className="w-9 h-9 rounded-full object-cover border border-[var(--border)] mx-auto"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mx-auto">
            <HiPhotograph size={16} className="text-[var(--text-muted)]" />
          </div>
        ),
    },
    { key: 'defaultImageSectionName', label: 'Default Image Section Name' },
    {
      key: 'defaultImagePhotoTypeName',
      label: 'Default Image Photo Type Name',
      render: (row) => <span dir="rtl">{row.defaultImagePhotoTypeName}</span>,
    },
    {
      key: 'sortOrder',
      label: 'Sort',
      align: 'center',
      width: '60px',
      render: (row) => <span className="text-sm text-[var(--text-muted)]">{row.sortOrder}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '80px',
      render: (row) => <StatusBadge active={row.isActive} />,
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
            onClick={() => openImageModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPhotograph size={15} />
          </button>
          <button
            type="button"
            title={t('common.edit', 'Edit')}
            onClick={() => openEdit(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPencil size={15} />
          </button>
          <button
            type="button"
            title={t('common.delete')}
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
        <p className="text-sm text-[var(--danger)]">Failed to load default images.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Default Images</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your default images</p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          Add Default Image
        </Button>
      </div>

      {/* Table */}
      <DataTable<DefaultImage>
        columns={columns}
        data={DefaultImage}
        tableKey='default-images-table'
        rowKey="id"
        loading={isLoading}
        searchKeys={['defaultImageSectionName', 'defaultImagePhotoTypeName', 'codeKey']}
        searchPlaceholder="Search by name or code key…"
        emptyMessage="No Default Images found. Add your first one!"
      />

      {/* Add / Edit modal */}
      <DefaultImageFormModal
        open={formModal.open}
        onClose={closeForm}
        defaultImage={formModal.DefaultImage}
        onCreated={handleCreated}
      />

      {/* Image upload modal */}
      {imageModal && (
        <DefaultImageModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          defaultImageId={imageModal.DefaultImageId}
          defaultImageName={imageModal.DefaultImageName}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Default Image"
        message="Are you sure you want to delete this Default Image? This action cannot be undone."
      />
    </div>
  )
}
