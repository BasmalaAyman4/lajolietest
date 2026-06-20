
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { Country } from '../types'
import { useCreateCountryMutation, useUpdateCountryMutation } from '../services/countryApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
})

type FormValues = z.infer<typeof schema>

interface CountryFormModelProps {
  open: boolean
  onClose: () => void
  country?: Country
}

export default function CountryFormModel({ open, onClose, country }: CountryFormModelProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(country)

  const [createCountry, { isLoading: isCreating }] = useCreateCountryMutation()
  const [updateCountry, { isLoading: isUpdating }] = useUpdateCountryMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        country
          ? { nameAr: country.nameAr, nameEn: country.nameEn }
          : { nameAr: '', nameEn: '' },
      )
    }
  }, [open, country, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && country) {
        await updateCountry({ id: country.id, ...values }).unwrap()
        toast.success(t('common.success'))
      } else {
        await createCountry(values).unwrap()
        toast.success(t('common.success'))
      }
      onClose()
    }  catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit country' : 'Add country'}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('nameEn')}
            label="Name (EN)"
            placeholder="e.g. Report"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label="Name (AR)"
            placeholder="مثال: تقرير"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

     
      </div>
    </Modal>
  )
}
