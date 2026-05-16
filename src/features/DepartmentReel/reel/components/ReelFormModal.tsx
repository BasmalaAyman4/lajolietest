// ─── ReelFormModal ────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import Select from '@/components/shared/Select'
import {
  useGetReelsCategoryDropdownQuery,
  useGetReelsPurposeDropdownQuery,
  useGetSalonDropdownQuery,
  useGetSalonServiceDropdownQuery,
  useGetSalonPackageDropdownQuery,
  useCreateReelMutation,
  useGetProductDropdownQuery,
} from '../services/reelApi'
import type { CreateReelRequest } from '../types'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY = { SALON: '1', PRODUCT: '2', MAKEUP: '3', TUTORIAL: '4' } as const
const PURPOSE = {
  JUST_REEL: '1',
  SALON_MARKETING: '2',
  PRODUCT_MARKETING: '3',
  SERVICE_MARKETING: '4',
  PACKAGE_MARKETING: '5',
} as const

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  reelsCategoryId: z.string().min(1, 'Category is required'),
  reelsPurposeId: z.string().min(1, 'Purpose is required'),
  productId: z.string().optional(),
  salonId: z.string().optional(),
  salonServiceId: z.string().optional(),
  salonPackageId: z.string().optional(),
  makeupArtist: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ── Field config helper ───────────────────────────────────────────────────────

/**
 * Determines which extra fields to show based on category + purpose.
 *
 * Category  | Purpose              | Fields shown
 * ──────────|──────────────────────|──────────────────────────────────
 * Product   | any                  | productId
 * Salon     | Just a Reel          | salonId
 * Salon     | Salon Marketing      | salonId
 * Salon     | Service Marketing    | salonId → salonServiceId (filtered)
 * Salon     | Package Marketing    | salonId → salonPackageId (filtered)
 * MakeUp    | any                  | makeupArtist
 * Tutorial  | any                  | (none)
 */
type FieldConfig = {
  showProduct?: boolean
  showSalon?: boolean
  showService?: boolean
  showPackage?: boolean
  showMakeup?: boolean
}

function getFieldConfig(categoryId: string, purposeId: string): FieldConfig {
  if (categoryId === CATEGORY.PRODUCT) return { showProduct: true }
  if (categoryId === CATEGORY.MAKEUP)  return { showMakeup: true }
  if (categoryId === CATEGORY.SALON) {
    if (purposeId === PURPOSE.SERVICE_MARKETING) return { showSalon: true, showService: true }
    if (purposeId === PURPOSE.PACKAGE_MARKETING) return { showSalon: true, showPackage: true }
    return { showSalon: true }
  }
  return {}
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ReelFormModalProps {
  open: boolean
  onClose: () => void
  onCreated?: (id: number, title: string) => void
}

export default function ReelFormModal({ open, onClose, onCreated }: ReelFormModalProps) {
  const { t } = useTranslation()

  const { data: categories = [] }  = useGetReelsCategoryDropdownQuery()
  const { data: purposes = [] }    = useGetReelsPurposeDropdownQuery()
  const { data: salons = [] }      = useGetSalonDropdownQuery()
  const { data: allServices = [] } = useGetSalonServiceDropdownQuery()
  const { data: allPackages = [] } = useGetSalonPackageDropdownQuery()
  const { data: products = [] }    = useGetProductDropdownQuery()

  const [createReel, { isLoading }] = useCreateReelMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      reelsCategoryId: '',
      reelsPurposeId: '',
      productId: '',
      salonId: '',
      salonServiceId: '',
      salonPackageId: '',
      makeupArtist: '',
    },
  })

  const [categoryId, purposeId, salonId] = useWatch({
    control,
    name: ['reelsCategoryId', 'reelsPurposeId', 'salonId'],
  })

  // Clear all linked fields when category or purpose changes
  useEffect(() => {
    setValue('productId', '')
    setValue('salonId', '')
    setValue('salonServiceId', '')
    setValue('salonPackageId', '')
    setValue('makeupArtist', '')
  }, [categoryId, purposeId, setValue])

  // Clear service/package when salon changes
  useEffect(() => {
    setValue('salonServiceId', '')
    setValue('salonPackageId', '')
  }, [salonId, setValue])

  // Reset whole form on open
  useEffect(() => {
    if (open) {
      reset({
        title: '', description: '',
        reelsCategoryId: '', reelsPurposeId: '',
        productId: '', salonId: '',
        salonServiceId: '', salonPackageId: '', makeupArtist: '',
      })
    }
  }, [open, reset])

  // ── Dropdown options ────────────────────────────────────────────────────────

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))
  const purposeOptions  = purposes.map((p)  => ({ value: p.id, label: p.name }))
  const salonOptions    = salons.map((s)    => ({ value: s.id, label: s.name }))
  const productOptions  = products.map((p)  => ({ value: p.id, label: p.name }))

  const filteredServices = allServices
    .filter((s) => String(s.salonId) === String(salonId))
    .map((s) => ({ value: s.id, label: s.name }))

  const filteredPackages = allPackages
    .filter((p) => String(p.salonId) === String(salonId))
    .map((p) => ({ value: p.id, label: p.name }))

  const fields = getFieldConfig(categoryId ?? '', purposeId ?? '')

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (values: FormValues) => {
    const body: CreateReelRequest = {
      title: values.title,
      description: values.description,
      reelsCategoryId: Number(values.reelsCategoryId),
      reelsPurposeId:  Number(values.reelsPurposeId),
    }

    if (fields.showProduct && values.productId)       body.productId      = Number(values.productId)
    if (fields.showSalon   && values.salonId)          body.salonId        = Number(values.salonId)
    if (fields.showService && values.salonServiceId)   body.salonServiceId = Number(values.salonServiceId)
    if (fields.showPackage && values.salonPackageId)   body.salonPackageId = Number(values.salonPackageId)
    if (fields.showMakeup  && values.makeupArtist)     body.makeupArtist   = Number(values.makeupArtist)

    try {
      const newId = await createReel(body).unwrap()
      toast.success(t('common.success'))
      onClose()
      onCreated?.(newId, values.title)
    } catch {
      toast.error(t('common.error'))
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Reel"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Title */}
        <Input
          {...register('title')}
          label="Title"
          placeholder="e.g. Summer Salon Reel"
          error={errors.title?.message}
          required
        />

        {/* Description */}
        <Input
          {...register('description')}
          label="Description"
          placeholder="Optional description…"
          error={errors.description?.message}
        />

        {/* Category + Purpose — always shown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="reelsCategoryId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Category"
                placeholder="Select category…"
                options={categoryOptions}
                error={errors.reelsCategoryId?.message}
                required
              />
            )}
          />
          <Controller
            name="reelsPurposeId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Purpose"
                placeholder="Select purpose…"
                options={purposeOptions}
                error={errors.reelsPurposeId?.message}
                required
              />
            )}
          />
        </div>

        {/* Product ID */}
        {fields.showProduct && (
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Product"
                placeholder="Select product…"
                options={productOptions}
                error={errors.productId?.message}
                required
              />
            )}
          />
        )}

        {/* Makeup Artist ID */}
        {fields.showMakeup && (
          <Input
            {...register('makeupArtist')}
            label="Makeup Artist ID"
            placeholder="Enter makeup artist ID…"
            type="number"
            error={errors.makeupArtist?.message}
          />
        )}

        {/* Salon dropdown (all salon purposes) */}
        {fields.showSalon && (
          <Controller
            name="salonId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Salon"
                placeholder="Select salon…"
                options={salonOptions}
                error={errors.salonId?.message}
              />
            )}
          />
        )}

        {/* Service — shown only for Service Marketing, enabled after salon picked */}
        {fields.showService && (
          <Controller
            name="salonServiceId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Salon Service"
                placeholder={salonId ? 'Select service…' : 'Select a salon first…'}
                options={filteredServices}
                disabled={!salonId}
                error={errors.salonServiceId?.message}
              />
            )}
          />
        )}

        {/* Package — shown only for Package Marketing, enabled after salon picked */}
        {fields.showPackage && (
          <Controller
            name="salonPackageId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Salon Package"
                placeholder={salonId ? 'Select package…' : 'Select a salon first…'}
                options={filteredPackages}
                disabled={!salonId}
                error={errors.salonPackageId?.message}
              />
            )}
          />
        )}

      </div>
    </Modal>
  )
}