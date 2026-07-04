import { useEffect, useState, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { Modal, Input, Select, Button, DatePicker, TimePicker } from '@/components/shared'
import {
  useSaveListOfAffiliateMutation,
  useUpdateAdminAffiliateMutation,
  useGetAdminSellersQuery,
  useGetAdminProductDropdownForAffiliateQuery,
  useLazyGetAdminProductDetailsForAffiliateQuery,
} from '../services/affiliateApi'
import type { AffiliateListItem, PendingAffiliate, SaveAffiliateItem } from '../types'
import { getApiError } from '@/services/apiHelpers'

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')

/** { hour, minute } → "HH:mm:ss" for the API */
const formatTime = (time: { hour: number; minute: number }): string =>
  `${pad(time.hour)}:${pad(time.minute)}:00`

/** "HH:mm:ss" → { hour, minute } — for populating the edit form */
const parseTime = (str: string | undefined | null): { hour: number; minute: number } => {
  if (!str) return { hour: 0, minute: 0 }
  const [h, m] = str.split(':').map(Number)
  return { hour: h ?? 0, minute: m ?? 0 }
}

/** "YYYY-MM-DD" → full ISO datetime string for the API (POST/PUT expect ISO) */
const toISO = (dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00`)
  return isNaN(d.getTime()) ? dateStr : d.toISOString()
}

/** "DD-MM-YYYY" (as returned by GET /api/admin/Affiliate) → "YYYY-MM-DD" for the DatePicker */
const parseDateToYMD = (dateStr: string | undefined | null): string => {
  if (!dateStr) return ''
  const dmy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`
  if (dateStr.includes('T')) return dateStr.split('T')[0]
  return dateStr
}

// ── Schemas ───────────────────────────────────────────────────────────────────
const timeSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
})

// Row-builder schema (Add mode: product / detail / seller / dates / times / commission)
const rowSchema = z.object({
  productId: z.coerce.number().min(1, 'Product is required'),
  productDetailsId: z.coerce.number().min(1, 'Size & color is required'),
  sellerId: z.coerce.number().min(1, 'Seller is required'),
  dateFrom: z.string().min(1, 'From date is required'),
  dateTo: z.string().min(1, 'To date is required'),
  timeFrom: timeSchema,
  timeTo: timeSchema,
  commission: z.coerce.number().min(0.01, 'Commission must be greater than 0').max(100, 'Commission cannot exceed 100'),
})
type RowValues = z.infer<typeof rowSchema>

// Edit schema (Edit mode: only date/time/commission are updatable per the PUT contract)
const editSchema = z.object({
  dateFrom: z.string().min(1, 'From date is required'),
  dateTo: z.string().min(1, 'To date is required'),
  timeFrom: timeSchema,
  timeTo: timeSchema,
  commission: z.coerce.number().min(0.01, 'Commission must be greater than 0').max(100, 'Commission cannot exceed 100'),
})
type EditValues = z.infer<typeof editSchema>

interface AffiliateFormModalProps {
  open: boolean
  onClose: () => void
  affiliate?: AffiliateListItem
}

export default function AffiliateFormModal({ open, onClose, affiliate }: AffiliateFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(affiliate)

  const [saveListOfAffiliate, { isLoading: isSaving }] = useSaveListOfAffiliateMutation()
  const [updateAffiliate, { isLoading: isUpdating }] = useUpdateAdminAffiliateMutation()

  const { data: sellers  = [] } = useGetAdminSellersQuery()
  const { data: products = [] } = useGetAdminProductDropdownForAffiliateQuery()
  const [fetchProductDetails, { data: detailOptions = [] }] = useLazyGetAdminProductDetailsForAffiliateQuery()

  // ── Add-mode: pending rows built up before one bulk save ──────────────────
  const [pendingRows, setPendingRows] = useState<PendingAffiliate[]>([])

  const rowForm = useForm<RowValues>({
    resolver: zodResolver(rowSchema) as any,
    defaultValues: {
      productId: 0,
      productDetailsId: 0,
      sellerId: 0,
      dateFrom: '',
      dateTo: '',
      timeFrom: { hour: 0, minute: 0 },
      timeTo: { hour: 0, minute: 0 },
      commission: 0,
    },
  })
  const selectedProductId = Number(rowForm.watch('productId'))

  // ── Edit-mode form ──────────────────────────────────────────────────────────
  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema) as any,
    defaultValues: { dateFrom: '', dateTo: '', timeFrom: { hour: 0, minute: 0 }, timeTo: { hour: 0, minute: 0 }, commission: 0 },
  })

  const resetAll = useCallback(() => {
    setPendingRows([])
    rowForm.reset({
      productId: 0,
      productDetailsId: 0,
      sellerId: 0,
      dateFrom: '',
      dateTo: '',
      timeFrom: { hour: 0, minute: 0 },
      timeTo: { hour: 0, minute: 0 },
      commission: 0,
    })
  }, [rowForm])

  // ── Open / close ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (affiliate) {
      editForm.reset({
        dateFrom: parseDateToYMD(affiliate.dateFrom),
        dateTo: parseDateToYMD(affiliate.dateTo),
        timeFrom: parseTime(affiliate.timeFrom),
        timeTo: parseTime(affiliate.timeTo),
        commission: affiliate.commission,
      })
    } else {
      resetAll()
    }
  }, [open, affiliate]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Product cascade ──────────────────────────────────────────────────────────
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    rowForm.setValue('productId', id)
    rowForm.setValue('productDetailsId', 0)
    if (id) fetchProductDetails(id)
  }

  // ── Add a row to the pending list ────────────────────────────────────────────
  const handleAddRow = rowForm.handleSubmit((values) => {
    const duplicate = pendingRows.some(
      (r) => r.productDetailsId === values.productDetailsId && r.sellerId === values.sellerId,
    )
    if (duplicate) {
      toast.error(t('affiliate.duplicateItem', 'This product/seller combination has already been added'))
      return
    }

    const product = products.find((p) => p.id === values.productId)
    const detail  = detailOptions.find((d) => d.detailId === values.productDetailsId)
    const seller  = sellers.find((s) => s.sellerId === values.sellerId)

    setPendingRows((prev) => [
      ...prev,
      {
        productId: values.productId,
        productDetailsId: values.productDetailsId,
        sellerId: values.sellerId,
        dateFrom: values.dateFrom,
        dateTo: values.dateTo,
        timeFrom: values.timeFrom,
        timeTo: values.timeTo,
        commission: values.commission,
        label: detail ? `${product?.name ?? ''} — ${detail.sizeName} / ${detail.colorName}` : product?.name ?? '',
        sellerLabel: seller ? `${seller.firstName} ${seller.lastName}` : '',
      },
    ])

    rowForm.reset({
      productId: 0,
      productDetailsId: 0,
      sellerId: 0,
      dateFrom: values.dateFrom,
      dateTo: values.dateTo,
      timeFrom: values.timeFrom,
      timeTo: values.timeTo,
      commission: values.commission,
    })
  })

  const handleRemoveRow = (index: number) => {
    setPendingRows((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    if (pendingRows.length === 0) {
      toast.error(t('affiliate.noRows', 'Please add at least one affiliate row before saving'))
      return
    }

    const saveAffiliates: SaveAffiliateItem[] = pendingRows.map((r) => ({
      productId: r.productId,
      productDetailsId: r.productDetailsId,
      sellerId: r.sellerId,
      dateFrom: toISO(r.dateFrom),
      dateTo: toISO(r.dateTo),
      timeFrom: formatTime(r.timeFrom),
      timeTo: formatTime(r.timeTo),
      commission: r.commission,
    }))

    try {
      await saveListOfAffiliate({ saveAffiliates }).unwrap()
      toast.success(t('common.success'))
      onClose()
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  const handleUpdate = editForm.handleSubmit(async (values) => {
    if (!affiliate) return
    try {
      await updateAffiliate({
        id: affiliate.id,
        dateFrom: toISO(values.dateFrom),
        dateTo: toISO(values.dateTo),
        timeFrom: formatTime(values.timeFrom),
        timeTo: formatTime(values.timeTo),
        commission: values.commission,
      }).unwrap()
      toast.success(t('common.success'))
      onClose()
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  })

  // ── Derived option lists ─────────────────────────────────────────────────────
  const productOptions = products.map((p) => ({ value: p.id, label: p.name }))
  const sellerOptions  = sellers
    .filter((s) => !s.isStop)
    .map((s) => ({ value: s.sellerId, label: `${s.firstName} ${s.lastName} — ${s.mobile}` }))
  const detailSelectOptions = detailOptions.map((d) => ({
    value: d.detailId,
    label: `${d.sizeName} – ${d.colorName} (Cost: ${d.purchasePrice})`,
  }))

  const isLoading = isSaving || isUpdating

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('affiliate.edit', 'Edit Affiliate') : t('affiliate.add', 'Add Affiliate')}
      size={isEdit ? 'md' : 'xl'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={isEdit ? handleUpdate : handleSaveAll} loading={isLoading}>
            {isEdit ? t('common.save') : t('common.save', 'Save')}
          </Button>
        </>
      }
    >
      {isEdit ? (
        // ── Edit mode: date/time/commission only ────────────────────────────────
        <div className="flex flex-col gap-4">
          <div className="text-sm text-[var(--text-muted)] bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius)] p-3">
            {affiliate?.productName ?? ''}
            {(affiliate?.sizeName || affiliate?.colorName) && (
              <> — {affiliate?.sizeName} {affiliate?.colorName && `/ ${affiliate.colorName}`}</>
            )}
            <br />
            {t('affiliate.seller', 'Seller')}: {affiliate?.sellerName ?? ''}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={editForm.control}
              name="dateFrom"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t('affiliate.dateFrom', 'Date From')}
                  error={editForm.formState.errors.dateFrom?.message}
                  required
                />
              )}
            />
            <Controller
              control={editForm.control}
              name="dateTo"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t('affiliate.dateTo', 'Date To')}
                  error={editForm.formState.errors.dateTo?.message}
                  required
                />
              )}
            />
            <Controller
              control={editForm.control}
              name="timeFrom"
              render={({ field }) => (
                <TimePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t('affiliate.timeFrom', 'Time From')}
                  required
                />
              )}
            />
            <Controller
              control={editForm.control}
              name="timeTo"
              render={({ field }) => (
                <TimePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t('affiliate.timeTo', 'Time To')}
                  required
                />
              )}
            />
          </div>

          <Input
            {...editForm.register('commission')}
            type="number"
            min={0}
            max={100}
            step="0.01"
            label={t('affiliate.commission', 'Commission %')}
            error={editForm.formState.errors.commission?.message}
            required
          />
        </div>
      ) : (
        // ── Add mode: build up a list of rows, then save all at once ────────────
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
          <div className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-4">

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="col-span-12 sm:col-span-3">
                <Select
                  label={t('affiliate.product', 'Product')}
                  options={productOptions}
                  placeholder={t('discount.selectProduct', 'Choose product...')}
                  value={rowForm.watch('productId') || ''}
                  onChange={handleProductChange}
                  error={rowForm.formState.errors.productId?.message}
                />
              </div>
              <div className="col-span-12 sm:col-span-3">
                <Select
                  label={t('discount.detail', 'Size & Color')}
                  options={detailSelectOptions}
                  placeholder={selectedProductId ? t('discount.selectDetail', 'Choose detail...') : t('discount.selectProductFirst', 'Select product first')}
                  value={rowForm.watch('productDetailsId') || ''}
                  onChange={(e) => rowForm.setValue('productDetailsId', Number(e.target.value))}
                  disabled={!selectedProductId}
                  error={rowForm.formState.errors.productDetailsId?.message}
                />
              </div>
              <div className="col-span-12 sm:col-span-3">
                <Select
                  label={t('affiliate.seller', 'Seller')}
                  options={sellerOptions}
                  placeholder={t('affiliate.selectSeller', 'Choose seller...')}
                  value={rowForm.watch('sellerId') || ''}
                  onChange={(e) => rowForm.setValue('sellerId', Number(e.target.value))}
                  error={rowForm.formState.errors.sellerId?.message}
                />
              </div>
              <div className="col-span-12 sm:col-span-3">
                <Input
                  {...rowForm.register('commission')}
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  label={t('affiliate.commission', 'Commission %')}
                  placeholder="e.g. 10"
                  error={rowForm.formState.errors.commission?.message}
                />
              </div>

              <div className="col-span-12 sm:col-span-3">
                <Controller
                  control={rowForm.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      label={t('affiliate.dateFrom', 'Date From')}
                      error={rowForm.formState.errors.dateFrom?.message}
                    />
                  )}
                />
              </div>
              <div className="col-span-12 sm:col-span-3">
                <Controller
                  control={rowForm.control}
                  name="dateTo"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      label={t('affiliate.dateTo', 'Date To')}
                      error={rowForm.formState.errors.dateTo?.message}
                    />
                  )}
                />
              </div>
              <div className="col-span-12 sm:col-span-3">
                <Controller
                  control={rowForm.control}
                  name="timeFrom"
                  render={({ field }) => (
                    <TimePicker value={field.value} onChange={field.onChange} label={t('affiliate.timeFrom', 'Time From')} />
                  )}
                />
              </div>
              <div className="col-span-12 sm:col-span-3">
                <Controller
                  control={rowForm.control}
                  name="timeTo"
                  render={({ field }) => (
                    <TimePicker value={field.value} onChange={field.onChange} label={t('affiliate.timeTo', 'Time To')} />
                  )}
                />
              </div>

              <div className="col-span-12 flex justify-end">
                <Button type="button" onClick={handleAddRow} leftIcon={<HiPlus size={14} />}>
                  {t('common.add', 'Add')}
                </Button>
              </div>
            </div>

            {pendingRows.length > 0 ? (
              <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden bg-[var(--bg-card)]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-hover)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]">
                      <th className="p-2.5">{t('affiliate.item', 'Item')}</th>
                      <th className="p-2.5">{t('affiliate.seller', 'Seller')}</th>
                      <th className="p-2.5">{t('affiliate.validity', 'Validity')}</th>
                      <th className="p-2.5 text-center w-20">{t('affiliate.commission', 'Commission %')}</th>
                      <th className="p-2.5 text-center w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {pendingRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg-hover)]">
                        <td className="p-2.5 text-[var(--text-primary)]">{row.label}</td>
                        <td className="p-2.5 text-[var(--text-primary)]">{row.sellerLabel}</td>
                        <td className="p-2.5 text-xs text-[var(--text-muted)]">
                          {row.dateFrom} → {row.dateTo}
                          <br />
                          {pad(row.timeFrom.hour)}:{pad(row.timeFrom.minute)} → {pad(row.timeTo.hour)}:{pad(row.timeTo.minute)}
                        </td>
                        <td className="p-2.5 text-center font-semibold">{row.commission}%</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
                            title={t('common.remove', 'Remove')}
                          >
                            <HiTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg-card)] text-xs text-[var(--text-muted)]">
                {t('affiliate.noItems', 'Fill in the fields above, then click Add. You can add multiple rows before saving.')}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}