import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { Modal, Input, Select, Button, Toggle, DatePicker, MultiSelect, StatusBadge } from '@/components/shared'
import type { DropdownOption } from '@/types'
import {
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useGetUserDropdownQuery,
  useGetVoucherTargetTypeDropdownQuery,
  useGetProductDropdownQuery,
  useLazyGetProductDetailsQuery,
  useGetCategoryDropdownQuery,
  useGetSubCategoryDropdownQuery,
  useGetBrandDropdownQuery,
  useGetSalonDropdownQuery,
  useGetSalonServiceDropdownQuery,
  useLazyGetVoucherQuery,
  useStopVoucherDetailMutation,
} from '../services/voucherApi'
import type { Voucher, VoucherTarget, ProductDetailOption, VoucherListItem, VoucherTargetDetail } from '../types'
import { getApiError } from '@/services/apiHelpers'

// ── Date parsing helper ───────────────────────────────────────────────────────
const parseDateToYMD = (dateStr: string | undefined | null): string => {
  if (!dateStr) return ''
  
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0]
  }

  const dmyDashRegex = /^(\d{2})-(\d{2})-(\d{4})$/
  const matchDash = dateStr.match(dmyDashRegex)
  if (matchDash) {
    const [, day, month, year] = matchDash
    return `${year}-${month}-${day}`
  }

  const dmySlashRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
  const matchSlash = dateStr.match(dmySlashRegex)
  if (matchSlash) {
    const [, day, month, year] = matchSlash
    return `${year}-${month}-${day}`
  }

  const ymdRegex = /^\d{4}-\d{2}-\d{2}$/
  if (ymdRegex.test(dateStr)) {
    return dateStr
  }

  try {
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear()
      const m = String(parsed.getMonth() + 1).padStart(2, '0')
      const d = String(parsed.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  } catch (e) {
    // Ignore
  }

  return dateStr
}

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  vcode: z.string().min(1, 'Voucher code is required'),
  description: z.string(),
  vvalue: z.coerce.number().min(0, 'Value is required'),
  isPercentage: z.boolean(),
  maxDiscountAmount: z.coerce.number().min(0),
  minimumEligibleAmount: z.coerce.number().min(0),
  maxUsesPerUser: z.coerce.number().min(0),
  maxTotalUses: z.coerce.number().min(0),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  forVisa: z.boolean(),
  forCash: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface VoucherFormModalProps {
  open: boolean
  onClose: () => void
  voucher?: VoucherListItem
}

export default function VoucherFormModal({ open, onClose, voucher }: VoucherFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(voucher)

  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation()
  const [updateVoucher, { isLoading: isUpdating }] = useUpdateVoucherMutation()
  const isLoading = isCreating || isUpdating

  // ── Fetch Dropdowns ────────────────────────────────────────────────────────
  const { data: users = [] } = useGetUserDropdownQuery()
  const { data: targetTypes = [] } = useGetVoucherTargetTypeDropdownQuery()
  const { data: products = [] } = useGetProductDropdownQuery()
  const { data: categories = [] } = useGetCategoryDropdownQuery()
  const { data: subcategories = [] } = useGetSubCategoryDropdownQuery()
  const { data: brands = [] } = useGetBrandDropdownQuery()
  const { data: salons = [] } = useGetSalonDropdownQuery()
  const { data: salonServices = [] } = useGetSalonServiceDropdownQuery()

  const [fetchProductDetails, { data: detailOptions = [] }] = useLazyGetProductDetailsQuery()

  const [fetchVoucher, { data: fullVoucher, isLoading: isFetching }] = useLazyGetVoucherQuery()
  const [stopVoucherDetail, { isLoading: isStoppingDetail }] = useStopVoucherDetailMutation()

  // ── Local states for userIds & targets ──────────────────────────────────────
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([])
  const [targets, setTargets] = useState<(VoucherTarget | VoucherTargetDetail)[]>([])

  // ── Target form widget states ───────────────────────────────────────────────
  const [targetType, setTargetType] = useState<number | ''>('')
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('')
  const [selectedDetail, setSelectedDetail] = useState<number | ''>('')
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | ''>('')
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('')
  const [selectedSalon, setSelectedSalon] = useState<number | ''>('')
  const [selectedService, setSelectedService] = useState<number | ''>('')

  // ── React Hook Form ────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      vcode: '',
      description: '',
      vvalue: 0,
      isPercentage: false,
      maxDiscountAmount: 0,
      minimumEligibleAmount: 0,
      maxUsesPerUser: 0,
      maxTotalUses: 0,
      fromDate: '',
      toDate: '',
      forVisa: true,
      forCash: true,
    },
  })

  // Prefill form on edit mode
  useEffect(() => {
    if (open) {
      if (voucher) {
        fetchVoucher(voucher.id)
      } else {
        reset({
          vcode: '',
          description: '',
          vvalue: 0,
          isPercentage: false,
          maxDiscountAmount: 0,
          minimumEligibleAmount: 0,
          maxUsesPerUser: 0,
          maxTotalUses: 0,
          fromDate: '',
          toDate: '',
          forVisa: true,
          forCash: true,
        })
        setSelectedUserIds([])
        setTargets([])
      }
      // Reset target widget inputs
      setTargetType('') 
      clearTargetInputs()
    }
  }, [open, voucher, reset, fetchVoucher])

  // Prefill detailed data once fetched
  useEffect(() => {
    if (open && voucher && fullVoucher) {
      reset({
        vcode: fullVoucher.vcode,
        description: fullVoucher.description || '',
        vvalue: fullVoucher.vvalue,
        isPercentage: fullVoucher.isPercentage,
        maxDiscountAmount: fullVoucher.maxDiscountAmount || 0,
        minimumEligibleAmount: fullVoucher.minimumEligibleAmount || 0,
        maxUsesPerUser: fullVoucher.maxUsesPerUser || 0,
        maxTotalUses: fullVoucher.maxTotalUses || 0,
        fromDate: parseDateToYMD(fullVoucher.fromDate),
        toDate: parseDateToYMD(fullVoucher.toDate),
        forVisa: fullVoucher.forVisa,
        forCash: fullVoucher.forCash,
      })
      setSelectedUserIds(fullVoucher.userIds || [])
      setTargets(fullVoucher.targets || [])
    }
  }, [open, voucher, fullVoucher, reset])

  const clearTargetInputs = () => {
    setSelectedProduct('')
    setSelectedDetail('')
    setSelectedCategory('')
    setSelectedSubcategory('')
    setSelectedBrand('')
    setSelectedSalon('')
    setSelectedService('')
  }

  // ── Options mapping ────────────────────────────────────────────────────────
  const userOptions: DropdownOption[] = users.map((u) => ({
    value: u.id,
    label: u.name,
  }))

  const targetTypeOptions: DropdownOption[] = targetTypes.map((t) => ({
    value: t.id,
    label: t.name,
  }))

  const productOptions = products.map((p) => ({ value: p.id, label: p.name }))
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))
  const subcategoryOptions = subcategories.map((s) => ({ value: s.id, label: s.name }))
  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }))
  const salonOptions = salons.map((s) => ({ value: s.id, label: s.name }))
  const serviceOptions = salonServices.map((s) => ({ value: s.id, label: s.name }))
  const detailSelectOptions = detailOptions.map((d) => ({
    value: d.detailId,
    label: `${d.sizeName} – ${d.colorName} (Cost: ${d.purchasePrice})`,
  }))

  // Trigger details fetch when product changes in the target widget
  const handleProductChange = (e: { target: { value: string } }) => {
    const prodId = Number(e.target.value)
    setSelectedProduct(prodId)
    setSelectedDetail('')
    if (prodId) {
      fetchProductDetails(prodId)
    }
  }

  // ── Add target handler ──────────────────────────────────────────────────────
  const handleAddTarget = () => {
    if (!targetType) {
      toast.error('Please select a target type')
      return
    }

    let targetId = 0
    const typeNum = Number(targetType)

    switch (typeNum) {
      case 1: // All Products
        targetId = 0
        break
      case 2: // Product
        if (!selectedProduct) {
          toast.error('Please select a product')
          return
        }
        targetId = Number(selectedProduct)
        break
      case 3: // Product Detail
        if (!selectedDetail) {
          toast.error('Please select a product detail')
          return
        }
        targetId = Number(selectedDetail)
        break
      case 4: // Category
        if (!selectedCategory) {
          toast.error('Please select a category')
          return
        }
        targetId = Number(selectedCategory)
        break
      case 5: // Subcategory
        if (!selectedSubcategory) {
          toast.error('Please select a subcategory')
          return
        }
        targetId = Number(selectedSubcategory)
        break
      case 6: // Brand
        if (!selectedBrand) {
          toast.error('Please select a brand')
          return
        }
        targetId = Number(selectedBrand)
        break
      case 7: // Salon
        if (!selectedSalon) {
          toast.error('Please select a salon')
          return
        }
        targetId = Number(selectedSalon)
        break
      case 8: // Salon Service
        if (!selectedService) {
          toast.error('Please select a service')
          return
        }
        targetId = Number(selectedService)
        break
      default:
        toast.error('Invalid target type')
        return
    }

    // Check for duplicates
    const duplicate = targets.some((t) => t.targetType === typeNum && t.targetId === targetId)
    if (duplicate) {
      toast.error('This target has already been added')
      return
    }

    setTargets((prev) => [...prev, { targetType: typeNum, targetId }])
    // Clear selections except targetType for easier repeated adding
    setSelectedProduct('')
    setSelectedDetail('')
    setSelectedCategory('')
    setSelectedSubcategory('')
    setSelectedBrand('')
    setSelectedSalon('')
    setSelectedService('')
  }

  const handleRemoveTarget = (index: number) => {
    setTargets((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Lookup names for targets table ──────────────────────────────────────────
  const getTargetTypeName = (type: number) => {
    return targetTypes.find((t) => t.id === type)?.name || `Type ${type}`
  }

  const getTargetName = (type: number, id: number) => {
    if (type === 1) return 'All Products'
    if (type === 2) return products.find((p) => p.id === id)?.name || `Product ID: ${id}`
    if (type === 3) {
      const found = detailOptions.find((d) => d.detailId === id)
      if (found) {
        return `Product Detail: ${found.sizeName} - ${found.colorName}`
      }
      return `Product Detail ID: ${id}`
    }
    if (type === 4) return categories.find((c) => c.id === id)?.name || `Category ID: ${id}`
    if (type === 5) return subcategories.find((s) => s.id === id)?.name || `Subcategory ID: ${id}`
    if (type === 6) return brands.find((b) => b.id === id)?.name || `Brand ID: ${id}`
    if (type === 7) return salons.find((s) => s.id === id)?.name || `Salon ID: ${id}`
    if (type === 8) return salonServices.find((s) => s.id === id)?.name || `Salon Service ID: ${id}`
    return `ID: ${id}`
  }

  // ── Submit handler ──────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    if (targets.length === 0) {
      toast.error('Please add at least one target before saving')
      return
    }

    const payload = {
      ...values,
      userIds: selectedUserIds.map(Number),
      targets: targets.map((t) => ({
        targetType: t.targetType,
        targetId: t.targetId,
      })),
    }

    try {
      if (isEdit && voucher) {
        await updateVoucher({ id: voucher.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        await createVoucher(payload).unwrap()
        toast.success(t('common.success'))
        onClose()
      }
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[var(--border)] pb-1 mb-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </span>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Voucher' : 'Add Voucher'}
      size="xl"
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
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--text-muted)]">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading voucher details...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* ── Basic Info & Configuration ────────────────────────────────────── */}
        <SectionHeading title="General Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('vcode')}
            label="Voucher Code"
            placeholder="e.g. SUMMER25"
            error={errors.vcode?.message}
            required
          />
          <Input
            {...register('vvalue')}
            label="Voucher Value"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            error={errors.vvalue?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            {...register('maxDiscountAmount')}
            label="Max Discount Amount"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            error={errors.maxDiscountAmount?.message}
          />
          <Input
            {...register('minimumEligibleAmount')}
            label="Minimum Eligible Spend"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            error={errors.minimumEligibleAmount?.message}
          />
          <div className="flex items-center pt-6">
            <Controller
              control={control}
              name="isPercentage"
              render={({ field }) => (
                <Toggle label="Is Percentage Discount?" checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('maxUsesPerUser')}
            label="Max Uses Per User"
            type="number"
            min={0}
            placeholder="0 (Unlimited)"
            error={errors.maxUsesPerUser?.message}
          />
          <Input
            {...register('maxTotalUses')}
            label="Max Total Uses"
            type="number"
            min={0}
            placeholder="0 (Unlimited)"
            error={errors.maxTotalUses?.message}
          />
        </div>

        <Input
          {...register('description')}
          label="Description"
          placeholder="Enter voucher description / terms..."
          error={errors.description?.message}
        />

        {/* ── Date range & payment limits ─────────────────────────────────────── */}
        <SectionHeading title="Schedule & Payment Types" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="fromDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                label="Valid From"
                error={errors.fromDate?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="toDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                label="Valid To"
                error={errors.toDate?.message}
                required
              />
            )}
          />
        </div>

        <div className="flex flex-row gap-6 p-1">
          <Controller
            control={control}
            name="forVisa"
            render={({ field }) => (
              <Toggle label="Allow Visa Payment" checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="forCash"
            render={({ field }) => (
              <Toggle label="Allow Cash Payment" checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* ── User Assignment ────────────────────────────────────────────────── */}
        <SectionHeading title="Target Customers" />
        <div className="p-1">
          <MultiSelect
            label="Assigned Users"
            options={userOptions}
            value={selectedUserIds}
            onChange={setSelectedUserIds}
            placeholder="Select users (leave empty for all)..."
          />
        </div>

        {/* ── Targets Manager ─────────────────────────────────────────────────── */}
        <SectionHeading title="Eligible Target Products / Categories" />
        <div className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="col-span-12 sm:col-span-4">
              <Select
                label="Select Target Type"
                options={targetTypeOptions}
                placeholder="Choose type..."
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value ? Number(e.target.value) : '')
                  clearTargetInputs()
                }}
              />
            </div>

            {/* Conditional Sub-selectors */}
            {targetType === 2 && (
              <div className="col-span-12 sm:col-span-6">
                <Select
                  label="Select Product"
                  options={productOptions}
                  placeholder="Choose product..."
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(Number(e.target.value))}
                />
              </div>
            )}

            {targetType === 3 && (
              <>
                <div className="col-span-12 sm:col-span-3">
                  <Select
                    label="Select Product"
                    options={productOptions}
                    placeholder="Choose product..."
                    value={selectedProduct}
                    onChange={handleProductChange}
                  />
                </div>
                <div className="col-span-12 sm:col-span-3">
                  <Select
                    label="Select Size & Color"
                    options={detailSelectOptions}
                    placeholder={selectedProduct ? 'Choose detail...' : 'Select product first'}
                    value={selectedDetail}
                    onChange={(e) => setSelectedDetail(Number(e.target.value))}
                    disabled={!selectedProduct}
                  />
                </div>
              </>
            )}

            {targetType === 4 && (
              <div className="col-span-12 sm:col-span-6">
                <Select
                  label="Select Category"
                  options={categoryOptions}
                  placeholder="Choose category..."
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(Number(e.target.value))}
                />
              </div>
            )}

            {targetType === 5 && (
              <div className="col-span-12 sm:col-span-6">
                <Select
                  label="Select Subcategory"
                  options={subcategoryOptions}
                  placeholder="Choose subcategory..."
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(Number(e.target.value))}
                />
              </div>
            )}

            {targetType === 6 && (
              <div className="col-span-12 sm:col-span-6">
                <Select
                  label="Select Brand"
                  options={brandOptions}
                  placeholder="Choose brand..."
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(Number(e.target.value))}
                />
              </div>
            )}

            {targetType === 7 && (
              <div className="col-span-12 sm:col-span-6">
                <Select
                  label="Select Salon"
                  options={salonOptions}
                  placeholder="Choose salon..."
                  value={selectedSalon}
                  onChange={(e) => setSelectedSalon(Number(e.target.value))}
                />
              </div>
            )}

            {targetType === 8 && (
              <div className="col-span-12 sm:col-span-6">
                <Select
                  label="Select Salon Service"
                  options={serviceOptions}
                  placeholder="Choose service..."
                  value={selectedService}
                  onChange={(e) => setSelectedService(Number(e.target.value))}
                />
              </div>
            )}

            <div className="col-span-12 sm:col-span-2 flex justify-end">
              <Button type="button" onClick={handleAddTarget} leftIcon={<HiPlus size={14} />}>
                Add
              </Button>
            </div>
          </div>

          {/* Targets List Table */}
          {targets.length > 0 ? (
            <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden bg-[var(--bg-card)]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-hover)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]">
                    <th className="p-2.5">Target Type</th>
                    <th className="p-2.5">Target Item</th>
                    <th className="p-2.5 text-center">Action / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {targets.map((target, idx) => {
                    const isExisting = 'detailId' in target && target.detailId !== undefined
                    const targetDetail = target as VoucherTargetDetail

                    return (
                      <tr key={idx} className="hover:bg-[var(--bg-hover)]">
                        <td className="p-2.5 font-medium text-[var(--text-secondary)]">
                          {isExisting ? targetDetail.targetTypeName : getTargetTypeName(target.targetType)}
                        </td>
                        <td className="p-2.5 text-[var(--text-primary)]">
                          {isExisting ? targetDetail.name : getTargetName(target.targetType, target.targetId)}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isExisting ? (
                              <>
                                <StatusBadge
                                  variant={targetDetail.isStopped ? 'danger' : 'success'}
                                  label={targetDetail.isStopped ? 'Stopped' : 'Active'}
                                />
                                {!targetDetail.isStopped && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="py-1 px-2 text-xs"
                                    onClick={async () => {
                                      if (voucher?.id && targetDetail.detailId) {
                                        try {
                                          await stopVoucherDetail({
                                            id: voucher.id,
                                            detailId: targetDetail.detailId,
                                          }).unwrap()
                                          toast.success(t('Target stopped successfully'))
                                        } catch (err) {
                                          toast.error(getApiError(err, t('common.error')))
                                        }
                                      }
                                    }}
                                    disabled={isStoppingDetail}
                                  >
                                    {t('voucher.stop', 'Stop')}
                                  </Button>
                                )}
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRemoveTarget(idx)}
                                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors"
                                title="Remove Target"
                              >
                                <HiTrash size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4 border border-dashed border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg-card)] text-xs text-[var(--text-muted)]">
              No targets added yet. Choose a target type above and click Add.
            </div>
          )}
        </div>
      </div>
      )}
    </Modal>
  )
}
