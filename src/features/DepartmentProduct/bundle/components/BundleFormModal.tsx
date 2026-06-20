// ─── BundleFormModal ──────────────────────────────────────────────────────────
//
//  Create mode  → pass no props → submits full bundle with details array
//  Edit mode    → pass `bundle` (ProductBundleFull) → pre-fills all fields
//
//  Details are managed as local state (not react-hook-form array) because
//  each row needs its own async product-details fetch. The top-level fields
//  (names, prices, qty, description) use react-hook-form normally.

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus } from 'react-icons/hi'
import { Modal, Input, Button } from '@/components/shared'
import type { ProductBundleFull, BundleDetailRequest } from '../types'
import {
  useCreateProductBundleMutation,
  useUpdateProductBundleMutation,
} from '../services/productBundleApi'
import BundleDetailRow from './BundleDetailRow'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  nameAr:      z.string().min(1, 'Arabic name is required'),
  nameEn:      z.string().min(1, 'English name is required'),
  description: z.string().default(''),
  bundlePrice: z.coerce.number().min(0, 'Bundle price required'),
  priceBefore: z.coerce.number().min(0, 'Price before required'),
  qty:         z.coerce.number().min(1, 'Qty must be at least 1'),
})

type FormValues = z.infer<typeof schema>

// A detail row also carries _productId so BundleDetailRow can pre-select the product
type DetailRow = BundleDetailRequest & { _productId?: number }

const EMPTY_ROW = (): DetailRow => ({ _productId: undefined, productDetailId: 0, priceInBundle: 0, qty: 1 })

interface BundleFormModalProps {
  open: boolean
  onClose: () => void
  bundle?: ProductBundleFull
  onCreated?: (id: number) => void
}

export default function BundleFormModal({ open, onClose, bundle, onCreated }: BundleFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(bundle)

  const [createBundle, { isLoading: isCreating }] = useCreateProductBundleMutation()
  const [updateBundle, { isLoading: isUpdating }] = useUpdateProductBundleMutation()
  const isLoading = isCreating || isUpdating

  const [details, setDetails] = useState<DetailRow[]>([EMPTY_ROW()])
  const [detailError, setDetailError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', description: '', bundlePrice: 0, priceBefore: 0, qty: 1 },
  })

  // ── Sync form when opening ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (bundle) {
      reset({
        nameAr:      bundle.nameAr,
        nameEn:      bundle.nameEn,
        description: bundle.description,
        bundlePrice: bundle.bundlePrice,
        priceBefore: bundle.priceBefore,
        qty:         bundle.qty,
      })
      // Map existing details — _productId comes from productId in the full response
      setDetails(
        bundle.detail.length > 0
          ? bundle.detail.map((d) => ({
              _productId:      d.productId,
              productDetailId: d.productDetailId,
              priceInBundle:   d.priceInBundle,
              qty:             d.qty,
            }))
          : [EMPTY_ROW()],
      )
    } else {
      reset({ nameAr: '', nameEn: '', description: '', bundlePrice: 0, priceBefore: 0, qty: 1 })
      setDetails([EMPTY_ROW()])
    }
    setDetailError('')
  }, [open, bundle, reset])

  // ── Detail row handlers ────────────────────────────────────────────────────
  const updateDetail = useCallback((index: number, row: DetailRow) => {
    setDetails((prev) => prev.map((r, i) => (i === index ? row : r)))
  }, [])

  const addDetail = () => setDetails((prev) => [...prev, EMPTY_ROW()])

  const removeDetail = useCallback((index: number) => {
    setDetails((prev) => (prev.length === 1 ? [EMPTY_ROW()] : prev.filter((_, i) => i !== index)))
  }, [])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    // Validate details
    const invalid = details.some((d) => !d.productDetailId || d.qty < 1)
    if (invalid) {
      setDetailError('Please complete all product detail rows or remove empty ones.')
      return
    }
    setDetailError('')

    const payload = {
      ...values,
      details: details.map(({ _productId: _, ...d }) => d),
    }

    try {
      if (isEdit && bundle) {
        await updateBundle({ id: bundle.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createBundle(payload).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    }  catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
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
      onClose={onClose}
      title={isEdit ? 'Edit Bundle' : 'Add Bundle'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {isEdit ? t('common.save') : t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        {/* ── Basic info ────────────────────────────────────────────────── */}
        <SectionHeading title="Basic Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('nameEn')} label="Name (EN)" placeholder="e.g. Summer Bundle" error={errors.nameEn?.message} required />
          <Input {...register('nameAr')} label="Name (AR)" placeholder="مثال: باندل الصيف" error={errors.nameAr?.message} dir="rtl" required />
        </div>
        <Input {...register('description')} label="Description" placeholder="Optional description…" error={errors.description?.message} />

        {/* ── Pricing & qty ─────────────────────────────────────────────── */}
        <SectionHeading title="Pricing & Quantity" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input {...register('bundlePrice')} label="Bundle Price" type="number" min={0} step="0.01" placeholder="0.00" error={errors.bundlePrice?.message} required />
          <Input {...register('priceBefore')} label="Price Before" type="number" min={0} step="0.01" placeholder="0.00" error={errors.priceBefore?.message} required />
          <Input {...register('qty')} label="Qty" type="number" min={1} placeholder="1" error={errors.qty?.message} required />
        </div>

        {/* ── Product details ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <SectionHeading title="Products in Bundle" />
          <button
            type="button"
            onClick={addDetail}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]
              hover:text-[var(--accent-dark)] transition-colors"
          >
            <HiPlus size={13} /> Add Product
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {details.map((detail, index) => (
            <BundleDetailRow
              key={index}
              index={index}
              value={detail}
              onChange={(row) => updateDetail(index, row)}
              onRemove={() => removeDetail(index)}
            />
          ))}
        </div>

        {detailError && (
          <p className="text-xs text-[var(--danger)]">{detailError}</p>
        )}

      </div>
    </Modal>
  )
}
