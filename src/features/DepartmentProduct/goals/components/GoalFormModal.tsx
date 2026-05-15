// ─── GoalFormModal ────────────────────────────────────────────────────────────
//
//  codeKey only accepts CAPITAL LETTERS and underscores.
//  beautyCategoriesId is a required single-select from the beauty category dropdown.

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Toggle, Select } from '@/components/shared'
import type { Goal } from '../types'
import {
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useGetBeautyCategoryDropdownQuery,
} from '../services/goalApi'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  codeKey: z
    .string()
    .min(1, 'Code key is required')
    .regex(/^[A-Z_]+$/, 'Only capital letters and underscores allowed (e.g. HAIR_GROWTH)'),
  beautyCategoriesId: z.coerce.number().min(1, 'Beauty category is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

type FormValues = z.infer<typeof schema>

interface GoalFormModalProps {
  open: boolean
  onClose: () => void
  goal?: Goal
  onCreated?: (id: number) => void
}

export default function GoalFormModal({ open, onClose, goal, onCreated }: GoalFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(goal)

  const [createGoal, { isLoading: isCreating }] = useCreateGoalMutation()
  const [updateGoal, { isLoading: isUpdating }] = useUpdateGoalMutation()
  const isLoading = isCreating || isUpdating

  const { data: beautyCategories = [] } = useGetBeautyCategoryDropdownQuery()
  const beautyCategoryOptions = beautyCategories.map((bc) => ({ value: bc.id, label: bc.name }))

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', codeKey: '', beautyCategoriesId: 0, isActive: true, sortOrder: 0 },
  })

  useEffect(() => {
    if (open) {
      reset(
        goal
          ? {
              nameAr: goal.nameAr,
              nameEn: goal.nameEn,
              codeKey: goal.codeKey,
              beautyCategoriesId: goal.beautyCategoriesId,
              isActive: goal.isActive,
              sortOrder: goal.sortOrder,
            }
          : { nameAr: '', nameEn: '', codeKey: '', beautyCategoriesId: 0, isActive: true, sortOrder: 0 },
      )
    }
  }, [open, goal, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, isActive: values.isActive ? 1 : 0 }
    try {
      if (isEdit && goal) {
        await updateGoal({ id: goal.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createGoal(payload).unwrap()
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
      title={isEdit ? 'Edit Goal' : 'Add Goal'}
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
          <Input {...register('nameEn')} label="Name (EN)" placeholder="e.g. Hair Growth" error={errors.nameEn?.message} required />
          <Input {...register('nameAr')} label="Name (AR)" placeholder="مثال: نمو الشعر" error={errors.nameAr?.message} dir="rtl" required />
        </div>

        <Input
          {...register('codeKey', {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '')
            },
          })}
          label="Code Key"
          placeholder="e.g. HAIR_GROWTH"
          hint="Capital letters and underscores only"
          error={errors.codeKey?.message}
          required
        />

        {/* Beauty Category single-select */}
        <Controller
          control={control}
          name="beautyCategoriesId"
          render={({ field }) => (
            <Select
              {...field}
              label="Beauty Category"
              options={beautyCategoryOptions}
              placeholder="Select beauty category"
              error={errors.beautyCategoriesId?.message}
              required
            />
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('sortOrder')} label="Sort Order" type="number" min={0} placeholder="0" error={errors.sortOrder?.message} />
          <div className="flex items-center pt-6">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Toggle label="Active" checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>

      </div>
    </Modal>
  )
}