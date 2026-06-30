import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, DatePicker } from '@/components/shared'
import {
  useCreateShippingOfferMutation,
  useUpdateShippingOfferMutation,
} from '../services/shippingOfferApi'
import type { ShippingOffer } from '../types'
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

const formatToISOString = (dateStr: string): string => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toISOString()
  } catch {
    return dateStr
  }
}

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  orderValue: z.coerce.number().min(0, 'Order value must be 0 or more'),
  offerValue: z.coerce.number().min(0, 'Offer value must be 0 or more'),
})

type FormValues = z.infer<typeof schema>

interface ShippingOfferFormModalProps {
  open: boolean
  onClose: () => void
  offer?: ShippingOffer
}

export default function ShippingOfferFormModal({
  open,
  onClose,
  offer,
}: ShippingOfferFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(offer)

  const [createShippingOffer, { isLoading: isCreating }] = useCreateShippingOfferMutation()
  const [updateShippingOffer, { isLoading: isUpdating }] = useUpdateShippingOfferMutation()
  const isLoading = isCreating || isUpdating

  // ── Form ───────────────────────────────────────────────────────────────────
  const { handleSubmit, reset, control, register, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { fromDate: '', toDate: '', orderValue: 0, offerValue: 0 },
  })

  // Prefill or reset form on open/close or offer change
  useEffect(() => {
    if (open) {
      if (offer) {
        reset({
          fromDate: parseDateToYMD(offer.fromDate),
          toDate: parseDateToYMD(offer.toDate),
          orderValue: offer.orderValue,
          offerValue: offer.offerValue,
        })
      } else {
        reset({ fromDate: '', toDate: '', orderValue: 0, offerValue: 0 })
      }
    }
  }, [open, offer, reset])

  // ── Submit handler ──────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    const payload = {
      fromDate: formatToISOString(values.fromDate),
      toDate: formatToISOString(values.toDate),
      orderValue: values.orderValue,
      offerValue: values.offerValue,
    }

    try {
      if (isEdit && offer) {
        await updateShippingOffer({ id: offer.id, ...payload }).unwrap()
      } else {
        await createShippingOffer(payload).unwrap()
      }
      toast.success(t('common.success', 'Operation completed successfully'))
      onClose()
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error', 'An error occurred')))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('shippingOffer.editTitle', 'Edit Shipping Offer') : t('shippingOffer.addTitle', 'Add Shipping Offer')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {isEdit ? t('common.save', 'Save') : t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="fromDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                label={t('shippingOffer.validFrom', 'Valid From')}
                error={errors.fromDate?.message}
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
                label={t('shippingOffer.validTo', 'Valid To')}
                error={errors.toDate?.message}
                required
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('orderValue')}
            label={t('shippingOffer.orderValue', 'Minimum Order Value')}
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            error={errors.orderValue?.message}
            required
          />
          <Input
            {...register('offerValue')}
            label={t('shippingOffer.offerValue', 'Shipping Offer Value')}
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            error={errors.offerValue?.message}
            required
          />
        </div>
      </div>
    </Modal>
  )
}
