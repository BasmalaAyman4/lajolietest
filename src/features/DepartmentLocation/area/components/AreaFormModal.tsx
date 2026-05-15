
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Select, Button } from '@/components/shared'
import type { DropdownOption } from '@/types'
import type { CityOption, Area } from '../types'
import {
  useCreateAreaMutation,
  useUpdateAreaMutation,
} from '../services/areaApi'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  cityId: z.coerce.number().min(1, 'City is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface CityFormModalProps {
  open: boolean
  onClose: () => void
  /** Pass to enter edit mode */
  area?: Area
  cities: CityOption[]
  /** Called after successful create, with the new specialist id */
  onCreated?: (id: number) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CityFormModal({
  open,
  onClose,
  area,
  cities,
  onCreated,
}: CityFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(area)

  const [createArea, { isLoading: isCreating }] = useCreateAreaMutation()
  const [updateArea, { isLoading: isUpdating }] = useUpdateAreaMutation()
  const isLoading = isCreating || isUpdating

  const cityOptions: DropdownOption[] = cities.map((j) => ({
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
    defaultValues: { cityId: 0, nameAr: '', nameEn: '' },
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        area
          ? { cityId: area.cityId, nameAr: area.nameAr, nameEn: area.nameEn }
          : { cityId: 0, nameAr: '', nameEn: '' },
      )
    }
  }, [open, area, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && area) {
        await updateArea({ id: area.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createArea(values).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('area.editArea', 'Edit Area') : t('area.addArea', 'Add Area')}
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
          name="cityId"
          control={control}
          render={({ field }) => (
            <Select
              label={t('city.city', 'City')}
              options={cityOptions}
              placeholder={t('country.selectCountry', 'Select a city')}
              error={errors.cityId?.message}
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

       

      </div>
    </Modal>
  )
}