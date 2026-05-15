
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { Report } from '../types'
import { useCreateReportMutation, useUpdateReportMutation } from '../services/reportApi'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
})

type FormValues = z.infer<typeof schema>

interface ReportFormModelProps {
  open: boolean
  onClose: () => void
  report?: Report
}

export default function ReportFormModel({ open, onClose, report }: ReportFormModelProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(report)

  const [createReport, { isLoading: isCreating }] = useCreateReportMutation()
  const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation()
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
        report
          ? { nameAr: report.nameAr, nameEn: report.nameEn }
          : { nameAr: '', nameEn: '' },
      )
    }
  }, [open, report, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && report) {
        await updateReport({ id: report.id, ...values }).unwrap()
        toast.success(t('common.success'))
      } else {
        await createReport(values).unwrap()
        toast.success(t('common.success'))
      }
      onClose()
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Report Issue' : 'Add Report Issue'}
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
