
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Select, Button, Toggle, DatePicker } from '@/components/shared'
import type { DropdownOption } from '@/types'
import {
  useCreateCollaboratorVoucherMutation,
  useUpdateCollaboratorVoucherMutation,
} from '../services/collaborationVoucher'
import type { CollaboratorVoucherDetail, CollaboratorVoucherOption } from '../types'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  collaboratorId: z.coerce.number().min(1, 'collaborator is required'),
  vvalue: z.coerce.number().min(0, 'vvalue is required'),
  fromDate: z.coerce.string().min(0, 'from date is required'),
  toDate: z.coerce.string().min(0, 'to date is required'),
  maxDeduct: z.coerce.number().min(0, 'max deduct is required'),
  isPercentage: z.boolean().default(false),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface CollaborationVoucherFormModalProps {
  open: boolean
  onClose: () => void
  /** Pass to enter edit mode */
  CollaboratorVoucher?: CollaboratorVoucherDetail
  collaborators: CollaboratorVoucherOption[]
  /** Called after successful create, with the new specialist id */
  onCreated?: (id: number) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CollaborationVoucherFormModal({
  open,
  onClose,
  CollaboratorVoucher,
  collaborators,
  onCreated,
}: CollaborationVoucherFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(CollaboratorVoucher)

  const [createCollaboratorVoucher, { isLoading: isCreating }] = useCreateCollaboratorVoucherMutation()
  const [updateCollaboratorVoucher, { isLoading: isUpdating }] = useUpdateCollaboratorVoucherMutation()
  const isLoading = isCreating || isUpdating

  const collaboratorOptions: DropdownOption[] = collaborators.map((j) => ({
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
    defaultValues: { collaboratorId: 0, vvalue: 0, fromDate: '', toDate: '', maxDeduct: 0, isPercentage: false },
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        CollaboratorVoucher
          ? { collaboratorId: CollaboratorVoucher.collaboratorId, vvalue: CollaboratorVoucher.vvalue, fromDate: CollaboratorVoucher.fromDate, toDate: CollaboratorVoucher.toDate, maxDeduct: CollaboratorVoucher.maxDeduct, isPercentage: CollaboratorVoucher.isPercentage }
          : { collaboratorId: 0, vvalue: 0, fromDate: '', toDate: '', maxDeduct: 0, isPercentage: false },
      )
    }
  }, [open, CollaboratorVoucher, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && CollaboratorVoucher) {
        await updateCollaboratorVoucher({ id: CollaboratorVoucher.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createCollaboratorVoucher(values).unwrap()
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
      title={isEdit ? t('CollaboratorVoucher.editCollaboratorVoucher', 'Edit Collaborator Voucher') : t('CollaboratorVoucher.addCollaboratorVoucher', 'Add Collaborator Voucher')}
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
          name="collaboratorId"
          control={control}
          render={({ field }) => (
            <Select
              label={t('collaborator.collaborator', 'Collaborator')}
              options={collaboratorOptions}
              placeholder={t('country.selectCountry', 'Select a country')}
              error={errors.collaboratorId?.message}
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
            {...register('vvalue')}
            label={t('CollaboratorVoucher.vvalue', 'Vvalue')}
            placeholder="e.g. Helwan"
            error={errors.vvalue?.message}
            required
          />
          <Input
            {...register('maxDeduct')}
            label={t('CollaboratorVoucher.maxDeduct', 'Max Deduct')}
            placeholder="مثال: حلوان"
            error={errors.maxDeduct?.message}
            dir="rtl"
            required
          />
        </div>

          <div className="grid grid-cols-2 gap-4">
                   <Controller
                     control={control}
                     name="fromDate"
                     render={({ field }) => (
                       <DatePicker
                         value={field.value}
                         onChange={field.onChange}
                         label={t('branch.fromTime', 'From Date')}
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
                         label={t('branch.toDate', 'To Date')}
                         error={errors.toDate?.message}
                         required
                       />
                     )}
                   />
                 </div>
        <div className="flex items-center pt-6">
            <Controller
              control={control}
              name="isPercentage"
              render={({ field }) => (
                <Toggle label="Is Percentage" checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
      </div>
    </Modal>
  )
}