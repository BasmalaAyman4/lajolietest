// ─── ProductPage ──────────────────────────────────────────────────────────────
//
//  Lists products with backend-side search, sort, filter and pagination via DataTable.
//  Add → ProductFormModal (navigates to details page on success)
//  Delete → ConfirmModal

import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { Button, ConfirmModal, Select } from '@/components/shared'
import type { Column } from '@/components/shared/Table/Table'
import DataTable from '@/components/shared/Table/DataTable'
import { useGetProductsQuery, useDeleteProductMutation } from '../services/productApi'
import type { Product, ProductSortKey, ProductStockStatus } from '../types'
import ProductFormModal from '../components/ProductFormModal'
import { useDebounce } from '@/hooks/useDebounce'
import { readPersistedLimit } from '@/utils/tableUtils'

// ── Frontend column key → backend SortBy value ──────────────────────────────
// Keeps Table/DataTable fully generic; only this page needs to know the
// backend's expected sort key strings.
const SORT_KEY_MAP: Record<string, ProductSortKey> = {
  id: 'id',
  enName: 'enname',
  brandName: 'brand',
  categoryName: 'category',
  salePrice: 'price',
  quantity: 'quantity',
}

const STOCK_STATUS_OPTIONS = [
  { label: 'All Stock', value: '' },
  { label: 'In Stock', value: 'inStock' },
  { label: 'Out of Stock', value: 'outOfStock' },
]

export default function ProductPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // ── URL State Synchronization ────────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams()

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev)
          Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === '') {
              newParams.delete(key)
            } else {
              newParams.set(key, value)
            }
          })
          return newParams
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  // ── Search & pagination ──────────────────────────────────────────────────
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || readPersistedLimit('products')

  const searchInput = searchParams.get('search') || ''
  const debouncedSearch = useDebounce(searchInput, 400)

  const handleSearch = useCallback((val: string) => {
    updateParams({ search: val, page: '1' })
  }, [updateParams])

  const handleLimitChange = useCallback((l: number) => {
    updateParams({ limit: l.toString(), page: '1' })
  }, [updateParams])

  const setPage = useCallback((p: number) => {
    updateParams({ page: p.toString() })
  }, [updateParams])

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sortKey = searchParams.get('sort') || ''
  const sortDir = (searchParams.get('dir') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'

  const handleSort = useCallback((key: string, dir: 'asc' | 'desc') => {
    updateParams({ sort: key, dir, page: '1' })
  }, [updateParams])

  // ── Stock status filter ──────────────────────────────────────────────────
  const stockStatus = (searchParams.get('stock') as ProductStockStatus | '') || ''

  const handleStockStatusChange = useCallback((value: string) => {
    updateParams({ stock: value, page: '1' })
  }, [updateParams])

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetProductsQuery({
    pageNo: page,
    pageSize: limit,
    searchText: debouncedSearch || undefined,
    sortBy: sortKey ? SORT_KEY_MAP[sortKey] : undefined,
    sortDirection: sortKey ? sortDir : undefined,
    stockStatus: stockStatus || undefined,
  })

  const products = data?.products ?? []
  const total    = (data?.lastPageNo ?? 1) * limit

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
  const columns: Column<Product>[] = useMemo(() => [
    {
      key: 'id',
      label: 'id',
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">{row.id}</span>
      ),
    },
    {
      key: 'enName',
      label: 'Name',
      sortable: true,
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
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
          {row.brandName}
        </span>
      ),
    },
    { key: 'categoryName', label: 'Category', sortable: true },
   
    {
      key: 'salePrice',
      label: 'Price',
      align: 'right',
      sortable: true,
      render: (row) => <span className="text-sm font-semibold">{row.salePrice}</span>,
    },
    {
      key: 'quantity',
      label: 'Qty',
      align: 'center',
      width: '64px',
      sortable: true,
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
  ], [navigate])

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load products.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-[calc(100vh-112px)] min-h-[500px]">

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

      {/* Table — server-side mode: search, sort, filter and pagination all hit the backend */}
      <div className="flex-1 flex flex-col min-h-0 rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
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
          // ── server-side sort ──
          onSort={handleSort}
          // ── server-side pagination ──
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          // ── toolbar extras: stock status filter ──
          toolbar={
            <Select
              value={stockStatus}
              onChange={(e) => handleStockStatusChange(e.target.value)}
              options={STOCK_STATUS_OPTIONS}
              className="text-xs py-1.5 px-2 min-w-[180px] max-w-xs"
            />
          }
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