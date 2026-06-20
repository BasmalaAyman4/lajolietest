
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Select, Button } from '@/components/shared'
import type { DropdownOption } from '@/types'
import type { CountryOption, City } from '../types'
import {
  useCreateCityMutation,
  useUpdateCityMutation,
} from '../services/cityApi'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  countryId: z.coerce.number().min(1, 'Country is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  shippingCost: z.coerce.number().min(0, 'Shipping cost is required'),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface CityFormModalProps {
  open: boolean
  onClose: () => void
  /** Pass to enter edit mode */
  city?: City
  countries: CountryOption[]
  /** Called after successful create, with the new specialist id */
  onCreated?: (id: number) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CityFormModal({
  open,
  onClose,
  city,
  countries,
  onCreated,
}: CityFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(city)

  const [createCity, { isLoading: isCreating }] = useCreateCityMutation()
  const [updateCity, { isLoading: isUpdating }] = useUpdateCityMutation()
  const isLoading = isCreating || isUpdating

  const countryOptions: DropdownOption[] = countries.map((j) => ({
    value: j.id,
    label: j.name,
  }))

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { countryId: 0, nameAr: '', nameEn: '' },
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        city
          ? { countryId: city.countryId, nameAr: city.nameAr, nameEn: city.nameEn, shippingCost: city.shippingCost }
          : { countryId: 0, nameAr: '', nameEn: '', shippingCost: 0 },
      )
    }
  }, [open, city, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && city) {
        await updateCity({ id: city.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createCity(values).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    }  catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('city.editCity', 'Edit City') : t('city.addCity', 'Add City')}
      size="md"
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
      <div className="flex flex-col gap-4">
        {/* Job */}
        <Controller
          name="countryId"
          control={control}
          render={({ field }) => (
            <Select
              label={t('country.country', 'Country')}
              options={countryOptions}
              placeholder={t('country.selectCountry', 'Select a country')}
              error={errors.countryId?.message}
              required
              name={field.name}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('nameEn')}
            label={t('specialist.nameEn', 'Name (EN)')}
            placeholder="e.g. Helwan"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label={t('specialist.nameAr', 'Name (AR)')}
            placeholder="مثال: حلوان"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

        <Input
          {...register('shippingCost')}
          label={t('specialist.shippingCost', 'Shipping Cost')}
          placeholder="e.g. 10"
          error={errors.shippingCost?.message}
          type="number"
          required
        />

      </div>
    </Modal>
  )
}