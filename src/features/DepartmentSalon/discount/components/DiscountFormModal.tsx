// ─── DiscountFormModal ────────────────────────────────────────────────────────
//
//  Create a new salon service discount with date range + service rows.
//  salonId is passed in as a prop (used from SalonDetailsPage context).

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus } from 'react-icons/hi'
import { Modal, Input, Button } from '@/components/shared'
import { useCreateDiscountMutation } from '../services/salonServiceDiscountApi'
import DiscountDetailRow from './DiscountDetailRow'
import type { DiscountDetailRequest } from '../types'

const schema = z.object({
  dateFrom: z.string().min(1, 'Start date is required'),
  toDate:   z.string().min(1, 'End date is required'),
}).refine((d) => d.toDate >= d.dateFrom, {
  message: 'End date must be on or after start date',
  path: ['toDate'],
})

type FormValues = z.infer<typeof schema>

const EMPTY_ROW = (): DiscountDetailRequest => ({ salonServiceId: 0, discountValue: 0 })

interface DiscountFormModalProps {
  open: boolean
  onClose: () => void
  salonId: number
  onCreated?: () => void
}

export default function DiscountFormModal({
  open,
  onClose,
  salonId,
  onCreated,
}: DiscountFormModalProps) {
  const { t } = useTranslation()
  const [createDiscount, { isLoading }] = useCreateDiscountMutation()
  const [rows, setRows] = useState<DiscountDetailRequest[]>([EMPTY_ROW()])
  const [rowError, setRowError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dateFrom: today, toDate: today },
  })

  const handleClose = () => {
    reset()
    setRows([EMPTY_ROW()])
    setRowError('')
    onClose()
  }

  const updateRow = (i: number, row: DiscountDetailRequest) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? row : r)))

  const removeRow = (i: number) =>
    setRows((prev) => (prev.length === 1 ? [EMPTY_ROW()] : prev.filter((_, idx) => idx !== i)))

  // All selected service ids for deduplication
  const usedServiceIds = rows.map((r) => r.salonServiceId).filter(Boolean)

  const onSubmit = async (values: FormValues) => {
    const invalid = rows.some((r) => !r.salonServiceId || r.discountValue <= 0 )
    if (invalid) {
      setRowError('Complete all rows. Discount must be between 1 and 100.')
      return
    }
    setRowError('')

    try {
      const newId = await createDiscount({
        dateFrom: new Date(values.dateFrom).toISOString(),
        toDate:   new Date(values.toDate).toISOString(),
        salonId,
        details: rows,
      }).unwrap()
      toast.success(t('common.success'))
      handleClose()
    
    } catch {
      toast.error(t('common.error'))
    }
  }

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[var(--border)] pb-1 mb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</span>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Service Discount"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>{t('common.add', 'Add')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        <SectionHeading title="Date Range" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('dateFrom')}
            label="From Date"
            type="date"
            error={errors.dateFrom?.message}
            required
          />
          <Input
            {...register('toDate')}
            label="To Date"
            type="date"
            error={errors.toDate?.message}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <SectionHeading title="Services & Discounts" />
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, EMPTY_ROW()])}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            <HiPlus size={13} /> Add Service
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <DiscountDetailRow
              key={i}
              index={i}
              value={row}
              onChange={(r) => updateRow(i, r)}
              onRemove={() => removeRow(i)}
              usedServiceIds={usedServiceIds}
            />
          ))}
        </div>

        {rowError && <p className="text-xs text-[var(--danger)]">{rowError}</p>}

      </div>
    </Modal>
  )
}
