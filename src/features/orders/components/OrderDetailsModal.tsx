import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiPhotograph, HiUser, HiPhone, HiCalendar, HiCreditCard, HiShoppingBag } from 'react-icons/hi'
import { Modal, Button, StatusBadge, Select } from '@/components/shared'
import type { Order } from '../types'
import { useGetAllowedTransitionsQuery, useUpdateOrderStatusMutation } from '../services/orderApi'
import type { BadgeVariant } from '@/components/shared/StatusBadge'
import { getApiError } from '@/services/apiHelpers'

interface OrderDetailsModalProps {
  open: boolean
  onClose: () => void
  order: Order | null
}

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

const getPaymentStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return 'Paid'
    case 2:
      return 'Pending'
    case 3:
      return 'Failed'
    case 4:
      return 'Refunded'
    default:
      return `Status ${status}`
  }
}

const getPaymentMethodLabel = (method: number) => {
  switch (method) {
    case 1:
      return 'Cash on Delivery (COD)'
    case 2:
      return 'Online / Card'
    case 3:
      return 'Wallet'
    case 4:
      return 'Instapay'
    default:
      return `Method ${method}`
  }
}

export default function OrderDetailsModal({
  open,
  onClose,
  order,
}: OrderDetailsModalProps) {
  const { t } = useTranslation()

  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Transitions query (only runs when modal is open and order is present)
  const { data: transitions = [], isLoading: isTransitionsLoading } =
    useGetAllowedTransitionsQuery(order?.id ?? 0, { skip: !open || !order })

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation()

  useEffect(() => {
    if (transitions.length > 0) {
      setSelectedStatus('')
    }
  }, [transitions])

  if (!order) return null

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return
    try {
      await updateStatus({
        id: order.id,
        status: Number(selectedStatus),
      }).unwrap()
      toast.success('Order status updated successfully')
      setSelectedStatus('')
    }catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }
  }

  const selectOptions = transitions.map((t) => ({
    value: t.id,
    label: t.name,
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Order Details (Order #${order.id})`}
      size="xl"
      footer={
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-hover)]">
          {/* Customer info */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <HiUser size={12} /> Customer Info
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {order.userName}
            </span>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <HiPhone size={12} /> {order.userMobile}
            </span>
          </div>

          {/* Order info */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <HiCalendar size={12} /> Order Info
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Date: {order.createdDate}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              Channel: {order.orderAddMethodName}
            </span>
          </div>

          {/* Payment & Status info */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <HiCreditCard size={12} /> Payment Info
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Method: {getPaymentMethodLabel(order.paymentMethod)}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge
                variant={order.paymentStatus === 1 ? 'success' : 'warning'}
                label={getPaymentStatusLabel(order.paymentStatus)}
              />
              <StatusBadge
                variant={getStatusVariant(order.status)}
                label={order.status}
              />
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
            <HiShoppingBag /> Order Items ({order.orderDetails.length})
          </h3>
          <div className="border border-[var(--border)] rounded-lg overflow-hidden">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-[var(--table-bg)] border-b border-[var(--border)]">
                  <th className="px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)]">Product</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)]">Color & Size</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] text-right">Unit Price</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] text-center">Qty</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderDetails.map((item, index) => {
                  const itemImage = item.productImage || item.bundleImage
                  const finalTotal = item.qty * item.netPrice

                  return (
                    <tr
                      key={`${item.productDetailId}-${index}`}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-md border border-[var(--border)] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-md border border-[var(--border)] flex items-center justify-center shrink-0">
                              <HiPhotograph className="text-[var(--text-muted)]" size={16} />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-[var(--text-primary)] line-clamp-2">
                              {item.productName || item.bundleName}
                            </span>
                            {item.bundleName && (
                              <span className="text-[10px] text-[var(--accent)] font-semibold uppercase tracking-wider mt-0.5">
                                Bundle Item
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-[var(--text-secondary)]">
                            Color: <span className="font-medium text-[var(--text-primary)]">{item.color || 'No Color'}</span>
                          </span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            Size: <span className="font-medium text-[var(--text-primary)]">{item.size || 'No Size'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-[var(--text-primary)]">
                            EGP {item.netPrice.toLocaleString()}
                          </span>
                          {item.discountValue && item.discountValue > 0 && (
                            <span className="text-[10px] text-[var(--danger)] line-through">
                              EGP {item.mainPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {item.qty}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                        EGP {finalTotal.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary & Status Update Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Change section */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Update Status
            </h4>
            {isTransitionsLoading ? (
              <div className="py-4 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : transitions.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">
                No active status transitions allowed for this order state.
              </p>
            ) : (
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    options={selectOptions}
                    placeholder="Choose transition..."
                  />
                </div>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus || isUpdating}
                  loading={isUpdating}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Price details totals */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] flex flex-col gap-2 justify-center">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span className="font-medium text-[var(--text-primary)]">
                EGP {order.mainPrice.toLocaleString()}
              </span>
            </div>
            {order.totalProductDiscount && order.totalProductDiscount > 0 ? (
              <div className="flex items-center justify-between text-sm text-[var(--danger)]">
                <span>Product Discount</span>
                <span>- EGP {order.totalProductDiscount.toLocaleString()}</span>
              </div>
            ) : null}
            <div className="h-px bg-[var(--border)] my-1" />
            <div className="flex items-center justify-between text-base font-bold">
              <span className="text-[var(--text-primary)]">Total Paid</span>
              <span className="text-[var(--accent)]">
                EGP {order.netOrderPaid.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
