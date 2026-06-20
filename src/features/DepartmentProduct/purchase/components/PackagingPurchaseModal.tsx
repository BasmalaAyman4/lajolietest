// ─── PackagingPurchaseModal ───────────────────────────────────────────────────
//
//  Create a packaging purchase order.
//  Same header fields as product purchase, but rows use PackagingDetailRow.

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus } from 'react-icons/hi'
import { Modal, Button } from '@/components/shared'
import { useSavePackagingPurchaseMutation } from '../services/purchaseApi'
import PurchaseHeaderFields from './PurchaseHeaderFields'
import PackagingDetailRow from './PackagingDetailRow'
import type { PackagingPurchaseDetailRequest } from '../types'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  vendorId:     z.coerce.number().min(1, 'Vendor is required'),
  storeId:      z.coerce.number().min(1, 'Store is required'),
  branchId:     z.coerce.number().min(1, 'Branch is required'),
  note:         z.string().default(''),
})

type FormValues = z.infer<typeof schema>

const EMPTY_ROW = (): PackagingPurchaseDetailRequest => ({
  packagingId: 0,
  purchasePrice: 0,
  qty: 1,
})

interface PackagingPurchaseModalProps {
  open: boolean
  onClose: () => void
  onCreated?: (id: number) => void
}

export default function PackagingPurchaseModal({ open, onClose, onCreated }: PackagingPurchaseModalProps) {
  const { t } = useTranslation()
  const [savePackagingPurchase, { isLoading }] = useSavePackagingPurchaseMutation()
  const [rows, setRows] = useState<PackagingPurchaseDetailRequest[]>([EMPTY_ROW()])
  const [rowError, setRowError] = useState('')

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchaseDate: new Date().toISOString().split('T')[0],
      vendorId: 0, storeId: 0, branchId: 0, note: '',
    },
  })

  const handleClose = () => {
    reset()
    setRows([EMPTY_ROW()])
    setRowError('')
    onClose()
  }

  const updateRow = (i: number, row: PackagingPurchaseDetailRequest) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? row : r)))

  const removeRow = (i: number) =>
    setRows((prev) => (prev.length === 1 ? [EMPTY_ROW()] : prev.filter((_, idx) => idx !== i)))

  const onSubmit = async (values: FormValues) => {
    const invalid = rows.some((r) => !r.packagingId || r.qty < 1 || r.purchasePrice < 0)
    if (invalid) {
      setRowError('Complete all packaging rows or remove incomplete ones.')
      return
    }
    setRowError('')

    try {
      const newId = await savePackagingPurchase({ ...values, details: rows }).unwrap()
      toast.success(t('common.success'))
      handleClose()
      onCreated?.(newId)
    } catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        }
  }

  const grandTotal = rows.reduce((sum, r) => sum + r.purchasePrice * r.qty, 0)

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[var(--border)] pb-1 mb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</span>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Packaging Purchase"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>{t('common.add', 'Add')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        <SectionHeading title="Purchase Info" />
        <PurchaseHeaderFields control={control} register={register} errors={errors} />

        <div className="flex items-center justify-between mt-1">
          <SectionHeading title="Packaging Items" />
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, EMPTY_ROW()])}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            <HiPlus size={13} /> Add Row
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <PackagingDetailRow
              key={i}
              index={i}
              value={row}
              onChange={(r) => updateRow(i, r)}
              onRemove={() => removeRow(i)}
            />
          ))}
        </div>

        {rowError && <p className="text-xs text-[var(--danger)]">{rowError}</p>}

        <div className="flex justify-end">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius)] bg-[var(--accent-soft)] border border-[var(--accent)]">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Grand Total</span>
            <span className="text-base font-bold text-[var(--accent)]">{grandTotal.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </Modal>
  )
}
