// ─── SizeFormModal ────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, TimePicker } from '@/components/shared'
import { useCreateRoutineTypeMutation, useUpdateRoutineTypeMutation } from '../services/routineApi'
import type { RoutineType } from '../types'


// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')

/** { hour, minute } → "HH:mm:ss" */
const formatTime = (time: { hour: number; minute: number }): string =>
  `${pad(time.hour)}:${pad(time.minute)}:00`

/** "HH:mm:ss" → { hour, minute } — for populating the form when editing */
const parseTime = (str: string): { hour: number; minute: number } => {
  const [h, m] = str.split(':').map(Number)
  return { hour: h ?? 0, minute: m ?? 0 }
}

// ── Schema ────────────────────────────────────────────────────────────────────
const timeSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
})
const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().default(''),
   fromTime: timeSchema,
  toTime: timeSchema,
})

type FormValues = z.infer<typeof schema>

interface RoutineFormModelProps {
  open: boolean
  onClose: () => void
  routine?: RoutineType
}

export default function RoutineFormModel({ open, onClose, routine }: RoutineFormModelProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(routine)

  const [createRoutine, { isLoading: isCreating }] = useCreateRoutineTypeMutation()
  const [updateRoutine, { isLoading: isUpdating }] = useUpdateRoutineTypeMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset,control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        routine
          ? { nameAr: routine.nameAr, nameEn: routine.nameEn, 
            description: routine.description,fromTime: parseTime(routine.fromTime), 
            toTime: parseTime(routine.toTime) }
          : { nameAr: '', nameEn: '', description: '',fromTime: { hour: 0, minute: 0 }, 
            toTime: { hour: 0, minute: 0 } },
      )
    }
  }, [open, routine, reset])

  const onSubmit = async (values: FormValues) => {
      const payload = {
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      description: values.description,
      fromTime: formatTime(values.fromTime),
      toTime: formatTime(values.toTime),
    }

    try {
      if (isEdit && routine) {
        await updateRoutine({ id: routine.id, ...payload }).unwrap()
      } else {
        await createRoutine(payload).unwrap()
      }
      toast.success(t('common.success'))
      onClose()
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Routine Type' : 'Add Routine Type'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {isEdit ? t('common.save') : t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('nameEn')} label="Name (EN)" placeholder="e.g. Routine" error={errors.nameEn?.message} required />
          <Input {...register('nameAr')} label="Name (AR)" placeholder="مثال: إجراء يومي" error={errors.nameAr?.message} dir="rtl" required />
        </div>
        <Input {...register('description')} label="Description" placeholder="Optional description…" error={errors.description?.message} />
       <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="fromTime"
              render={({ field }) => (
                <TimePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t('branch.fromTime', 'From Time')}
                  error={errors.fromTime?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="toTime"
              render={({ field }) => (
                <TimePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t('branch.toTime', 'To Time')}
                  error={errors.toTime?.message}
                  required
                />
              )}
            />
          </div>
      </div>
    </Modal>
  )
}