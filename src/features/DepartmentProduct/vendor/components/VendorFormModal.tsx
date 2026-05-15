// ─── VendorFormModal ──────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Modal, Input, Button } from '@/components/shared'
import type { Vendor } from '../types'
import { useCreateVendorMutation, useUpdateVendorMutation } from '../service/vendorApi'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  mobile: z.string().min(1, 'Mobile is required'),
  telephone: z.string().default(''),
  email: z.string().email('Enter a valid email').min(1, 'Email is required'),
})

type FormValues = z.infer<typeof schema>

interface VendorFormModalProps {
  open: boolean
  onClose: () => void
  vendor?: Vendor
}

export default function VendorFormModal({ open, onClose, vendor }: VendorFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(vendor)
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation()
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '', mobile: '', telephone: '', email: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        vendor
          ? { name: vendor.name, address: vendor.address, mobile: vendor.mobile, telephone: vendor.telephone, email: vendor.email }
          : { name: '', address: '', mobile: '', telephone: '', email: '' },
      )
    }
  }, [open, vendor, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && vendor) {
        await updateVendor({ id: vendor.id, ...values }).unwrap()
      } else {
        await createVendor(values).unwrap()
      }
      toast.success(t('common.success'))
      onClose()
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Vendor' : 'Add Vendor'} size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>{isEdit ? t('common.save') : t('common.add', 'Add')}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">

        <Input {...register('name')} label="Vendor Name" placeholder="e.g. ABC Supplies Co." error={errors.name?.message} required />

        <Input {...register('email')} label="Email" type="email" placeholder="vendor@example.com" error={errors.email?.message} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...register('mobile')} label="Mobile" placeholder="+20 10 0000 0000" error={errors.mobile?.message} required />
          <Input {...register('telephone')} label="Telephone" placeholder="+20 2 0000 0000" error={errors.telephone?.message} />
        </div>

        <Input {...register('address')} label="Address" placeholder="Street, City, Country" error={errors.address?.message} required />

      </div>
    </Modal>
  )
}