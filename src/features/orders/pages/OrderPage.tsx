import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { HiEye, HiRefresh } from 'react-icons/hi'
import { useDebounce } from '@/hooks/useDebounce'
import { readPersistedLimit } from '@/utils/tableUtils'
import { DataTable, StatusBadge } from '@/components/shared'
import type { Column } from '@/components/shared/Table/Table'
import type { BadgeVariant } from '@/components/shared/StatusBadge'
import type { Order } from '../types'
import { useGetOrdersQuery } from '../services/orderApi'
import OrderDetailsModal from '../components/OrderDetailsModal'
import ChangeStatusModal from '../components/ChangeStatusModal'

const getStatusVariant = (status: string): BadgeVariant => {
  const s = status.toLowerCase()
  if (s.includes('deliver') || s.includes('confirm') || s.includes('paid') || s.includes('success')) {
    return 'success'
  }
  if (s.includes('cancel') || s.includes('fail') || s.includes('reject') || s.includes('system cancel')) {
    return 'danger'
  }
  if (s.includes('prepar') || s.includes('process') || s.includes('shipped') || s.includes('ship')) {
    return 'info'
  }
  return 'warning'
}

export default function OrderPage() {
  const { t } = useTranslation()

  // ── Search & Pagination ──────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(() => readPersistedLimit('orders', 20))
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

  // ── Data Query ───────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetOrdersQuery({
    pageNo: page,
    pageSize: limit,
    searchText: debouncedSearch || undefined,
  })

  const orders = data?.data ?? []
  const total = data?.totalCount ?? 0

  // ── Modal States ─────────────────────────────────────────────────────────
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; order: Order | null }>({
    open: false,
    order: null,
  })

  const [statusModal, setStatusModal] = useState<{
    open: boolean
    orderId: number | null
    currentStatus: string
  }>({
    open: false,
    orderId: null,
    currentStatus: '',
  })

  // ── Columns Definition ────────────────────────────────────────────────────
  const columns: Column<Order>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      render: (row) => <span className="font-semibold">#{row.id}</span>,
    },
    {
      key: 'createdDate',
      label: 'Date',
      width: '120px',
    },
    {
      key: 'userName',
      label: 'Customer',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[var(--text-primary)]">{row.userName}</span>
          <span className="text-xs text-[var(--text-muted)]">{row.userMobile}</span>
        </div>
      ),
    },
    {
      key: 'orderAddMethodName',
      label: 'Channel',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)] font-medium capitalize">
          {row.orderAddMethodName}
        </span>
      ),
    },
    {
      key: 'netOrderPaid',
      label: 'Total Paid',
      align: 'right',
      width: '120px',
      render: (row) => (
        <span className="font-semibold text-[var(--text-primary)]">
          EGP {row.netOrderPaid.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      width: '130px',
      render: (row) => (
        <StatusBadge variant={getStatusVariant(row.status)} label={row.status} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '140px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="View Details"
            onClick={(e) => {
              e.stopPropagation()
              setDetailsModal({ open: true, order: row })
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiEye size={16} />
          </button>
          <button
            type="button"
            title="Change Status"
            onClick={(e) => {
              e.stopPropagation()
              setStatusModal({
                open: true,
                orderId: row.id,
                currentStatus: row.status,
              })
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <HiRefresh size={15} />
          </button>
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">Failed to load orders.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Orders</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage customer orders and status transitions</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
        <DataTable<Order>
          columns={columns}
          data={orders}
          rowKey="id"
          tableKey="orders"
          loading={isLoading}
          emptyMessage="No orders found."
          // ── Search ──
          onSearch={handleSearch}
          searchPlaceholder="Search orders…"
          // ── Pagination ──
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          onRowClick={(row) => setDetailsModal({ open: true, order: row })}
        />
      </div>

      {/* Details Modal */}
      {detailsModal.open && (
        <OrderDetailsModal
          open={detailsModal.open}
          onClose={() => setDetailsModal({ open: false, order: null })}
          order={detailsModal.order}
        />
      )}

      {/* Change Status Modal */}
      {statusModal.open && statusModal.orderId !== null && (
        <ChangeStatusModal
          open={statusModal.open}
          onClose={() =>
            setStatusModal({ open: false, orderId: null, currentStatus: '' })
          }
          orderId={statusModal.orderId}
          currentStatus={statusModal.currentStatus}
        />
      )}
    </div>
  )
}
