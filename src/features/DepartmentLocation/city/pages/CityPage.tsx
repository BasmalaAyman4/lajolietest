

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge, type FilterConfig } from '@/components/shared'
import type { City } from '../types'
import {
  useGetCityQuery,
  useDeleteCityMutation,
  useGetCountryDropdownQuery,
} from '../services/cityApi'
import CityFormModal from '../components/CityFormModal'

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CityPage() {
  const { t } = useTranslation()

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: Cities = [], isLoading, isError } = useGetCityQuery()
  const { data: countries = [] } = useGetCountryDropdownQuery()
  const [deleteCity, { isLoading: isDeleting }] = useDeleteCityMutation()

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; city?: City }>({
    open: false,
  })

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const openEdit = (city: City) => setFormModal({ open: true, city })
  const closeForm = () => setFormModal({ open: false })

  // After create: auto-open the image upload modal
  const handleCreated = (id: number, name: string) => {
  }



  const confirmDelete = (id: number) => setDeleteModal({ open: true, id })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteCity(deleteModal.id).unwrap()
      toast.success(t( 'City deleted'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
  // jobName comes directly from the API — no client-side lookup needed

  // Build filter options from jobs data
  const countryFilterOptions = countries.map((j) => ({ label: j.name, value: j.name }))

  const tableFilters: FilterConfig[] = [
    { key: 'countryName', label: t('category.name', 'Country Name'), options: countryFilterOptions },

  ]

  const columns: Column<City>[] = [
 
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
      key: 'shippingCost',
      label: t('specialist.shippingCost', 'Shipping Cost'),
      render: (row) => <span dir="rtl">{row.shippingCost}</span>,
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
        <p className="text-sm text-[var(--danger)]">Failed to load Cites.</p>
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
            City
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Manage your City
          </p>
        </div>

        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          Add City
        </Button>
      </div>

      {/* DataTable — search + filter + pagination built-in */}
      <DataTable<City>
        columns={columns}
        data={Cities}
        rowKey="id"
        loading={isLoading}
        searchKeys={['nameEn', 'nameAr', 'countryName']}
        searchPlaceholder={t('specialist.searchPlaceholder', 'Search by name, country')}
        filters={tableFilters}
        emptyMessage={t('specialist.noSpecialists', 'No Cites found. Add your first one!')}
      // toolbar prop removed
      />

      {/* Add / Edit modal */}
      <CityFormModal
        open={formModal.open}
        onClose={closeForm}
        city={formModal.city}
        countries={countries}
        onCreated={(id) => {
          // Find the name of the just-created specialist from the form is not possible here,
          // so we pass a temporary label; the image modal shows the id as fallback
          handleCreated(id, t('specialist.newCity', 'New City'))
        }}
      />



      {/* Delete confirm modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t( 'Delete City')}
        message={t( 'Are you sure you want to delete this City? This action cannot be undone.')}
      />
    </div>
  )
}