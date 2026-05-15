// ─── PurchaseHeaderFields ─────────────────────────────────────────────────────
//
//  Shared form fields used by both ProductPurchaseModal and PackagingPurchaseModal.
//  Exported as a component so both modals stay DRY.

import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Input, Select } from '@/components/shared'
import {
  useGetVendorDropdownQuery,
  useGetStoreDropdownQuery,
  useGetBranchDropdownQuery,
} from '../services/purchaseApi'

// The minimal shape both form schemas share
export interface HeaderFormValues {
  purchaseDate: string
  vendorId: number
  storeId: number
  branchId: number
  note: string
}

interface PurchaseHeaderFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
  errors: FieldErrors<HeaderFormValues>
}

export default function PurchaseHeaderFields({ control, register, errors }: PurchaseHeaderFieldsProps) {
  const { data: vendors = [] } = useGetVendorDropdownQuery()
  const { data: stores = [] } = useGetStoreDropdownQuery()
  const { data: branches = [] } = useGetBranchDropdownQuery()

  const toOpts = (items: { id: number; name: string }[]) =>
    items.map((i) => ({ value: i.id, label: i.name }))

  return (
    <>
      {/* Row 1: date + vendor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register('purchaseDate')}
          label="Purchase Date"
          type="date"
          error={errors.purchaseDate?.message}
          required
        />
        <Controller
          control={control}
          name="vendorId"
          render={({ field }) => (
            <Select
              {...field}
              label="Vendor"
              options={toOpts(vendors)}
              placeholder="Select vendor…"
              error={errors.vendorId?.message}
              required
            />
          )}
        />
      </div>

      {/* Row 2: store + branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="storeId"
          render={({ field }) => (
            <Select
              {...field}
              label="Store"
              options={toOpts(stores)}
              placeholder="Select store…"
              error={errors.storeId?.message}
              required
            />
          )}
        />
        <Controller
          control={control}
          name="branchId"
          render={({ field }) => (
            <Select
              {...field}
              label="Branch"
              options={toOpts(branches)}
              placeholder="Select branch…"
              error={errors.branchId?.message}
              required
            />
          )}
        />
      </div>

      {/* Note */}
      <Input
        {...register('note')}
        label="Note"
        placeholder="Optional note…"
        error={errors.note?.message}
      />
    </>
  )
}
