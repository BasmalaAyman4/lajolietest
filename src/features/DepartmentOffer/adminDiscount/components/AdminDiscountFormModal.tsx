import { useEffect, useState, useCallback, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { Modal, Input, Select, Button, DatePicker, StatusBadge } from '@/components/shared'
import {
  useCreateAdminDiscountMutation,
  useUpdateAdminDiscountMutation,
  useLazyGetAdminDiscountQuery,
  useStopAdminDiscountDetailMutation,
  useGetAdminDiscountTypeDropdownQuery,
  useGetAdminProductDropdownQuery,
  useLazyGetAdminProductDetailsQuery,
  useGetAdminCategoryDropdownQuery,
  useGetAdminSubCategoryDropdownQuery,
  useGetAdminBrandDropdownQuery,
} from '../services/adminDiscountApi'
import type { DiscountListItem, DiscountDetail, PendingDetail } from '../types'
import { getApiError } from '@/services/apiHelpers'

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseDateToYMD = (dateStr: string | undefined | null): string => {
  if (!dateStr) return ''
  if (dateStr.includes('T')) return dateStr.split('T')[0]
  const dmyDash = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (dmyDash) return `${dmyDash[3]}-${dmyDash[2]}-${dmyDash[1]}`
  const dmySlash = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (dmySlash) return `${dmySlash[3]}-${dmySlash[2]}-${dmySlash[1]}`
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime()))
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {}
  return dateStr
}

const clampDiscount = (raw: string): string => {
  const n = parseFloat(raw)
  if (isNaN(n)) return raw
  if (n < 0) return '0'
  if (n > 100) return '100'
  return raw
}

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  discountType: z.coerce.number().min(1, 'Discount type is required'),
  dateFrom: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
})

type FormValues = z.infer<typeof schema>

interface DiscountFormModalProps {
  open: boolean
  onClose: () => void
  discount?: DiscountListItem
}

const TYPE_PRODUCT    = 2
const TYPE_CATEGORY   = 3
const TYPE_SUBCATEGORY = 4
const TYPE_BRAND      = 5

// ── Row-level discount override maps ─────────────────────────────────────────
// existingEdits: detailId  → override string value
// pendingEdits:  row index → override string value
type EditMap = Map<number, string>

export default function DiscountFormModal({ open, onClose, discount }: DiscountFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(discount)

  const [createAdminDiscount, { isLoading: isCreating }] = useCreateAdminDiscountMutation()
  const [updateAdminDiscount, { isLoading: isUpdating }] = useUpdateAdminDiscountMutation()
  const [stopAdminDiscountDetail, { isLoading: isStoppingDetail }] = useStopAdminDiscountDetailMutation()
  const isLoading = isCreating || isUpdating

  // ── Dropdowns ──────────────────────────────────────────────────────────────
  const { data: discountTypes  = [] } = useGetAdminDiscountTypeDropdownQuery()
  const { data: products       = [] } = useGetAdminProductDropdownQuery()
  const { data: categories     = [] } = useGetAdminCategoryDropdownQuery()
  const { data: subcategories  = [] } = useGetAdminSubCategoryDropdownQuery()
  const { data: brands         = [] } = useGetAdminBrandDropdownQuery()

  const [fetchAdminProductDetails, { data: detailOptions = [] }] = useLazyGetAdminProductDetailsQuery()
  const [fetchDiscount, { data: fullDiscount, isLoading: isFetching }] = useLazyGetAdminDiscountQuery()

  // ── Rows ───────────────────────────────────────────────────────────────────
  const [existingDetails, setExistingDetails] = useState<DiscountDetail[]>([])
  const [pendingDetails,  setPendingDetails]  = useState<PendingDetail[]>([])
  const [existingEdits,   setExistingEdits]   = useState<EditMap>(new Map())
  const [pendingEdits,    setPendingEdits]     = useState<EditMap>(new Map())

  // ── Global discount input ──────────────────────────────────────────────────
  const [globalDiscount, setGlobalDiscount] = useState<string>('')

  // Stable refs so global-apply handler never captures stale state
  const existingDetailsRef = useRef(existingDetails)
  const pendingDetailsRef  = useRef(pendingDetails)
  useEffect(() => { existingDetailsRef.current = existingDetails }, [existingDetails])
  useEffect(() => { pendingDetailsRef.current  = pendingDetails  }, [pendingDetails])

  // ── Item selector inputs ───────────────────────────────────────────────────
  const [selectedProduct,     setSelectedProduct]     = useState<number | ''>('')
  const [selectedDetail,      setSelectedDetail]      = useState<number | ''>('')
  const [selectedCategory,    setSelectedCategory]    = useState<number | ''>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | ''>('')
  const [selectedBrand,       setSelectedBrand]       = useState<number | ''>('')

  // ── Form ───────────────────────────────────────────────────────────────────
  const { handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { discountType: 0, dateFrom: '', toDate: '' },
  })

  const discountType = Number(watch('discountType'))

  // ── Helpers: clear / reset ─────────────────────────────────────────────────
  const clearItemSelectors = useCallback(() => {
    setSelectedProduct('')
    setSelectedDetail('')
    setSelectedCategory('')
    setSelectedSubcategory('')
    setSelectedBrand('')
  }, [])

  const resetAll = useCallback(() => {
    reset({ discountType: 0, dateFrom: '', toDate: '' })
    setExistingDetails([])
    setPendingDetails([])
    setExistingEdits(new Map())
    setPendingEdits(new Map())
    setGlobalDiscount('')
    clearItemSelectors()
  }, [reset, clearItemSelectors])

  // ── Open / close ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (discount) {
      fetchDiscount(discount.id)
      clearItemSelectors()
      setGlobalDiscount('')
      setExistingEdits(new Map())
      setPendingEdits(new Map())
    } else {
      resetAll()
    }
  }, [open, discount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Prefill form + rows when API data arrives
  useEffect(() => {
    if (!open || !discount || !fullDiscount) return
    reset({
      discountType: fullDiscount.discountType,
      dateFrom: parseDateToYMD(fullDiscount.dateFrom),
      toDate:   parseDateToYMD(fullDiscount.toDate),
    })
    setExistingDetails([
      ...fullDiscount.details,
      ...fullDiscount.discountCategories,
      ...fullDiscount.discountSubCategories,
      ...fullDiscount.discountBrands,
    ])
    setPendingDetails([])
    setExistingEdits(new Map())
    setPendingEdits(new Map())
  }, [open, discount, fullDiscount, reset])

  // ── Global discount: propagate to every row ────────────────────────────────
  const handleGlobalDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = clampDiscount(e.target.value)
    setGlobalDiscount(raw)
    if (raw === '' || isNaN(Number(raw))) return

    setExistingEdits(() => {
      const m: EditMap = new Map()
      existingDetailsRef.current.forEach((d) => m.set(d.detailId, raw))
      return m
    })
    setPendingEdits(() => {
      const m: EditMap = new Map()
      pendingDetailsRef.current.forEach((_, i) => m.set(i, raw))
      return m
    })
  }

  // ── Per-row inline edit ────────────────────────────────────────────────────
  const editExisting = (detailId: number, val: string) =>
    setExistingEdits((prev) => new Map(prev).set(detailId, clampDiscount(val)))

  const editPending = (idx: number, val: string) =>
    setPendingEdits((prev) => new Map(prev).set(idx, clampDiscount(val)))

  // Effective value for display / submit
  const effectiveExisting = (d: DiscountDetail): string =>
    existingEdits.get(d.detailId) ?? String(d.discountValue)

  const effectivePending = (idx: number, d: PendingDetail): string =>
    pendingEdits.get(idx) ?? String(d.discountValue)

  // ── Product cascade ────────────────────────────────────────────────────────
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setSelectedProduct(id)
    setSelectedDetail('')
    if (id) fetchAdminProductDetails(id)
  }

  // ── Label / id builders ────────────────────────────────────────────────────
  const getItemLabel = (): string => {
    switch (discountType) {
      case TYPE_PRODUCT: {
        const d = detailOptions.find((o) => o.detailId === Number(selectedDetail))
        const p = products.find((o) => o.id === Number(selectedProduct))
        return d ? `${p?.name ?? ''} — ${d.sizeName} / ${d.colorName}` : ''
      }
      case TYPE_CATEGORY:    return categories.find((o)    => o.id === Number(selectedCategory))?.name    ?? ''
      case TYPE_SUBCATEGORY: return subcategories.find((o) => o.id === Number(selectedSubcategory))?.name ?? ''
      case TYPE_BRAND:       return brands.find((o)        => o.id === Number(selectedBrand))?.name       ?? ''
      default: return ''
    }
  }

  const getRelatedId = (): number | null => {
    switch (discountType) {
      case TYPE_PRODUCT:    return selectedDetail      ? Number(selectedDetail)      : null
      case TYPE_CATEGORY:   return selectedCategory    ? Number(selectedCategory)    : null
      case TYPE_SUBCATEGORY:return selectedSubcategory ? Number(selectedSubcategory) : null
      case TYPE_BRAND:      return selectedBrand       ? Number(selectedBrand)       : null
      default: return null
    }
  }

  // ── Add row ────────────────────────────────────────────────────────────────
  const handleAddDetail = () => {
    const relatedId = getRelatedId()
    if (relatedId === null) {
      toast.error(t('discount.selectItem', 'Please select an item'))
      return
    }

    // Use global discount value; require it to be set before adding
    const globalValue = Number(globalDiscount)
    if (!globalDiscount || isNaN(globalValue) || globalValue <= 0) {
      toast.error(t('discount.globalRequired', 'Set a discount % above before adding items'))
      return
    }

    const duplicate =
      pendingDetails.some((d) => d.relatedId === relatedId) ||
      existingDetails.some((d) => (d.productDetailsId ?? d.detailId) === relatedId)
    if (duplicate) {
      toast.error(t('discount.duplicateItem', 'This item has already been added'))
      return
    }

    const newIndex = pendingDetails.length
    setPendingDetails((prev) => [
      ...prev,
      { relatedId, discountValue: globalValue, label: getItemLabel() },
    ])
    // Pre-fill the pending edit map so the row shows the global value
    setPendingEdits((prev) => new Map(prev).set(newIndex, globalDiscount))

    clearItemSelectors()
  }

  // ── Remove pending row (re-key edit map) ───────────────────────────────────
  const handleRemovePending = (index: number) => {
    setPendingDetails((prev) => prev.filter((_, i) => i !== index))
    setPendingEdits((prev) => {
      const next: EditMap = new Map()
      prev.forEach((val, key) => {
        if (key < index)  next.set(key, val)
        if (key > index)  next.set(key - 1, val)
      })
      return next
    })
  }

  // ── Existing row label ─────────────────────────────────────────────────────
  const getExistingLabel = (d: DiscountDetail): string => {
    if (d.productNameEn) return `${d.productNameEn} — ${d.sizeNameEn ?? ''} / ${d.colorNameEn ?? ''}`
    return d.name ?? `ID: ${d.detailId}`
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    const allDetails = [
      ...existingDetails
        .filter((d) => !d.isStoped)
        .map((d) => ({
          relatedId: d.productDetailsId ?? d.detailId,
          discountValue: Number(effectiveExisting(d)),
        })),
      ...pendingDetails.map((d, i) => ({
        relatedId: d.relatedId,
        discountValue: Number(effectivePending(i, d)),
      })),
    ]

    if (allDetails.length === 0) {
      toast.error(t('discount.noDetails', 'Please add at least one item before saving'))
      return
    }
    if (allDetails.some((d) => isNaN(d.discountValue) || d.discountValue <= 0)) {
      toast.error(t('discount.invalidValues', 'Some rows have an invalid discount value'))
      return
    }

    const payload = {
      discountType: Number(values.discountType),
      dateFrom: values.dateFrom,
      toDate:   values.toDate,
      details:  allDetails,
    }

    try {
      if (isEdit && discount) {
        await updateAdminDiscount({ id: discount.id, ...payload }).unwrap()
      } else {
        await createAdminDiscount(payload).unwrap()
      }
      toast.success(t('common.success'))
      onClose()
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  // ── Derived option lists ───────────────────────────────────────────────────
  const discountTypeOptions  = discountTypes.map((d) => ({ value: d.id, label: d.name }))
  const productOptions       = products.map((p)      => ({ value: p.id, label: p.name }))
  const categoryOptions      = categories.map((c)    => ({ value: c.id, label: c.name }))
  const subcategoryOptions   = subcategories.map((s) => ({ value: s.id, label: s.name }))
  const brandOptions         = brands.map((b)         => ({ value: b.id, label: b.name }))
  const detailSelectOptions  = detailOptions.map((d)  => ({
    value: d.detailId,
    label: `${d.sizeName} – ${d.colorName} (Cost: ${d.purchasePrice})`,
  }))

  const totalRows = existingDetails.length + pendingDetails.length

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[var(--border)] pb-1 mb-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</span>
    </div>
  )

  // Inline number input used in every table row
  const DiscountInput = ({
    value,
    onChange,
  }: {
    value: string
    onChange: (val: string) => void
  }) => (
    <input
      type="number"
      min={0}
      max={100}
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-20 text-center text-sm font-semibold border border-[var(--border)] rounded-[var(--radius)] px-2 py-1 bg-[var(--bg-input,var(--bg-card))] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
    />
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('discount.edit', 'Edit Discount') : t('discount.add', 'Add Discount')}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {isEdit ? t('common.save') : t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--text-muted)]">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">{t('common.loading', 'Loading...')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">

          {/* ── General ──────────────────────────────────────────────────────── */}
          <SectionHeading title={t('discount.general', 'General Details')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Controller
              control={control}
              name="discountType"
              render={({ field }) => (
                <Select
                  label={t('discount.type', 'Discount Type')}
                  options={discountTypeOptions}
                  placeholder={t('discount.selectType', 'Choose type...')}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e)
                    setPendingDetails([])
                    setExistingDetails([])
                    setExistingEdits(new Map())
                    setPendingEdits(new Map())
                    setGlobalDiscount('')
                    clearItemSelectors()
                  }}
                  error={errors.discountType?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="dateFrom"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t('discount.dateFrom', 'Valid From')}
                  error={errors.dateFrom?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="toDate"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t('discount.toDate', 'Valid To')}
                  error={errors.toDate?.message}
                  required
                />
              )}
            />
          </div>

          {/* ── Details manager ───────────────────────────────────────────────── */}
          {discountType > 0 && (
            <>
              <SectionHeading title={t('discount.details', 'Discount Items')} />
              <div className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-4">

                {/* ── Global discount + item selector row ─────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">

                  {/* Global % — always first, fixed width */}
                  <div className="col-span-12 sm:col-span-2">
                    <Input
                      label={t('discount.value', 'Discount %')}
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      placeholder="e.g. 15"
                      value={globalDiscount}
                      onChange={handleGlobalDiscountChange}
                    />
                  </div>

                  {/* Item selectors — fill remaining space */}
                  {discountType === TYPE_PRODUCT && (
                    <>
                      <div className="col-span-12 sm:col-span-4">
                        <Select
                          label={t('discount.product', 'Product')}
                          options={productOptions}
                          placeholder={t('discount.selectProduct', 'Choose product...')}
                          value={selectedProduct}
                          onChange={handleProductChange}
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-4">
                        <Select
                          label={t('discount.detail', 'Size & Color')}
                          options={detailSelectOptions}
                          placeholder={selectedProduct ? t('discount.selectDetail', 'Choose detail...') : t('discount.selectProductFirst', 'Select product first')}
                          value={selectedDetail}
                          onChange={(e) => setSelectedDetail(Number(e.target.value))}
                          disabled={!selectedProduct}
                        />
                      </div>
                    </>
                  )}

                  {discountType === TYPE_CATEGORY && (
                    <div className="col-span-12 sm:col-span-8">
                      <Select
                        label={t('discount.category', 'Category')}
                        options={categoryOptions}
                        placeholder={t('discount.selectCategory', 'Choose category...')}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(Number(e.target.value))}
                      />
                    </div>
                  )}

                  {discountType === TYPE_SUBCATEGORY && (
                    <div className="col-span-12 sm:col-span-8">
                      <Select
                        label={t('discount.subcategory', 'Subcategory')}
                        options={subcategoryOptions}
                        placeholder={t('discount.selectSubcategory', 'Choose subcategory...')}
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(Number(e.target.value))}
                      />
                    </div>
                  )}

                  {discountType === TYPE_BRAND && (
                    <div className="col-span-12 sm:col-span-8">
                      <Select
                        label={t('discount.brand', 'Brand')}
                        options={brandOptions}
                        placeholder={t('discount.selectBrand', 'Choose brand...')}
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(Number(e.target.value))}
                      />
                    </div>
                  )}

                  <div className="col-span-12 sm:col-span-2 flex justify-end">
                    <Button type="button" onClick={handleAddDetail} leftIcon={<HiPlus size={14} />}>
                      {t('common.add', 'Add')}
                    </Button>
                  </div>
                </div>

                {/* ── Table ────────────────────────────────────────────────────── */}
                {totalRows > 0 ? (
                  <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden bg-[var(--bg-card)]">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-[var(--bg-hover)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]">
                          <th className="p-2.5">{t('discount.item', 'Item')}</th>
                          <th className="p-2.5 text-center w-28">{t('discount.value', 'Discount %')}</th>
                          <th className="p-2.5 text-center">{t('discount.status', 'Status / Action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">

                        {existingDetails.map((detail) => (
                          <tr key={`existing-${detail.detailId}`} className="hover:bg-[var(--bg-hover)]">
                            <td className="p-2.5 text-[var(--text-primary)]">
                              {getExistingLabel(detail)}
                            </td>
                            <td className="p-2.5 text-center">
                              <DiscountInput
                                value={effectiveExisting(detail)}
                                onChange={(val) => editExisting(detail.detailId, val)}
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <StatusBadge
                                  variant={detail.isStoped ? 'danger' : 'success'}
                                  label={detail.isStoped ? t('common.stopped', 'Stopped') : t('common.active', 'Active')}
                                />
                                {discount?.id && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="py-1 px-2 text-xs"
                                    disabled={isStoppingDetail}
                                    onClick={async () => {
                                      try {
                                        await stopAdminDiscountDetail({ discountId: discount.id, detailId: detail.detailId }).unwrap()
                                        toast.success(t('common.success'))
                                      } catch (err) {
                                        toast.error(getApiError(err, t('common.error')))
                                      }
                                    }}
                                  >
                                    {detail.isStoped ? t('common.activate', 'Activate') : t('common.stop', 'Stop')}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                        {pendingDetails.map((detail, idx) => (
                          <tr key={`pending-${idx}`} className="hover:bg-[var(--bg-hover)]">
                            <td className="p-2.5 text-[var(--text-primary)]">
                              <span className="flex items-center gap-1.5">
                                <span className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.5 rounded font-medium">
                                  {t('common.new', 'New')}
                                </span>
                                {detail.label}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <DiscountInput
                                value={effectivePending(idx, detail)}
                                onChange={(val) => editPending(idx, val)}
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePending(idx)}
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
                    {t('discount.noItems', 'Set a discount % above, choose an item, then click Add.')}
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
