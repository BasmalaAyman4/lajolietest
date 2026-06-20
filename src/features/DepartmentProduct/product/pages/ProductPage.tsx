// ─── ProductPage ──────────────────────────────────────────────────────────────
//
//  Lists products with backend-side search and pagination via DataTable.
//  Add → ProductFormModal (navigates to details page on success)
//  Delete → ConfirmModal

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal } from '@/components/shared'
import type { Column } from '@/components/shared/Table/Table'
import DataTable from '@/components/shared/Table/DataTable'
import { useGetProductsQuery, useDeleteProductMutation } from '../services/productApi'
import type { Product } from '../types'
import ProductFormModal from '../components/ProductFormModal'
import { useDebounce } from '@/hooks/useDebounce'
import { readPersistedLimit } from '@/utils/tableUtils'   // 👈 import the util

export default function ProductPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // ── Search & pagination ──────────────────────────────────────────────────
  const [page, setPage] = useState(1)
// ✅ After — reads persisted value on mount
  const [limit, setLimit] = useState(() => readPersistedLimit('products'))  // 👈 read persisted value on mount

const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 400)

  const handleSearch = useCallback((val: string) => {
    setSearchInput(val)
    setPage(1)
  }, [])

  const handleLimitChange = useCallback((l: number) => {
    setLimit(l)
    setPage(1)
  }, [])

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetProductsQuery({
    pageNo: page,
    pageSize: limit,
    searchText: debouncedSearch || undefined,
  })

  const products = data?.products ?? []
  const total    = (data?.lastPageNo ?? 1) * limit   // convert lastPageNo → total rows

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  // ── Modal state ──────────────────────────────────────────────────────────
  const [formModal, setFormModal]   = useState<{ open: boolean }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteProduct(deleteModal.id).unwrap()
      toast.success('Product deleted')
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModal({ open: false, id: null })
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<Product>[] = [
    {
      key:'id',
      label:'id',
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">{row.id}</span>
      ),
    },
    {
      key: 'enName',
      label: 'Name',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[var(--text-primary)]">{row.enName}</span>
          <span className="text-xs text-[var(--text-muted)]" dir="rtl">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'brandName',
      label: 'Brand',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
          {row.brandName}
        </span>
      ),
    },
    { key: 'categoryName', label: 'Category' },
    {
      key: 'productTypeName',
      label: 'Type',
      render: (row) => <span className="text-xs text-[var(--text-secondary)]">{row.productTypeName}</span>,
    },
    {
      key: 'quantity',
      label: 'Qty',
      align: 'center',
      width: '64px',
      render: (row) => <span className="text-sm font-semibold">{row.quantity}</span>,
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
            href={`/products/${row.id}`}
            className="px-2 py-1 rounded text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
            onClick={(e) => {
              // let Ctrl/Cmd+click open new tab natively
              if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault()
                navigate(`/products/${row.id}`)
              }
            }}
          >
            Details
          </a>
          {!row.isDeleted && (
  <button
    type="button"
    onClick={() => setDeleteModal({ open: true, id: row.id })}
    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
  >
    <HiTrash size={15} />
  </button>
)}
       
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load products.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Products</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your product catalog</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })} leftIcon={<HiPlus size={15} />}>
          Add Product
        </Button>
      </div>

      {/* Table — server-side mode: pass total/page/limit/onPageChange/onLimitChange */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
        <DataTable<Product>
          columns={columns}
          data={products}
          rowKey="id"
          tableKey="products"
          loading={isLoading}
          emptyMessage="No products found. Add your first one!"
          // ── server-side search ──
          onSearch={handleSearch}
          searchPlaceholder="Search products…"
          // ── server-side pagination ──
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          // ── toolbar extras ──
      
          // ── hide the actions column from the column picker by default ──
          defaultHiddenKeys={[]}
          getRowHref={(row) => `/products/${row.id}`}

        />
      </div>

      {/* Add modal */}
      <ProductFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        onCreated={(newId) => navigate(`/products/${newId}`)}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  )
}