// ─── EditProductPurchaseModal ─────────────────────────────────────────────────
//
//  Edit an existing product purchase order.
//  Reuses PurchaseHeaderFields + PurchaseDetailRow.
//  Prefills all header fields + detail rows from the fetched purchase.
//  Detail rows that existed on the server carry a `detailId` for the backend.

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus } from 'react-icons/hi'
import { Modal, Button, ConfirmModal } from '@/components/shared'
import { useUpdatePurchaseMutation, useGetPurchaseQuery, useDeletePurchaseDetailMutation } from '../services/purchaseApi'
import PurchaseHeaderFields from './PurchaseHeaderFields'
import PurchaseDetailRow, { type ProductDetailRow } from './PurchaseDetailRow'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  vendorId:     z.coerce.number().min(1, 'Vendor is required'),
  storeId:      z.coerce.number().min(1, 'Store is required'),
  branchId:     z.coerce.number().min(1, 'Branch is required'),
  note:         z.string().default(''),
})

type FormValues = z.infer<typeof schema>

// Existing rows carry detailId; new rows added during edit do not.
type EditDetailRow = ProductDetailRow & { detailId?: number }

const EMPTY_ROW = (): EditDetailRow => ({
  _productId: undefined,
  productDetailId: 0,
  purchasePrice: 0,
  qty: 1,
})

interface EditProductPurchaseModalProps {
  open: boolean
  purchaseId: number
  onClose: () => void
  onUpdated?: () => void
}

export default function EditProductPurchaseModal({
  open,
  purchaseId,
  onClose,
  onUpdated,
}: EditProductPurchaseModalProps) {
  const { t } = useTranslation()
  const [updatePurchase, { isLoading: isSaving }] = useUpdatePurchaseMutation()
  const [deleteDetail, { isLoading: isDeleting }] = useDeletePurchaseDetailMutation()
  const [rowToDelete, setRowToDelete] = useState<{ index: number, detailId: number } | null>(null)

  // Skip fetching when modal is closed to avoid stale requests
  const { data: purchase, isLoading: isFetching } = useGetPurchaseQuery(purchaseId, {
    skip: !open || !purchaseId,
  })

  const [rows, setRows] = useState<EditDetailRow[]>([EMPTY_ROW()])
  const [rowError, setRowError] = useState('')

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchaseDate: new Date().toISOString().split('T')[0],
      vendorId: 0, storeId: 0, branchId: 0, note: '',
    },
  })

  // Prefill form + rows when data arrives
  useEffect(() => {
    if (!purchase) return

    // Normalise date: "2025-10-19T00:00:00" → "2025-10-19"
    const dateOnly = purchase.purchaseDate.split('T')[0]

    reset({
      purchaseDate: dateOnly,
      vendorId: purchase.vendorId,
      storeId: purchase.storeId,
      branchId: purchase.branchId,
      note: purchase.note ?? '',
    })

    setRows(
      purchase.details.map((d) => ({
        detailId: d.detailId,
        // _productId drives the variant dropdown; prefill from the detail
        _productId: d.productId,
        productDetailId: d.productDetailId,
        purchasePrice: d.purchasePrice,
        qty: d.qty,
      }))
    )
  }, [purchase, reset])

  const handleClose = () => {
    reset()
    setRows([EMPTY_ROW()])
    setRowError('')
    onClose()
  }

  const updateRow = (i: number, row: EditDetailRow) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? row : r)))

  const removeRow = (i: number) => {
    const row = rows[i]
    if (row.detailId) {
      setRowToDelete({ index: i, detailId: row.detailId })
    } else {
      setRows((prev) => (prev.length === 1 ? [EMPTY_ROW()] : prev.filter((_, idx) => idx !== i)))
    }
  }

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return
    try {
      await deleteDetail(rowToDelete.detailId).unwrap()
      toast.success(t('common.success'))
      setRows((prev) => (prev.length === 1 ? [EMPTY_ROW()] : prev.filter((_, idx) => idx !== rowToDelete.index)))
      setRowToDelete(null)
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  const onSubmit = async (values: FormValues) => {
    const invalid = rows.some((r) => !r.productDetailId || r.qty < 1 || r.purchasePrice < 0)
    if (invalid) {
      setRowError('Complete all product rows or remove incomplete ones.')
      return
    }
    setRowError('')

    try {
      await updatePurchase({
        id: purchaseId,
        ...values,
        details: rows.map(({ _productId: _, ...r }) => r),
      }).unwrap()
      toast.success(t('common.success'))
      handleClose()
      onUpdated?.()
    } catch (error: any) {
                      toast.error(getApiError(error, t('common.error')))
                    }
  }

  const grandTotal = rows.reduce((sum, r) => sum + r.purchasePrice * r.qty, 0)
  const isLoading = isFetching || isSaving

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[var(--border)] pb-1 mb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</span>
    </div>
  )

  return (
    <>
      <Modal
      open={open}
      onClose={handleClose}
      title={`Edit Purchase #${purchaseId}`}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSaving} disabled={isFetching}>
            {t('common.save', 'Save')}
          </Button>
        </>
      }
    >
      {isFetching ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          <SectionHeading title="Purchase Info" />
          <PurchaseHeaderFields control={control} register={register} errors={errors} />

          <div className="flex items-center justify-between mt-1">
            <SectionHeading title="Products" />
           
          </div>

          {/* Column header hints */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-3 -mb-2">
            {['#', 'Product', 'Variant', 'Unit Price', 'Qty', 'Total', ''].map((h, i) => (
              <div
                key={i}
                className={`text-xs text-[var(--text-muted)] font-medium ${
                  i === 0 ? 'col-span-1 text-center' :
                  i === 1 ? 'col-span-4' :
                  i === 2 ? 'col-span-3' :
                  i === 3 ? 'col-span-2' :
                  i === 4 ? 'col-span-1' :
                  i === 5 ? 'col-span-1 text-center' : 'col-span-1'
                }`}
              >
                {h}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <PurchaseDetailRow
                key={i}
                index={i}
                value={row}
                onChange={(r) => updateRow(i, { ...r, detailId: row.detailId })}
                onRemove={() => removeRow(i)}
              />
            ))}
          </div>
          <button
              type="button"
              onClick={() => setRows((prev) => [...prev, EMPTY_ROW()])}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
            >
              <HiPlus size={13} /> Add Row
            </button>
          {rowError && <p className="text-xs text-[var(--danger)]">{rowError}</p>}

          <div className="flex justify-end">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius)] bg-[var(--accent-soft)] border border-[var(--accent)]">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Grand Total</span>
              <span className="text-base font-bold text-[var(--accent)]">{grandTotal.toLocaleString()}</span>
            </div>
          </div>

        </div>
      )}
      </Modal>

      <ConfirmModal
        open={!!rowToDelete}
        onClose={() => setRowToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title={t('common.confirmDeleteTitle', 'Confirm Delete')}
        message={t('common.confirmDeleteMsg', 'Are you sure you want to delete this?')}
        variant="delete"
      />
    </>
  )
}