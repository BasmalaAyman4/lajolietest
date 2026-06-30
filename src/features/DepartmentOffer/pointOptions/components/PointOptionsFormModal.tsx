import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import { useSavePointOptionMutation } from '../services/pointOptionsApi'
import type { PointOption } from '../types'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  rate: z.coerce.number().min(0, 'Rate must be 0 or more'),
  expireIn: z.coerce.number().min(0, 'Expiry days must be 0 or more'),
  maxDeduct: z.coerce.number().min(0, 'Max deduct must be 0 or more'),
  completeDataPoint: z.coerce.number().min(0, 'Profile points must be 0 or more'),
  rateOrderPoint: z.coerce.number().min(0, 'Spend points for orders must be 0 or more'),
  rateAppointmentPoint: z.coerce.number().min(0, 'Spend points for appointments must be 0 or more'),
})

type FormValues = z.infer<typeof schema>

interface PointOptionsFormModalProps {
  open: boolean
  onClose: () => void
  initialData?: PointOption
}

export default function PointOptionsFormModal({
  open,
  onClose,
  initialData,
}: PointOptionsFormModalProps) {
  const { t } = useTranslation()
  const [savePointOption, { isLoading }] = useSavePointOptionMutation()

  const { handleSubmit, reset, register, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      rate: 0,
      expireIn: 0,
      maxDeduct: 0,
      completeDataPoint: 0,
      rateOrderPoint: 0,
      rateAppointmentPoint: 0,
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          rate: initialData.rate,
          expireIn: initialData.expireIn,
          maxDeduct: initialData.maxDeduct,
          completeDataPoint: initialData.completeDataPoint,
          rateOrderPoint: initialData.rateOrderPoint,
          rateAppointmentPoint: initialData.rateAppointmentPoint,
        })
      } else {
        reset({
          rate: 0,
          expireIn: 0,
          maxDeduct: 0,
          completeDataPoint: 0,
          rateOrderPoint: 0,
          rateAppointmentPoint: 0,
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await savePointOption(values).unwrap()
      toast.success(t('common.success', 'Settings saved successfully'))
      onClose()
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error', 'An error occurred')))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('pointOption.editTitle', 'Edit Point Options')}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {t('common.save', 'Save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Conversion & Validity settings */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
            {t('pointOption.basicSettings', 'Basic Configuration')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              {...register('rate')}
              label={t('pointOption.rate', 'Conversion Rate')}
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 1 point = X value"
              error={errors.rate?.message}
              required
            />
            <Input
              {...register('expireIn')}
              label={t('pointOption.expireIn', 'Expiration Period (Days)')}
              type="number"
              min={0}
              placeholder="e.g. 365"
              error={errors.expireIn?.message}
              required
            />
            <Input
              {...register('maxDeduct')}
              label={t('pointOption.maxDeduct', 'Max Deductible Value')}
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 100"
              error={errors.maxDeduct?.message}
              required
            />
          </div>
        </div>

        {/* Reward Rules */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
            {t('pointOption.rewardSettings', 'Reward Rules')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              {...register('completeDataPoint')}
              label={t('pointOption.completeDataPoint', 'Complete Profile Points')}
              type="number"
              min={0}
              placeholder="e.g. 50"
              error={errors.completeDataPoint?.message}
              required
            />
            <Input
              {...register('rateOrderPoint')}
              label={t('pointOption.rateOrderPoint', 'Spent Order Points Rate')}
              type="number"
              min={0}
              placeholder="e.g. 1 point per 1 spend"
              error={errors.rateOrderPoint?.message}
              required
            />
            <Input
              {...register('rateAppointmentPoint')}
              label={t('pointOption.rateAppointmentPoint', 'Spent Appointment Points Rate')}
              type="number"
              min={0}
              placeholder="e.g. 1 point per 1 spend"
              error={errors.rateAppointmentPoint?.message}
              required
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
