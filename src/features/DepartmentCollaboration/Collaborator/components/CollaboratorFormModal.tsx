
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Select, Button } from '@/components/shared'
import type { DropdownOption } from '@/types'
import type { Collaborator } from '../types'
import {
  useCreateCollaboratorMutation} from '../services/collaboratorApi'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, ' name is required'),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface CollaboratorFormModalProps {
  open: boolean
  onClose: () => void
  /** Pass to enter edit mode */
  collaborator?: Collaborator
 
  /** Called after successful create, with the new specialist id */
  onCreated?: (id: number) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CollaboratorFormModal({
  open,
  onClose,
  collaborator,

  onCreated,
}: CollaboratorFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(collaborator)

  const [createCollaborator, { isLoading: isCreating }] = useCreateCollaboratorMutation()
  
  const isLoading = isCreating 

 

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name:'' },
  })



  const onSubmit = async (values: FormValues) => {
    try {
    
        const newId = await createCollaborator(values).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ t('collaborator.addCollaborator', 'Add Collaborator')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
            { t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
       

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          <Input
            {...register('name')}
            label={t('collaborator.name', 'Name')}
            placeholder="e.g. name"
            error={errors.name?.message}
            required
          />
         
        </div>



      </div>
    </Modal>
  )
}