import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Modal, Button, Select } from '@/components/shared'
import { useGetAllowedTransitionsQuery, useUpdateOrderStatusMutation } from '../services/orderApi'
import { getApiError } from '@/services/apiHelpers'

interface ChangeStatusModalProps {
  open: boolean
  onClose: () => void
  orderId: number
  currentStatus: string
}

export default function ChangeStatusModal({
  open,
  onClose,
  orderId,
  currentStatus,
}: ChangeStatusModalProps) {
  const { t } = useTranslation()

  // Fetch allowed transitions for this order
  const { data: transitions = [], isLoading: isTransitionsLoading, isError } =
    useGetAllowedTransitionsQuery(orderId, { skip: !open })

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation()

  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Reset selection when transitions load
  useEffect(() => {
    if (transitions.length > 0) {
      setSelectedStatus('')
    }
  }, [transitions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStatus) {
      toast.error('Please select a status')
      return
    }

    try {
      await updateStatus({
        id: orderId,
        status: Number(selectedStatus),
      }).unwrap()
      toast.success('Order status updated successfully')
      onClose()
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }
  }

  const selectOptions = transitions.map((t) => ({
    value: t.id,
    label: t.name,
  }))

  const footer = (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating}>
        {t('common.cancel', 'Cancel')}
      </Button>
      <Button
        type="submit"
        form="change-status-form"
        disabled={isUpdating || !selectedStatus || transitions.length === 0}
        loading={isUpdating}
      >
        {t('common.save', 'Save')}
      </Button>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Change Status (Order #${orderId})`}
      size="sm"
      footer={footer}
    >
      <form id="change-status-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <span className="text-xs text-[var(--text-muted)] block mb-1">Current Status</span>
          <span className="text-sm font-semibold text-[var(--text-primary)] capitalize bg-[var(--bg-hover)] px-2.5 py-1.5 rounded-md inline-block">
            {currentStatus}
          </span>
        </div>

        {isTransitionsLoading ? (
          <div className="py-6 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-sm text-[var(--danger)] py-2">
            Failed to load allowed transitions.
          </p>
        ) : transitions.length === 0 ? (
          <div className="py-2">
            <p className="text-sm text-[var(--text-muted)] italic">
              No status transitions are allowed for this order in its current state.
            </p>
          </div>
        ) : (
          <Select
            label="New Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={selectOptions}
            placeholder="Select transition status…"
            required
          />
        )}
      </form>
    </Modal>
  )
}
