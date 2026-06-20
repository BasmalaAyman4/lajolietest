import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Button, Select } from '@/components/shared'
import RichEditor from '@/components/shared/RichEditor'
import {
  useCreateTermsAndConditionsMutation,
  useGetTermsTypeDropdownQuery,
} from '../services/termsAndConditionsApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  descriptionEn: z.string().min(1, 'English description is required'),
  descriptionAr: z.string().min(1, 'Arabic description is required'),
  termsTypeId: z.number({ error: 'Please select a type' }).min(1, 'Type is required'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export default function TermsAndConditionsFormModal({ open, onClose }: Props) {
  const { t } = useTranslation()

  const { data: typeOptions = [] } = useGetTermsTypeDropdownQuery()
  const [create, { isLoading }] = useCreateTermsAndConditionsMutation()

  const {
    handleSubmit,
    reset,
    control,
    register,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { descriptionAr: '', descriptionEn: '', termsTypeId: 0 },
  })

  useEffect(() => {
    if (open) reset({ descriptionAr: '', descriptionEn: '', termsTypeId: 0 })
  }, [open, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await create(values).unwrap()
      toast.success(t('common.success'))
      onClose()
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Terms & Conditions"
      size="xl"
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
      <div className="flex flex-col gap-5">
        <Select
          {...register('termsTypeId', { valueAsNumber: true })}
          label="Terms Type"
          required
          error={errors.termsTypeId?.message}
          options={[
            { label: 'Select type…', value: 0 },
            ...typeOptions.map((o) => ({ label: o.name, value: o.id })),
          ]}
        />

        <Controller
          control={control}
          name="descriptionEn"
          render={({ field }) => (
            <RichEditor
              label="Description (EN)"
              value={field.value}
              onChange={field.onChange}
              error={errors.descriptionEn?.message}
              direction="ltr"
              height={280}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="descriptionAr"
          render={({ field }) => (
            <RichEditor
              label="Description (AR)"
              value={field.value}
              onChange={field.onChange}
              error={errors.descriptionAr?.message}
              direction="rtl"
              height={280}
              required
            />
          )}
        />
      </div>
    </Modal>
  )
}