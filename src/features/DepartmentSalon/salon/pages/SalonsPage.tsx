// ─── SalonsPage ───────────────────────────────────────────────────────────────
//
//  Route: /admin/salons
//  Lists all salons with search, status-filter badges, and row-click navigation
//  to SalonDetailPage. Uses the shared DataTable → Table components.

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiPlus, HiCheck, HiX, HiOfficeBuilding } from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, type FilterConfig } from '@/components/shared'
import type { SalonListItem } from '../types'
import { useGetSalonsQuery } from '../services/salonApi'
import SalonFormModal from '../components/SalonFormModal'

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success)]/10 text-[var(--success)]">
      <HiCheck size={11} /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--border)] text-[var(--text-muted)]">
      <HiX size={11} /> No
    </span>
  )
}

// ── Column definitions ────────────────────────────────────────────────────────


// ── Filters ───────────────────────────────────────────────────────────────────
const FILTERS: FilterConfig[] = [
  {
    key: 'isVerify',
    label: 'Verification',
    options: [
      { label: 'Verified', value: 'true' },
      { label: 'Unverified', value: 'false' },
    ],
  },
  {
    key: 'isTrusted',
    label: 'Trust',
    options: [
      { label: 'Trusted', value: 'true' },
      { label: 'Not Trusted', value: 'false' },
    ],
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SalonsPage() {
  const navigate = useNavigate()
  const { data: salons = [], isLoading } = useGetSalonsQuery()

  const [addModal, setAddModal] = useState(false)
  const [search, setSearch]     = useState('')

  // ── Client-side search (DataTable also handles this internally,
  //    but we expose it here for the stats bar)
  const filteredCount = useMemo(() => {
    if (!search.trim()) return salons.length
    const q = search.toLowerCase()
    return salons.filter(
      (s) =>
        s.nameEn.toLowerCase().includes(q) ||
        s.nameAr.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.telephone.includes(q),
    ).length
  }, [salons, search])
const COLUMNS: Column<SalonListItem>[] = [
  {
    key: 'nameEn',
    label: 'Salon',
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-[var(--radius)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
          <HiOfficeBuilding size={14} className="text-[var(--accent)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{row.nameEn}</p>
          <p className="text-xs text-[var(--text-muted)] truncate" dir="rtl">{row.nameAr}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'telephone',
    label: 'Telephone',
    render: (row) => (
      <span className="text-sm text-[var(--text-secondary)] font-mono">{row.telephone}</span>
    ),
  },
  {
    key: 'ownerName',
    label: 'Owner',
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <p className="text-sm text-[var(--text-primary)] truncate">{row.ownerName}</p>
        <p className="text-xs text-[var(--text-muted)] font-mono truncate">{row.ownerNationalId}</p>
      </div>
    ),
  },
  {
    key: 'mainOfficeAddress',
    label: 'Address',
    render: (row) => (
      <p className="text-xs text-[var(--text-muted)] max-w-[220px] truncate" title={row.mainOfficeAddress}>
        {row.mainOfficeAddress || '—'}
      </p>
    ),
  },
  {
    key: 'isVerify',
    label: 'Verified',
    filterOptions: [
      { label: 'Verified', value: 'true' },
      { label: 'Unverified', value: 'false' },
    ],
    render: (row) => <StatusBadge active={row.isVerify} />,
  },
  {
    key: 'isTrusted',
    label: 'Trusted',
    filterOptions: [
      { label: 'Trusted', value: 'true' },
      { label: 'Not Trusted', value: 'false' },
    ],
    render: (row) => <StatusBadge active={row.isTrusted} />,
  },
  {
    key:'isPhoneVerified',
    label: 'Account Verified',
    render: (row) => <StatusBadge active={row.isPhoneVerified} />,
  },
  {
    key: 'hijabSection',
    label: 'Features',
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.hijabSection && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-500">
            Hijab
          </span>
        )}
        {row.menWorker && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500">
            Men Worker
          </span>
        )}
        {!row.childrenNotAllowed && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-500">
            Kids OK
          </span>
        )}
      </div>
    ),
  },
    {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        width: '110px',
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <a
              type="button"
              href={`/salon-detail/${row.id}`}
              className="px-2 py-1 rounded text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
              onClick={(e) => {
                // let Ctrl/Cmd+click open new tab natively
                if (!e.ctrlKey && !e.metaKey) {
                  e.preventDefault()
                  navigate(`/salon-detail/${row.id}`)
                }
              }}
            >
              Details
            </a>

         
          </div>
        ),
      },
]
  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Salons</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {isLoading ? 'Loading…' : `${filteredCount} of ${salons.length} salons`}
          </p>
        </div>
        <Button leftIcon={<HiPlus size={15} />} onClick={() => setAddModal(true)}>
          Add Salon
        </Button>
      </div>

      {/* ── Summary cards ───────────────────────────────────────────────────── */}
      {!isLoading && salons.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Total',
              value: salons.length,
              color: 'text-[var(--text-primary)]',
              bg: 'bg-[var(--bg-card)]',
            },
            {
              label: 'Verified',
              value: salons.filter((s) => s.isVerify).length,
              color: 'text-[var(--success)]',
              bg: 'bg-[var(--success)]/5',
            },
            {
              label: 'Trusted',
              value: salons.filter((s) => s.isTrusted).length,
              color: 'text-[var(--accent)]',
              bg: 'bg-[var(--accent-soft)]',
            },
            {
              label: 'Account Verified',
              value: salons.filter((s) => s.isPhoneVerified).length,
              color: 'text-[var(--success)]',
              bg: 'bg-[var(--success)]/5',
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-[var(--radius-lg)] border border-[var(--border)] ${card.bg} px-4 py-3`}
            >
              <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
              <p className={`text-2xl font-semibold mt-0.5 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
        <DataTable<SalonListItem>
          columns={COLUMNS}
          tableKey="salons"
          data={salons}
          rowKey="id"
          loading={isLoading}
          searchKeys={['nameEn', 'nameAr', 'ownerName', 'telephone', 'mainOfficeAddress']}
          searchPlaceholder="Search by name, owner, phone…"
          onSearch={setSearch}
          filters={FILTERS}
          emptyMessage="No salons found."
        />
      </div>

      {/* ── Add Salon modal ─────────────────────────────────────────────────── */}
      <SalonFormModal
        open={addModal}
        onClose={() => setAddModal(false)}
      />
    </div>
  )
}