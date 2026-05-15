// ─── BundleDetailsPage ────────────────────────────────────────────────────────
//
//  Reached via navigate(`/product-bundles/:id`)
//  Shows:
//    - Bundle summary card (name, prices, qty, image)
//    - BundleDetailsPanel → list of products with individual remove
//    - Edit button → opens BundleFormModal in edit mode

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HiArrowLeft, HiPencil, HiPhotograph } from 'react-icons/hi'
import { Button } from '@/components/shared'
import { useGetProductBundleQuery } from '../services/productBundleApi'
import BundleDetailsPanel from '../components/BundleDetailsPanel'
import BundleFormModal from '../components/BundleFormModal'
import BundleImageModal from '../components/BundleImageModal'

export default function BundleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const bundleId = Number(id)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: bundle, isLoading, isError } = useGetProductBundleQuery(bundleId)

  const [editModal, setEditModal] = useState(false)
  const [imageModal, setImageModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !bundle) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-[var(--danger)]">Failed to load bundle details.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const discount = bundle.priceBefore > 0
    ? Math.round(((bundle.priceBefore - bundle.bundlePrice) / bundle.priceBefore) * 100)
    : 0

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
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{bundle.nameEn}</h1>
          <p className="text-sm text-[var(--text-muted)]" dir="rtl">{bundle.nameAr}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setImageModal(true)}
            leftIcon={<HiPhotograph size={14} />}
          >
            {bundle.imageUrl ? 'Change Image' : 'Upload Image'}
          </Button>
          <Button onClick={() => setEditModal(true)} leftIcon={<HiPencil size={14} />}>
            {t('common.edit', 'Edit')}
          </Button>
        </div>
      </div>

      {/* ── Summary card ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

        {/* Image */}
        <div className="sm:col-span-1">
          {bundle.imageUrl ? (
            <img
              src={bundle.imageUrl}
              alt={bundle.nameEn}
              className="w-full aspect-square rounded-[var(--radius-lg)] object-cover border border-[var(--border)]"
            />
          ) : (
            <div className="w-full aspect-square rounded-[var(--radius-lg)] bg-[var(--bg-hover)]
              border border-[var(--border)] flex items-center justify-center">
              <HiPhotograph size={32} className="text-[var(--text-muted)]" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Bundle Price', value: bundle.bundlePrice.toFixed(2), accent: true },
            { label: 'Price Before', value: bundle.priceBefore.toFixed(2), strike: true },
            { label: 'Discount', value: discount > 0 ? `${discount}%` : '—', green: discount > 0 },
            { label: 'Qty Available', value: String(bundle.qty) },
            { label: 'Products', value: String(bundle.detail.length) },
          ].map(({ label, value, accent, strike, green }) => (
            <div key={label} className="p-3 rounded-[var(--radius)] bg-[var(--bg-hover)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
              <p className={`text-lg font-semibold mt-0.5 ${
                accent ? 'text-[var(--accent)]' :
                strike ? 'text-[var(--text-muted)] line-through' :
                green ? 'text-green-600' :
                'text-[var(--text-primary)]'
              }`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {bundle.description && (
        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Description</p>
          <p className="text-sm text-[var(--text-secondary)]">{bundle.description}</p>
        </div>
      )}

      {/* ── Products in bundle ───────────────────────────────────────────── */}
      <div>
        <div className="border-b border-[var(--border)] pb-1 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Products in Bundle ({bundle.detail.length})
          </span>
        </div>
        <BundleDetailsPanel bundleId={bundleId} details={bundle.detail} />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <BundleFormModal
        open={editModal}
        onClose={() => setEditModal(false)}
        bundle={bundle}
      />

      <BundleImageModal
        open={imageModal}
        onClose={() => setImageModal(false)}
        bundleId={bundleId}
        bundleName={bundle.nameEn}
      />
    </div>
  )
}
