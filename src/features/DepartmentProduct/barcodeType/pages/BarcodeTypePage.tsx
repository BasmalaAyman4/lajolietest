// ─── BarcodeTypePage ──────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column } from '@/components/shared'
import type { BarcodeType } from '../types'
import { useGetBarcodeTypesQuery, useDeleteBarcodeTypeMutation } from '../services/barcodeTypeApi'
import BarcodeTypeFormModal from '../components/BarcodeTypeFormModal'

export default function BarcodeTypePage() {
  const { t } = useTranslation()
  const { data: barcodeTypes = [], isLoading, isError } = useGetBarcodeTypesQuery()
  const [deleteBarcodeType, { isLoading: isDeleting }] = useDeleteBarcodeTypeMutation()

  const [formModal, setFormModal] = useState<{ open: boolean; barcodeType?: BarcodeType }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteBarcodeType(deleteModal.id).unwrap()
      toast.success('Barcode type deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  const columns: Column<BarcodeType>[] = [
    { key: 'nameEn', label: 'Name (EN)' },
    { key: 'nameAr', label: 'Name (AR)', render: (row) => <span dir="rtl">{row.nameAr}</span> },
    {
      key: 'actions', label: '', align: 'right', width: '88px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => setFormModal({ open: true, barcodeType: row })}
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

  if (isError) return <div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--danger)]">Failed to load barcode types.</p></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Barcode Types</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage barcode types</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>Add Barcode Type</Button>
      </div>
      <DataTable<BarcodeType> columns={columns} data={barcodeTypes} rowKey="id" loading={isLoading}
        searchKeys={['nameEn', 'nameAr']} searchPlaceholder="Search by name…" emptyMessage="No barcode types found." />
      <BarcodeTypeFormModal open={formModal.open} onClose={() => setFormModal({ open: false })} barcodeType={formModal.barcodeType} />
      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} loading={isDeleting} title="Delete Barcode Type" message="Are you sure you want to delete this barcode type?" />
    </div>
  )
}