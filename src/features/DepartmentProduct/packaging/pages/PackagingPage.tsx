// ─── PackagingPage ────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Packaging } from '../types'
import {
  useGetPackagingsQuery,
  useDeletePackagingMutation,
} from '../services/packagingApi'
import PackagingFormModal from '../components/PackagingFormModal'
import PackagingImageModal from '../components/PackagingImageModal'

export default function PackagingPage() {
  const { t } = useTranslation()

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: packagings = [], isLoading, isError } = useGetPackagingsQuery()
  const [deletePackaging, { isLoading: isDeleting }] = useDeletePackagingMutation()

  // ── Modal state ───────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; packaging?: Packaging }>({
    open: false,
  })
  const [imageModal, setImageModal] = useState<{
    open: boolean
    packagingId: number
    packagingName: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (pkg: Packaging) => setFormModal({ open: true, packaging: pkg })
  const closeForm = () => setFormModal({ open: false })

  const handleCreated = (id: number) => {
    const name = packagings.find((p) => p.id === id)?.nameEn ?? 'New Packaging'
    setImageModal({ open: true, packagingId: id, packagingName: name })
  }

  const openImageModal = (pkg: Packaging) =>
    setImageModal({ open: true, packagingId: pkg.id, packagingName: pkg.nameEn })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deletePackaging(deleteModal.id).unwrap()
      toast.success('Packaging deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<Packaging>[] = [
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
    {
      key: 'nameAr',
      label: 'Name (AR)',
      render: (row) => <span dir="rtl">{row.nameAr}</span>,
    },
    {
      key: 'price',
      label: 'Price',
      align: 'center',
      width: '80px',
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {row.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'isMultiple',
      label: 'Multiple',
      align: 'center',
      width: '80px',
      render: (row) =>
        row.isMultiple ? (
          <span className="text-xs font-medium text-[var(--accent)]">Yes</span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">No</span>
        ),
    },
    {
      key: 'fromQty',
      label: 'Qty Range',
      render: (row) =>
        row.isMultiple ? (
          <span className="text-sm text-[var(--text-secondary)]">
            {row.fromQty} – {row.toQty}
          </span>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">—</span>
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
        <p className="text-sm text-[var(--danger)]">Failed to load packagings.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Packaging</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your packaging options</p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          Add Packaging
        </Button>
      </div>

      {/* Table */}
      <DataTable<Packaging>
        columns={columns}
        data={packagings}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr']}
        searchPlaceholder="Search by name…"
        emptyMessage="No packaging found. Add your first one!"
      />

      {/* Add / Edit modal */}
      <PackagingFormModal
        open={formModal.open}
        onClose={closeForm}
        packaging={formModal.packaging}
        onCreated={handleCreated}
      />

      {/* Image upload modal */}
      {imageModal && (
        <PackagingImageModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          packagingId={imageModal.packagingId}
          packagingName={imageModal.packagingName}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Packaging"
        message="Are you sure you want to delete this packaging? This action cannot be undone."
      />
    </div>
  )
}
