// ─── BranchFormModal ──────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { Branch } from '../types'
import { useCreateBranchMutation, useUpdateBranchMutation } from '../services/branchApi'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().default(''),
})

type FormValues = z.infer<typeof schema>

interface BranchFormModalProps {
  open: boolean
  onClose: () => void
  branch?: Branch
}

export default function BranchFormModal({ open, onClose, branch }: BranchFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(branch)

  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation()
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        branch
          ? { nameAr: branch.nameAr, nameEn: branch.nameEn, description: branch.description }
          : { nameAr: '', nameEn: '', description: '' },
      )
    }
  }, [open, branch, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && branch) {
        await updateBranch({ id: branch.id, ...values }).unwrap()
        toast.success(t('common.success'))
      } else {
        await createBranch(values).unwrap()
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
      title={isEdit ? 'Edit Branch' : 'Add Branch'}
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
            placeholder="e.g. Cairo Branch"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label="Name (AR)"
            placeholder="مثال: فرع القاهرة"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

        <Input
          {...register('description')}
          label="Description"
          placeholder="Optional description…"
          error={errors.description?.message}
        />

      </div>
    </Modal>
  )
}
