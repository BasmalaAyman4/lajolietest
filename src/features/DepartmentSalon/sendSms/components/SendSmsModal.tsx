import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { Modal, Button, MultiSelect } from '@/components/shared'
import { useSendSmsToSalonsMutation, useGetSalonDropdownQuery } from '../services/sendSmsApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Max 500 characters'),
  salonIds: z.array(z.number()).min(1, 'Select at least one salon'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export default function SendSmsModal({ open, onClose }: Props) {
  const { t } = useTranslation()

  const { data: salons = [] } = useGetSalonDropdownQuery()
  const [sendSms, { isLoading }] = useSendSmsToSalonsMutation()

  const salonOptions = salons.map((s) => ({ label: s.name, value: s.id }))

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: '', salonIds: [] },
  })

  const message = watch('message')

  useEffect(() => {
    if (open) reset({ message: '', salonIds: [] })
  }, [open, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await sendSms(values).unwrap()
      toast.success('SMS sent successfully')
      onClose()
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send SMS to Salons"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            Send SMS
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        <Controller
          control={control}
          name="salonIds"
          render={({ field }) => (
            <MultiSelect
              label="Salons"
              required
              options={salonOptions}
              value={field.value}
              onChange={(vals) => field.onChange(vals.map(Number))}
              placeholder="Select salons…"
              error={errors.salonIds?.message}
            />
          )}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Message
            <span className="text-[var(--danger)] ms-1">*</span>
          </label>
          <textarea
            {...register('message')}
            rows={5}
            maxLength={500}
            placeholder="Type your SMS message…"
            className={cn(
              'w-full rounded-[var(--radius)] border px-3 py-2.5 text-sm',
              'bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'outline-none resize-none transition-colors',
              errors.message
                ? 'border-[var(--danger)] ring-1 ring-[var(--danger)]'
                : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
            )}
          />
          <div className="flex items-center justify-between">
            {errors.message
              ? <p className="text-xs text-[var(--danger)]">{errors.message.message}</p>
              : <span />
            }
            <span className="text-xs text-[var(--text-muted)] ms-auto">
              {message.length}/500
            </span>
          </div>
        </div>

      </div>
    </Modal>
  )
}