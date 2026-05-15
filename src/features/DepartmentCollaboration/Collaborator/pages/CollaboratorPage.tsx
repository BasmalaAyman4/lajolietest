

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiPencil, HiTrash, HiPhotograph } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, StatusBadge, type FilterConfig } from '@/components/shared'
import type { Collaborator } from '../types'
import {
  useGetCollaboratorQuery
} from '../services/collaboratorApi'
import CollaboratorFormModal from '../components/CollaboratorFormModal'

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CollaboratorPage() {
  const { t } = useTranslation()

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: Collaborators = [], isLoading, isError } = useGetCollaboratorQuery()

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; collaborator?: Collaborator }>({
    open: false,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormModal({ open: true })
  const closeForm = () => setFormModal({ open: false })

  // After create: auto-open the image upload modal
  const handleCreated = (id: number, name: string) => {
  }






  const tableFilters: FilterConfig[] = [

  ]

  const columns: Column<Collaborator>[] = [

    {
      key: 'name',
      label: t('collaborator.name', 'Name'),
    },
 
  ]

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load Collaborators.</p>
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
            Collaborators
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Manage your Collaborators
          </p>
        </div>

        <Button onClick={openAdd} leftIcon={<HiPlus size={15} />}>
          Add Collaborator
        </Button>
      </div>

      {/* DataTable — search + filter + pagination built-in */}
      <DataTable<Collaborator>
        columns={columns}
        data={Collaborators}
        rowKey="id"
        loading={isLoading}
        searchKeys={['name']}
        searchPlaceholder={t('collaborator.searchPlaceholder', 'Search by name')}
        filters={tableFilters}
        emptyMessage={t('collaborator.noCollaborators', 'No Collaborators found. Add your first one!')}
      // toolbar prop removed
      />

      {/* Add / Edit modal */}
      <CollaboratorFormModal
        open={formModal.open}
        onClose={closeForm}
        collaborator={formModal.collaborator}
        onCreated={(id) => {
          // Find the name of the just-created specialist from the form is not possible here,
          // so we pass a temporary label; the image modal shows the id as fallback
          handleCreated(id, t('collaborator.newCollaborator', 'New Collaborator'))
        }}
      />



      
    </div>
  )
}