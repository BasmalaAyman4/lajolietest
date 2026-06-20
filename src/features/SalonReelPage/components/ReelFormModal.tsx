// ─── ReelFormModal ────────────────────────────────────────────────────────────
//
//  Create-only modal (reels aren't editable after creation).
//  On success → returns the new reel id via onCreated.

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button, Textarea } from '@/components/shared'
import { useCreateSalonReelMutation } from '../services/salonReelApi'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface ReelFormModalProps {
  open: boolean
  onClose: () => void
  onCreated: (id: number, title: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ReelFormModal({ open, onClose, onCreated }: ReelFormModalProps) {
  const { t } = useTranslation()
  const [createReel, { isLoading }] = useCreateSalonReelMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  })

  useEffect(() => {
    if (open) reset({ title: '', description: '' })
  }, [open, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const newId = await createReel(values).unwrap()
      toast.success(t('common.success'))
      onClose()
      onCreated(newId, values.title)
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('reel.addReel', 'Add Reel')}
      size="md"
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
      <div className="flex flex-col gap-4">
        <Input
          {...register('title')}
          label={t('reel.title', 'Title')}
          placeholder={t('reel.titlePlaceholder', 'e.g. Summer Hair Trends')}
          error={errors.title?.message}
          required
        />
        <Textarea
          {...register('description')}
          label={t('reel.description', 'Description')}
          placeholder={t('reel.descriptionPlaceholder', 'Short description about this reel…')}
          error={errors.description?.message}
          rows={3}
          required
        />
      </div>
    </Modal>
  )
}