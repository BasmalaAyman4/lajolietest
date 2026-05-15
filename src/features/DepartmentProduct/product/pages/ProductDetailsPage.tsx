// ─── ProductDetailsPage ───────────────────────────────────────────────────────
//
//  Shows the full details of a product in four tabs:
//   1. Basic Information  (view + edit via ProductFormModal)
//   2. Colors & Sizes / Sizes & Pricing / Colors  (depends on flags)
//   3. Images
//   4. Packaging

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  FiInfo,
  FiImage,
  FiPackage,
} from 'react-icons/fi'

import { MdPalette } from 'react-icons/md'
import { TbRuler } from 'react-icons/tb'
import { useGetProductQuery } from '../services/productApi'
import ProductFormModal from '../components/ProductFormModal'
import ColorSizeManagementSection from '../components/ColorSizeManagementSection'
import ColorImageManagement from '../components/ColorImageManagement'
import ProductPackagingSection from '../components/ProductPackagingSection'
import StatusBadge from '@/components/shared/StatusBadge'

type Tab = 0 | 1 | 2 | 3

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)

  const { data: product, isLoading, isError, refetch } = useGetProductQuery(productId, {
    skip: !productId,
  })

  const [activeTab, setActiveTab] = useState<Tab>(0)
  const [editOpen, setEditOpen] = useState(false)

  const handleUpdate = () => refetch()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="rounded-[var(--radius)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 m-4">
        {isError ? 'Failed to load product details. Please try again.' : 'Product not found.'}
      </div>
    )
  }

  const isDisappearColor = Boolean(product.isDisappearColor)
  const isDisappearSize = Boolean(product.isDisappearSize)

  const tabs = [
    { icon: <FiInfo size={16} />, label: 'Basic Information' },
    {
      icon: isDisappearColor ? <TbRuler size={16} /> : <MdPalette size={16} />,
      label: isDisappearColor ? 'Sizes & Pricing' : isDisappearSize ? 'Colors' : 'Colors & Sizes',
    },
    {
      icon: <FiImage size={16} />,
      label: isDisappearColor ? 'Product Images' : 'Colors & Images',
    },
    { icon: <FiPackage size={16} />, label: 'Product Packaging' },
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in p-1">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Product Details</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {product.enName} · <span dir="rtl">{product.name}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] gap-0 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx as Tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors
              ${activeTab === idx
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}

      {/* Tab 0 — Basic Info */}
      {activeTab === 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <span className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <FiInfo size={16} /> Product Basic Information
            </span>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius)] border border-[var(--border)]
                text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors"
            >
              Edit Details
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                ['Arabic Name', product.name],
                ['English Name', product.enName],
                ['Brand ID', product.brandId],
                ['Category ID', product.categoryId],
                ['Product Type ID', product.productTypeId],
                ['Vegan', product.isVegan ? 'Yes' : 'No'],
                ['For Children', product.forChildren ? 'Yes' : 'No'],
                ['Can Try', product.canTry ? 'Yes' : 'No'],
                ['Disappear Color', product.isDisappearColor ? 'Yes' : 'No'],
                ['Disappear Size', product.isDisappearSize ? 'Yes' : 'No'],
                ['Sensitive Skin', product.isSensitiveSkin ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">{label}</p>
                  <p className="text-sm text-[var(--text-primary)]">{String(value)}</p>
                </div>
              ))}
            </div>

            {/* Sub-categories */}
            {(product.subCategories ?? []).length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-[var(--text-muted)] font-medium mb-1">Sub-categories</p>
                <div className="flex flex-wrap gap-1">
                  {product.subCategories.map((s) => (
                    <span key={s.id} className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rich text fields */}
            {product.description && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[var(--text-muted)] mb-1">Description</p>
                <div className="text-sm text-[var(--text-primary)]" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
            {product.howToUse && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[var(--text-muted)] mb-1">How to Use</p>
                <div className="text-sm text-[var(--text-primary)]" dangerouslySetInnerHTML={{ __html: product.howToUse }} />
              </div>
            )}
            {product.ingredients && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[var(--text-muted)] mb-1">Ingredients</p>
                <div className="text-sm text-[var(--text-primary)]" dangerouslySetInnerHTML={{ __html: product.ingredients }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1 — Colors & Sizes */}
      {activeTab === 1 && (
        <ColorSizeManagementSection
          productId={productId}
          product={product}
          onUpdate={handleUpdate}
          isDisappearColor={isDisappearColor}
          isDisappearSize={isDisappearSize}
        />
      )}

      {/* Tab 2 — Images */}
      {activeTab === 2 && (
        <ColorImageManagement
          productId={productId}
          product={product}
          isDisappearColor={isDisappearColor}
        />
      )}

      {/* Tab 3 — Packaging */}
      {activeTab === 3 && (
        <ProductPackagingSection
          productId={productId}
          product={product}
          onUpdate={handleUpdate}
        />
      )}

      {/* Edit modal */}
      <ProductFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        product={product}
        onCreated={() => {}}
      />
    </div>
  )
}