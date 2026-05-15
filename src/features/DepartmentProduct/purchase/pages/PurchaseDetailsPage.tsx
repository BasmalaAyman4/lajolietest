// ─── PurchaseDetailsPage ──────────────────────────────────────────────────────
//
//  Shows full purchase: header info + product detail rows with delete.
//  Read-only — purchases are not editable after creation (only detail lines
//  can be removed via deleteDetail).

import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HiArrowLeft, HiCalendar, HiOfficeBuilding, HiUser } from 'react-icons/hi'
import { Button } from '@/components/shared'
import { useGetPurchaseQuery } from '../services/purchaseApi'
import PurchaseDetailsPanel from '../components/PurchaseDetailsPanel'

// Formats ISO date "2025-10-19T00:00:00" → "19 Oct 2025"
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function PurchaseDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const purchaseId = Number(id)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: purchase, isLoading, isError } = useGetPurchaseQuery(purchaseId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !purchase) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-[var(--danger)]">Failed to load purchase.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const total = purchase.details.reduce((s, d) => s + d.purchasePrice * d.qty, 0)
  const totalQty = purchase.details.reduce((s, d) => s + d.qty, 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center
            text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <HiArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Purchase #{purchase.id}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{formatDate(purchase.purchaseDate)}</p>
        </div>
      </div>

      {/* ── Info cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Vendor */}
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <HiUser size={15} className="text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-muted)]">Vendor</p>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">ID: {purchase.vendorId}</p>
          </div>
        </div>

        {/* Store / Branch */}
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <HiOfficeBuilding size={15} className="text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-muted)]">Store / Branch</p>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              Store {purchase.storeId} · Branch {purchase.branchId}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <HiCalendar size={15} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Purchase Date</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(purchase.purchaseDate)}</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: purchase.details.length },
          { label: 'Total Qty',   value: totalQty.toLocaleString() },
          { label: 'Grand Total', value: total.toLocaleString(), accent: true },
          { label: 'Note',        value: purchase.note || '—', small: true },
        ].map(({ label, value, accent, small }) => (
          <div key={label} className="p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-hover)]">
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
            <p className={`mt-0.5 font-semibold ${
              accent ? 'text-lg text-[var(--accent)]' :
              small  ? 'text-sm text-[var(--text-secondary)]' :
                       'text-lg text-[var(--text-primary)]'
            }`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Product details ──────────────────────────────────────────────── */}
      <div>
        <div className="border-b border-[var(--border)] pb-1 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Product Details ({purchase.details.length})
          </span>
        </div>
        <PurchaseDetailsPanel details={purchase.details} />
      </div>

    </div>
  )
}
