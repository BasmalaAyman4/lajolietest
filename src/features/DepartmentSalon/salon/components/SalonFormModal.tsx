// ─── SalonFormModal ───────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle, MapPicker } from '@/components/shared'
import type { SalonListItem } from '../types'
import { useCreateSalonMutation, useUpdateSalonMutation } from '../services/salonApi'
import { getApiError } from '@/services/apiHelpers'
import { Controller } from 'react-hook-form'
import DatePicker from '@/components/shared/DatePicker'
import { useParams, useNavigate } from 'react-router-dom'

// ── Schema ────────────────────────────────────────────────────────────────────
const baseSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  telephone: z.string().min(1, 'Telephone is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerNationalId: z.string().min(1, 'National ID is required'),
  taxCardNo: z.string().min(1, 'Tax card number is required'),
  commertialRecordNo: z.string().min(1, 'Commercial record is required'),
  mainOfficeAddress: z.string().min(1, 'Address is required'),
  lat: z.string().default(''),
  long: z.string().default(''),
  hijabSection: z.boolean().default(false),
  childrenNotAllowed: z.boolean().default(false),
  menWorker: z.boolean().default(false),
  isTrusted: z.boolean().default(false),
  isVerify: z.boolean().default(false),
})

const createSchema = baseSchema.extend({
  ownerMobile: z.string().min(1, 'Owner mobile is required'),
  ownerPassword: z.string().min(6, 'Password must be at least 6 characters'),
  startingDate: z.string().min(1, 'Starting date is required'),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof baseSchema>

interface SalonFormModalProps {
  open: boolean
  onClose: () => void
  salon?: SalonListItem
}

export default function SalonFormModal({ open, onClose, salon }: SalonFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(salon)
  const { id } = useParams<{ id: string }>()

  const [createSalon, { isLoading: isCreating }] = useCreateSalonMutation()
  const [updateSalon, { isLoading: isUpdating }] = useUpdateSalonMutation()
  const isLoading = isCreating || isUpdating

  const schema = isEdit ? baseSchema : createSchema

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(schema as typeof createSchema),
    defaultValues: {
      nameAr: '', nameEn: '', telephone: '', ownerName: '',
      ownerNationalId: '', taxCardNo: '', commertialRecordNo: '',
      mainOfficeAddress: '', lat: '', long: '',
      ownerMobile: '', ownerPassword: '',
      hijabSection: false, childrenNotAllowed: false,
      menWorker: false, isTrusted: false, isVerify: false,
      startingDate: '',
    },
  })
  useEffect(() => {
    if (open) {
      reset(
        salon
          ? {
              nameAr: salon.nameAr, nameEn: salon.nameEn,
              telephone: salon.telephone, ownerName: salon.ownerName,
              ownerNationalId: salon.ownerNationalId, taxCardNo: salon.taxCardNo,
              commertialRecordNo: salon.commertialRecordNo,
              mainOfficeAddress: salon.mainOfficeAddress,
              lat: salon.lat , long: salon.long,
              hijabSection: salon.hijabSection,
              childrenNotAllowed: salon.childrenNotAllowed,
              menWorker: salon.menWorker, isTrusted: salon.isTrusted,
              isVerify: salon.isVerify,
              startingDate: salon.startingDate?.slice(0, 10) ?? '',
            }
          : {
              nameAr: '', nameEn: '', telephone: '', ownerName: '',
              ownerNationalId: '', taxCardNo: '', commertialRecordNo: '',
              mainOfficeAddress: '', lat: '', long: '',
              ownerMobile: '', ownerPassword: '',
              hijabSection: false, childrenNotAllowed: false,
              menWorker: false, isTrusted: false, isVerify: false,
              startingDate: '',
            },
      )
    }
  }, [open, salon, reset])

  const onSubmit = async (values: CreateFormValues) => {
    try {
      if (isEdit && salon) {
    
        await updateSalon({ id:Number(id), ...values }).unwrap()
        toast.success('Salon updated successfully')
      } else {
        await createSalon(values).unwrap()
        toast.success('Salon created successfully')
      }
      onClose()
    } catch (error) {
toast.error(getApiError(error, t('common.error')))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Salon' : 'Add Salon'}
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
      <div className="flex flex-col gap-6">
        {/* Basic Info */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('nameEn')}
              label="Name (EN)"
              placeholder="e.g. Zakaria Salon"
              error={errors.nameEn?.message}
              required
            />
            <Input
              {...register('nameAr')}
              label="Name (AR)"
              placeholder="مثال: صالون زكريا"
              error={errors.nameAr?.message}
              dir="rtl"
              required
            />
            <Input
              {...register('telephone')}
              label="Telephone"
              placeholder="01XXXXXXXXX"
              error={errors.telephone?.message}
              required
            />
            <Input
              {...register('taxCardNo')}
              label="Tax Card No."
              placeholder="Tax card number"
              error={errors.taxCardNo?.message}
              required
            />
            <Input
              {...register('commertialRecordNo')}
              label="Commercial Record No."
              placeholder="Commercial record number"
              error={errors.commertialRecordNo?.message}
              required
            />
            <Controller
control={control}
  name="startingDate"
  render={({ field }) => (
    <DatePicker
      value={field.value}
      onChange={field.onChange}
      label="Starting Date"
      placeholder="Select starting date"
      error={(errors as any).startingDate?.message}
      required
    />
  )}
/>
          </div>
        </section>

        {/* Owner Info */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Owner Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('ownerName')}
              label="Owner Name"
              placeholder="Owner full name"
              error={errors.ownerName?.message}
              required
            />
            <Input
              {...register('ownerNationalId')}
              label="Owner National ID"
              placeholder="National ID number"
              error={errors.ownerNationalId?.message}
              required
            />
            {!isEdit && (
              <>
                <Input
                  {...register('ownerMobile')}
                  label="Owner Mobile"
                  placeholder="01XXXXXXXXX"
                  error={(errors as any).ownerMobile?.message}
                  required
                />
                <Input
                  {...register('ownerPassword')}
                  label="Owner Password"
                  type="password"
                  placeholder="Min. 6 characters"
                  error={(errors as any).ownerPassword?.message}
                  required
                />
              </>
            )}
          </div>
        </section>

        {/* Location */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Location
          </h3>
          <MapPicker
            label="Pick Location"
            value={{
              address: watch('mainOfficeAddress'),
              latitude: watch('lat'),
              longitude: watch('long'),
            }}
            onChange={(v) => {
              setValue('mainOfficeAddress', v.address)
              setValue('lat', v.latitude)
              setValue('long', v.longitude)
            }}
            error={errors.mainOfficeAddress?.message}
            height={280}
          />
        </section>

        {/* Toggles */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                { name: 'hijabSection', label: 'Hijab Section' },
                { name: 'childrenNotAllowed', label: 'Children Not Allowed' },
                { name: 'menWorker', label: 'Men Worker' },
                { name: 'isTrusted', label: 'Trusted' },
                { name: 'isVerify', label: 'Verified' },
              ] as const
            ).map(({ name, label }) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--border)] px-4 py-2.5"
              >
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                <Toggle
                  checked={watch(name)}
                  onChange={(v) => setValue(name, v)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  )
}