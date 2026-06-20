// ─── StoreFormModal ───────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { Store } from '../types'
import { useCreateStoreMutation, useUpdateStoreMutation } from '../services/storeApi'
import { getApiError } from '@/services/apiHelpers'

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().default(''),
})

type FormValues = z.infer<typeof schema>

interface StoreFormModalProps {
  open: boolean
  onClose: () => void
  store?: Store
}

export default function StoreFormModal({ open, onClose, store }: StoreFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(store)
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation()
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        store
          ? { nameAr: store.nameAr, nameEn: store.nameEn, description: store.description }
          : { nameAr: '', nameEn: '', description: '' },
      )
    }
  }, [open, store, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && store) {
        await updateStore({ id: store.id, ...values }).unwrap()
      } else {
        await createStore(values).unwrap()
      }
      toast.success(t('common.success'))
      onClose()
    } catch (error: any) {
          toast.error(getApiError(error, t('common.error')))
        }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Store' : 'Add Store'} size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>{isEdit ? t('common.save') : t('common.add', 'Add')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('nameEn')} label="Name (EN)" placeholder="e.g. Cairo Store" error={errors.nameEn?.message} required />
          <Input {...register('nameAr')} label="Name (AR)" placeholder="مثال: متجر القاهرة" error={errors.nameAr?.message} dir="rtl" required />
        </div>
        <Input {...register('description')} label="Description" placeholder="Optional description…" error={errors.description?.message} />
      </div>
    </Modal>
  )
}