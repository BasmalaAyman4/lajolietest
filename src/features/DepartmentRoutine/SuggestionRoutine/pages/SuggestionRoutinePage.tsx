import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiBan, HiPlay, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { SuggestionRoutineListItem } from '../types'
import { useGetSuggestionRoutinesQuery, useToggleSuggestionRoutineStopMutation } from '../services/suggestionRoutineApi'
import SuggestionRoutineFormModal from '../components/SuggestionRoutineFormModal'
import SuggestionRoutineImagesModal from '../components/SuggestionRoutineImagesModal'

export default function SuggestionRoutinePage() {
  const { t } = useTranslation()

  const { data: routines = [], isLoading, isError } = useGetSuggestionRoutinesQuery()
  const [toggleStop, { isLoading: isToggling }] = useToggleSuggestionRoutineStopMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; routine?: SuggestionRoutineListItem }>({ open: false })
  const [stopModal, setStopModal] = useState<{ open: boolean; item: SuggestionRoutineListItem | null }>({ open: false, item: null })
  const [imageModal, setImageModal] = useState<{ open: boolean; id: number; name: string } | null>(null)

  const openAdd = () => setFormModal({ open: true })
  const openEdit = (routine: SuggestionRoutineListItem) => setFormModal({ open: true, routine })
  const closeForm = () => setFormModal({ open: false })

  // Fired by the form modal right after a brand-new routine is saved —
  // immediately open the images modal for it, matching the Beauty Category flow.
  const handleCreated = (id: number) => {
    const name = routines.find((r) => r.id === id)?.nameEn ?? t('routine.newRoutine', 'New Routine')
    setImageModal({ open: true, id, name })
  }

  const confirmToggle = (item: SuggestionRoutineListItem) => setStopModal({ open: true, item })

  const handleToggle = async () => {
    if (!stopModal.item) return
    try {
      await toggleStop(stopModal.item.id).unwrap()
      toast.success(t('common.success'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setStopModal({ open: false, item: null })
    }
  }

  const columns: Column<SuggestionRoutineListItem>[] = [
    {
      key: 'imageUrl',
      label: '',
      width: '56px',
      render: (row) =>
        row.imageUrl ? (
          <img src={row.imageUrl} alt="" className="w-10 h-10 rounded-[var(--radius)] object-cover border border-[var(--border)]" />
        ) : (
          <div className="w-10 h-10 rounded-[var(--radius)] bg-[var(--bg-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
            <HiPhotograph size={16} />
          </div>
        ),
    },
    {
      key: 'nameEn',
      label: t('routine.name', 'Name'),
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-[var(--text-primary)]">{row.nameEn}</span>
          <span className="text-xs text-[var(--text-muted)]">{row.nameAr}</span>
        </div>
      ),
    },
    {
      key: 'routinTypeName',
      label: t('routine.type', 'Routine Type'),
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.routinTypeName}</span>,
    },
    {
      key: 'detailsCount',
      label: t('routine.noOfItems', 'Product Types'),
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-hover)] border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)]">
          {row.detailsCount}
        </span>
      ),
    },
    {
      key: 'imagesCount',
      label: t('routine.noOfImages', 'Images'),
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.imagesCount}</span>,
    },
    {
      key: 'isStoped',
      label: t('routine.status', 'Status'),
      render: (row) => (
        <StatusBadge
          variant={row.isStoped ? 'danger' : 'success'}
          label={row.isStoped ? t('common.stopped', 'Stopped') : t('common.active', 'Active')}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '130px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title={t('routine.uploadImage', 'Upload Image')}
            onClick={() => setImageModal({ open: true, id: row.id, name: row.nameEn })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPhotograph size={15} />
          </button>

          <button
            type="button"
            title={t('common.edit', 'Edit')}
            onClick={() => openEdit(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiPencil size={15} />
          </button>

          <button
            type="button"
            title={row.isStoped ? t('common.activate', 'Activate') : t('common.stop', 'Stop')}
            onClick={() => confirmToggle(row)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${row.isStoped
                ? 'text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-green-50'
                : 'text-[var(--text-muted)] hover:text-[var(--warning)] hover:bg-yellow-50'
              }`}
          >
            {row.isStoped ? <HiPlay size={15} /> : <HiBan size={15} />}
          </button>
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">{t('routine.loadError', 'Failed to load suggestion routines.')}</p>
      </div>
    )
  }

  const toggleItem = stopModal.item
  const toggleTitle = toggleItem?.isStoped
    ? t('routine.activateTitle', 'Activate Routine')
    : t('routine.stopTitle', 'Stop Routine')
  const toggleMessage = toggleItem?.isStoped
    ? t('routine.activateMsg', 'Are you sure you want to re-activate this suggestion routine?')
    : t('routine.stopMsg', 'Are you sure you want to stop this suggestion routine?')

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('routine.pageTitle', 'Suggestion Routines')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('routine.pageSubtitle', 'Manage skincare/beauty routine suggestions')}
          </p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          {t('routine.addRoutine', 'Add Routine')}
        </Button>
      </div>

      {/* Table */}
      <DataTable<SuggestionRoutineListItem>
        columns={columns}
        data={routines}
        rowKey="id"
        tableKey="suggestionRoutines"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'routinTypeName']}
        searchPlaceholder={t('routine.searchPlaceholder', 'Search by name or type...')}
        emptyMessage={t('routine.empty', 'No suggestion routines found. Create your first one!')}
      />

      {/* Form modal */}
      <SuggestionRoutineFormModal
        open={formModal.open}
        onClose={closeForm}
        routine={formModal.routine}
        onCreated={handleCreated}
      />

      {/* Images modal — opened either right after create, or via the row action */}
      {imageModal && (
        <SuggestionRoutineImagesModal
          open={imageModal.open}
          onClose={() => setImageModal(null)}
          suggestionRoutineId={imageModal.id}
          suggestionRoutineName={imageModal.name}
        />
      )}

      {/* Toggle confirm modal */}
      <ConfirmModal
        variant={toggleItem?.isStoped ? 'active' : 'stop'}
        open={stopModal.open}
        onClose={() => setStopModal({ open: false, item: null })}
        onConfirm={handleToggle}
        loading={isToggling}
        title={toggleTitle}
        message={toggleMessage}
      />
    </div>
  )
}