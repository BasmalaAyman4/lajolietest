

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge, type FilterConfig } from '@/components/shared'
import type { Area } from '../types'
import {
  useGetAreaQuery,
  useDeleteAreaMutation,
  useGetCityDropdownQuery,
} from '../services/areaApi'
import AreaFormModal from '../components/AreaFormModal'

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AreaPage() {
  const { t } = useTranslation()

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: Areas = [], isLoading, isError } = useGetAreaQuery()
  const { data: cities = [] } = useGetCityDropdownQuery()
  const [deleteArea, { isLoading: isDeleting }] = useDeleteAreaMutation()

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; area?: Area }>({
    open: false,
  })

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (area: Area) => setFormModal({ open: true, area })
  const closeForm = () => setFormModal({ open: false })

  // After create: auto-open the image upload modal
  const handleCreated = (id: number, name: string) => {
  }



  const confirmDelete = (id: number) => setDeleteModal({ open: true, id })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteArea(deleteModal.id).unwrap()
      toast.success(t('Area deleted'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
  // jobName comes directly from the API — no client-side lookup needed

  // Build filter options from jobs data
  const cityFilterOptions = cities.map((j) => ({ label: j.name, value: j.name }))

  const tableFilters: FilterConfig[] = [
    { key: 'cityName', label: t('category.name', 'City Name'), options: cityFilterOptions },

  ]

  const columns: Column<Area>[] = [

    {
      key: 'nameEn',
      label: t('specialist.nameEn', 'Name (EN)'),
    },
    {
      key: 'nameAr',
      label: t('specialist.nameAr', 'Name (AR)'),
      render: (row) => <span dir="rtl">{row.nameAr}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">


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
        <p className="text-sm text-[var(--danger)]">Failed to load Areas.</p>
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
            Area
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Manage your Area
          </p>
        </div>

        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          Add Area
        </Button>
      </div>

      {/* DataTable — search + filter + pagination built-in */}
      <DataTable<Area>
        columns={columns}
        tableKey='areas'
        data={Areas}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'cityName']}
        searchPlaceholder={t('specialist.searchPlaceholder', 'Search by name, city')}
        filters={tableFilters}
        emptyMessage={t('specialist.noSpecialists', 'No Areas found. Add your first one!')}
      // toolbar prop removed
      />

      {/* Add / Edit modal */}
      <AreaFormModal
        open={formModal.open}
        onClose={closeForm}
        area={formModal.area}
        cities={cities}
        onCreated={(id) => {
          // Find the name of the just-created specialist from the form is not possible here,
          // so we pass a temporary label; the image modal shows the id as fallback
          handleCreated(id, t('specialist.newArea', 'New Area'))
        }}
      />



      {/* Delete confirm modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('Delete Area')}
        message={t('Are you sure you want to delete this Area? This action cannot be undone.')}
      />
    </div>
  )
}