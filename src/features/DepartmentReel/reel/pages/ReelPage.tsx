// ─── ReelPage ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiTrash, HiFilm, HiVideoCamera, HiPlay } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { Reel } from '../types'
import { useGetReelsQuery, useDeleteReelMutation,useLazyGetReelByIdQuery } from '../services/reelApi'
import ReelFormModal from '../components/ReelFormModal'
import ReelVideoModal from '../components/ReelVideoModal'
import ReelPreviewModal from '../components/ReelPreviewModal'

export default function ReelPage() {
  const { t } = useTranslation()

  const { data: reels = [], isLoading, isError } = useGetReelsQuery()
  const [deleteReel, { isLoading: isDeleting }] = useDeleteReelMutation()
const [fetchReelById, { isFetching: isFetchingDetail }] = useLazyGetReelByIdQuery()

  const [formModal, setFormModal] = useState(false)
  const [videoModal, setVideoModal] = useState<{
    open: boolean
    reelId: number
    reelTitle: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

const [previewModal, setPreviewModal] = useState<{
  open: boolean
  videoUrl: string
  reelTitle: string
  thumbnailUrl?: string
} | null>(null)

  // After creating a reel, open the video upload modal automatically
  const handleCreated = (id: number, title: string) => {
    setVideoModal({ open: true, reelId: id, reelTitle: title })
  }

 const openVideoModal = (r: Reel) =>
    setVideoModal({ open: true, reelId: r.id, reelTitle: r.title })


  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteReel(deleteModal.id).unwrap()
      toast.success('Reel deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }
const openPreview = async (r: Reel) => {
  try {
    const detail = await fetchReelById(r.id).unwrap()
    if (!detail.videoUrl) {
      toast.error(t('reel.noVideo', 'No video uploaded yet for this reel.'))
      return
    }
    setPreviewModal({
      open: true,
      videoUrl: detail.videoUrl,
      reelTitle: detail.title,
      thumbnailUrl: detail.imageThumbnailUrl,
    })
  } catch {
    toast.error(t('common.error'))
  }
}
  const columns: Column<Reel>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
            <HiFilm size={15} className="text-[var(--text-muted)]" />
          </div>
          <span className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">
            {row.title}
          </span>
        </div>
      ),
    },
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
      key: 'uploadedBy',
      label: 'Uploaded By',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">{row.uploadedBy}</span>
      ),
    },
    {
      key: 'createdDate',
      label: 'Date',
      render: (row) => (
        <span className="text-sm text-[var(--text-muted)]">{row.createdDate}</span>
      ),
    },
    {
      key: 'isApproved',
      label: 'Status',
      align: 'center',
      width: '100px',
      render: (row) => (
        <span
          className={[
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            row.isApproved
              ? 'bg-green-50 text-green-700'
              : 'bg-[var(--bg-hover)] text-[var(--text-muted)]',
          ].join(' ')}
        >
          {row.isApproved ? 'Approved' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '100px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
            <button
                      type="button"
                      title={t('reel.watchVideo', 'Watch Video')}
                      onClick={() => openPreview(row)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]
                        transition-colors"
                    >
                      <HiPlay size={15} />
                    </button>
          <button
            type="button"
            title="Upload Video"
            onClick={() =>
              setVideoModal({ open: true, reelId: row.id, reelTitle: row.title })
            }
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiVideoCamera size={15} />
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
        <p className="text-sm text-[var(--danger)]">Failed to load reels.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Reels</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your reels</p>
        </div>
        <Button onClick={() => setFormModal(true)} leftIcon={<HiPlus size={15} />}>
          Add Reel
        </Button>
      </div>

      {/* Table */}
      <DataTable<Reel>
        columns={columns}
        data={reels}
        tableKey="reel"
        rowKey="id"
        loading={isLoading}
        searchKeys={['title', 'description', 'uploadedBy']}
        searchPlaceholder="Search by title, description or uploader…"
        emptyMessage="No reels found. Add your first one!"
      />

      {/* Create modal */}
      <ReelFormModal
        open={formModal}
        onClose={() => setFormModal(false)}
        onCreated={handleCreated}
      />

      {/* Video upload modal */}
      {videoModal && (
        <ReelVideoModal
          open={videoModal.open}
          onClose={() => setVideoModal(null)}
          reelId={videoModal.reelId}
          reelTitle={videoModal.reelTitle}
        />
      )}

{previewModal && (
  <ReelPreviewModal
    open={previewModal.open}
    onClose={() => setPreviewModal(null)}
    videoUrl={previewModal.videoUrl}
    reelTitle={previewModal.reelTitle}
    thumbnailUrl={previewModal.thumbnailUrl}
  />
)}

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Reel"
        message="Are you sure you want to delete this reel? This action cannot be undone."
      />
    </div>
  )
}