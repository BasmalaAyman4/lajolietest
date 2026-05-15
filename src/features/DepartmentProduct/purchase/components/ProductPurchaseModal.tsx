// ─── ProductPurchaseModal ─────────────────────────────────────────────────────
//
//  Create a product purchase order.
//  Header fields (date, vendor, store, branch, note) + dynamic product rows.

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus } from 'react-icons/hi'
import { Modal, Button } from '@/components/shared'
import { useCreatePurchaseMutation } from '../services/purchaseApi'
import PurchaseHeaderFields from './PurchaseHeaderFields'
import PurchaseDetailRow, { type ProductDetailRow } from './PurchaseDetailRow'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  vendorId:     z.coerce.number().min(1, 'Vendor is required'),
  storeId:      z.coerce.number().min(1, 'Store is required'),
  branchId:     z.coerce.number().min(1, 'Branch is required'),
  note:         z.string().default(''),
})

type FormValues = z.infer<typeof schema>

const EMPTY_ROW = (): ProductDetailRow => ({
  _productId: undefined,
  productDetailId: 0,
  purchasePrice: 0,
  qty: 1,
})

interface ProductPurchaseModalProps {
  open: boolean
  onClose: () => void
  onCreated?: (id: number) => void
}

export default function ProductPurchaseModal({ open, onClose, onCreated }: ProductPurchaseModalProps) {
  const { t } = useTranslation()
  const [createPurchase, { isLoading }] = useCreatePurchaseMutation()
  const [rows, setRows] = useState<ProductDetailRow[]>([EMPTY_ROW()])
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

  const updateRow = (i: number, row: ProductDetailRow) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? row : r)))

  const removeRow = (i: number) =>
    setRows((prev) => (prev.length === 1 ? [EMPTY_ROW()] : prev.filter((_, idx) => idx !== i)))

  const onSubmit = async (values: FormValues) => {
    const invalid = rows.some((r) => !r.productDetailId || r.qty < 1 || r.purchasePrice < 0)
    if (invalid) {
      setRowError('Complete all product rows or remove incomplete ones.')
      return
    }
    setRowError('')

    try {
      const newId = await createPurchase({
        ...values,
        details: rows.map(({ _productId: _, ...r }) => r),
      }).unwrap()
      toast.success(t('common.success'))
      handleClose()
      onCreated?.(newId)
    } catch {
      toast.error(t('common.error'))
    }
  }

  // Live total
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
      title="New Product Purchase"
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
          <SectionHeading title="Products" />
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, EMPTY_ROW()])}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            <HiPlus size={13} /> Add Row
          </button>
        </div>

        {/* Column headers hint */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-3 -mb-2">
          {['#', 'Product', 'Variant', 'Unit Price', 'Qty', 'Total', ''].map((h, i) => (
            <div key={i} className={`text-xs text-[var(--text-muted)] font-medium ${
              i === 0 ? 'col-span-1 text-center' :
              i === 1 ? 'col-span-4' :
              i === 2 ? 'col-span-3' :
              i === 3 ? 'col-span-2' :
              i === 4 ? 'col-span-1' :
              i === 5 ? 'col-span-1 text-center' : 'col-span-1'
            }`}>{h}</div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <PurchaseDetailRow
              key={i}
              index={i}
              value={row}
              onChange={(r) => updateRow(i, r)}
              onRemove={() => removeRow(i)}
            />
          ))}
        </div>

        {rowError && <p className="text-xs text-[var(--danger)]">{rowError}</p>}

       

      </div>
    </Modal>
  )
}
