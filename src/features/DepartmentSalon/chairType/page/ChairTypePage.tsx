
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge } from '@/components/shared'
import type { ChairType } from '../types'
import {
  useGetChairTypesQuery,
  useDeleteChairTypeMutation,
} from '../services/chairTypeApi'
import ChairTypeFormModal from '../components/ChairTypeFormModel'

export default function ChairTypePage() {
  const { t } = useTranslation()

  const { data: chairTypes = [], isLoading, isError } = useGetChairTypesQuery()
  const [deleteChairType, { isLoading: isDeleting }] = useDeleteChairTypeMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; chairType?: ChairType }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const openAdd = () => setFormModal({ open: true })
  const openEdit = (ct: ChairType) => setFormModal({ open: true, chairType: ct })
  const closeForm = () => setFormModal({ open: false })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteChairType(deleteModal.id).unwrap()
      toast.success('Chair type deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<ChairType>[] = [
  
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
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
          <button type="button" title="Edit" onClick={() => openEdit(row)}
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

  if (isError) {
    return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load beauty categories.</p></div>
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Chair Types</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your chair types</p>
        </div>
        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>Add Chair Type</Button>
      </div>

      <DataTable<ChairType>
        columns={columns}
        data={chairTypes}
        tableKey='ChairTypePage'
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr']}
        searchPlaceholder="Search by name…"
        emptyMessage="No chair types found. Add your first one!"
      />

      <ChairTypeFormModal
        open={formModal.open}
        onClose={closeForm}
        chairType={formModal.chairType}
      />

     

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Chair Type"
        message="Are you sure you want to delete this chair type? This action cannot be undone."
      />
    </div>
  )
}
