import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, StatusBadge } from '@/components/shared'
import type { Column } from '@/components/shared/Table/Table'
import DataTable from '@/components/shared/Table/DataTable'
import { useGetBannersQuery, useDeleteBannerMutation } from '../services/bannerApi'
import type { Banner } from '../services/bannerApi'

export default function BannerListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: banners = [], isLoading, isError } = useGetBannersQuery()
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation()

  // ── Modal state ──────────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteBanner(deleteModal.id).unwrap()
      toast.success('Banner deleted successfully')
    } catch {
      toast.error(t('common.error', 'An error occurred'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<Banner>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">{row.id}</span>
      ),
    },
    {
      key: 'image',
      label: 'Image',
      width: '120px',
      render: (row) => (
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.titleEn || 'Banner'}
            className="w-16 h-10 object-cover rounded shadow-sm border border-[var(--border)]"
          />
        ) : (
          <span className="text-xs text-[var(--text-muted)]">No Image</span>
        )
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {row.titleEn || row.bannerContentModeName}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {row.bannerTypeName ? `Type: ${row.bannerTypeName}` : 'Image Only'}
          </span>
        </div>
      ),
    },
    {
      key: 'target',
      label: 'Display Target',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">{row.bannerDisplayTargetName}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      align: 'center',
      render: (row) => (
        <StatusBadge variant={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '80px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => navigate(`/banner/edit/${row.id}`)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
          {!row.isDeleted && (
            <button
              type="button"
              onClick={() => setDeleteModal({ open: true, id: row.id })}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
            >
              <HiTrash size={15} />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load banners.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Banners</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your application banners</p>
        </div>
        <Button onClick={() => navigate('/banner/create')} leftIcon={<HiPlus size={15} />}>
          Add Banner
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
        <DataTable<Banner>
          columns={columns}
          data={banners}
          rowKey="id"
          tableKey="banners"
          loading={isLoading}
          emptyMessage="No banners found. Add your first one!"
          defaultHiddenKeys={[]}
        />
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
      />
    </div>
  )
}
