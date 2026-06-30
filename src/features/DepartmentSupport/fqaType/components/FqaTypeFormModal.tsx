
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Textarea } from '@/components/shared'
import type { FqaType } from '../types'
import {
  useCreateFqaTypeMutation,
  useUpdateFqaTypeMutation,
} from '../services/fqaTypeApi'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface FqaTypeFormModalProps {
  open: boolean
  onClose: () => void
  /** Pass to enter edit mode */
  fqaType?: FqaType
  /** Called after successful create, with the new category id */
  onCreated?: (id: number) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FqaTypeFormModal({
  open,
  onClose,
  fqaType,
  onCreated,
}: FqaTypeFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(fqaType)

  const [createFqaType, { isLoading: isCreating }] = useCreateFqaTypeMutation()
  const [updateFqaType, { isLoading: isUpdating }] = useUpdateFqaTypeMutation()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: ''},
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        fqaType
          ? { nameAr: fqaType.nameAr, nameEn: fqaType.nameEn }
          : { nameAr: '', nameEn: ''},
      )
    }
  }, [open, fqaType, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && fqaType) {
        await updateFqaType({ id: fqaType.id, ...values }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createFqaType(values).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('fqaType.editFqaType') : t('fqaType.addFqaType')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            {isEdit ? t('common.save') : t('fqaType.addFqaType', 'Add FAQ Type')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('nameEn')}
            label={t('fqaType.nameEn')}
            placeholder="e.g. Electronics"
            error={errors.nameEn?.message}
            required
          />
          <Input
            {...register('nameAr')}
            label={t('fqaType.nameAr')}
            placeholder="مثال: إلكترونيات"
            error={errors.nameAr?.message}
            dir="rtl"
            required
          />
        </div>

       
      </div>
    </Modal>
  )
}