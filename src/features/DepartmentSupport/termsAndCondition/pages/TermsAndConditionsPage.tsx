import { useState } from 'react'
import { HiPlus } from 'react-icons/hi'
import { Button, DataTable, type Column } from '@/components/shared'

import type { TermsAndConditions } from '../types'
import {
  useGetTermsAndConditionsQuery,
  useGetTermsTypeDropdownQuery,
} from '../services/termsAndConditionsApi'
import TermsAndConditionsFormModal from '../components/TermsAndConditionsFormModal'

export default function TermsAndConditionsPage() {
  const { data: records = [], isLoading, isError } = useGetTermsAndConditionsQuery()
  const { data: typeOptions = [] } = useGetTermsTypeDropdownQuery()

  const [modalOpen, setModalOpen] = useState(false)

  const typeFilterOptions = typeOptions.map((o) => ({ label: o.name, value: o.id }))

  const columns: Column<TermsAndConditions>[] = [
    {
      key: 'termsTypeId',
      label: 'Type',
      filterOptions: typeFilterOptions,
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
          {typeOptions.find((o) => o.id === row.termsTypeId)?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'descriptionEn',
      label: 'Description (EN)',
      render: (row) => (
        <span
          className="line-clamp-2 max-w-sm text-sm text-[var(--text-secondary)]"
          dangerouslySetInnerHTML={{ __html: row.descriptionEn }}
        />
      ),
    },
    {
      key: 'descriptionAr',
      label: 'Description (AR)',
      render: (row) => (
        <span
          dir="rtl"
          className="line-clamp-2 max-w-sm text-sm text-[var(--text-secondary)]"
          dangerouslySetInnerHTML={{ __html: row.descriptionAr }}
        />
      ),
    },
  ]

  if (isError)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load terms and conditions.</p>
      </div>
    )

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Terms & Conditions</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage terms, policies and agreements</p>
        </div>
        <Button onClick={() => setModalOpen(true)} leftIcon={<HiPlus size={15} />}>
          Add Entry
        </Button>
      </div>

      <DataTable<TermsAndConditions>
        columns={columns}
        tableKey="termsAndConditions"
        data={records}
        rowKey="id"
        loading={isLoading}
        emptyMessage="No terms & conditions found."
      />

      <TermsAndConditionsFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}