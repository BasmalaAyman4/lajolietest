import { useEffect, useState, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { Modal, Input, Select, Textarea, Button, MultiSelect } from '@/components/shared'
import type { DropdownOption } from '@/types'
import {
  useCreateSuggestionRoutineMutation,
  useUpdateSuggestionRoutineMutation,
  useLazyGetSuggestionRoutineQuery,
  useGetRoutineZoneDropdownQuery,
  useGetRoutineTypeDropdownQuery,
  useGetRoutineProductTypeDropdownQuery,
  useLazyGetRoutineProductTypeDetailDropdownQuery,
} from '../services/suggestionRoutineApi'
import type { SuggestionRoutineListItem, PendingRoutineDetail } from '../types'
import { getApiError } from '@/services/apiHelpers'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  routinTypeId: z.coerce.number().min(1, 'Routine type is required'),
  routineZone: z.coerce.number().min(1, 'Routine zone is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  description: z.string().min(1, 'Description is required'),
})

type FormValues = z.infer<typeof schema>

interface SuggestionRoutineFormModalProps {
  open: boolean
  onClose: () => void
  routine?: SuggestionRoutineListItem
  // Fired after a brand-new routine is created, so the page can immediately
  // open the images modal for it — mirrors the BeautyCategory flow.
  onCreated?: (id: number) => void
}

export default function SuggestionRoutineFormModal({ open, onClose, routine, onCreated }: SuggestionRoutineFormModalProps) {
  const { t, i18n } = useTranslation()
  const isEdit = Boolean(routine)

  // ── Mutations ────────────────────────────────────────────────────────────────
  const [createRoutine, { isLoading: isCreating }] = useCreateSuggestionRoutineMutation()
  const [updateRoutine, { isLoading: isUpdating }] = useUpdateSuggestionRoutineMutation()
  const isSaving = isCreating || isUpdating

  // ── Dropdowns ────────────────────────────────────────────────────────────────
  const { data: zoneOptions = [] }        = useGetRoutineZoneDropdownQuery()
  const { data: routineTypeOptions = [] } = useGetRoutineTypeDropdownQuery()
  const { data: productTypeOptions = [] } = useGetRoutineProductTypeDropdownQuery()
  const [fetchProductTypeDetails, { data: cascadeGroups = [], isFetching: isFetchingCascade }] =
    useLazyGetRoutineProductTypeDetailDropdownQuery()

  // ── Edit: load full record to prefill ─────────────────────────────────────────
  const [fetchRoutine, { data: fullRoutine, isLoading: isFetching }] = useLazyGetSuggestionRoutineQuery()

  // ── Details builder state ──────────────────────────────────────────────────────
  const [pendingDetails, setPendingDetails] = useState<PendingRoutineDetail[]>([])
  const [rowProductType, setRowProductType] = useState<number | ''>('')
  const [rowDetailIds, setRowDetailIds] = useState<number[]>([])
  const [rowDescription, setRowDescription] = useState('')

  // ── Form ─────────────────────────────────────────────────────────────────────
  const { handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { routinTypeId: 0, routineZone: 0, nameAr: '', nameEn: '', description: '' },
  })

  // ── Reset / open handling ────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    reset({ routinTypeId: 0, routineZone: 0, nameAr: '', nameEn: '', description: '' })
    setPendingDetails([])
    setRowProductType('')
    setRowDetailIds([])
    setRowDescription('')
  }, [reset])

  useEffect(() => {
    if (!open) return
    if (routine) {
      fetchRoutine(routine.id)
    } else {
      resetAll()
    }
  }, [open, routine]) // eslint-disable-line react-hooks/exhaustive-deps

  // Prefill form + detail rows once the full record loads (edit only)
  useEffect(() => {
    if (!open || !routine || !fullRoutine || fullRoutine.id !== routine.id) return
    reset({
      routinTypeId: fullRoutine.routinTypeId,
      routineZone: fullRoutine.routineZone,
      nameAr: fullRoutine.nameAr,
      nameEn: fullRoutine.nameEn,
      description: fullRoutine.description ?? '',
    })
    setPendingDetails(
      fullRoutine.details.map((d) => ({
        productTypeId: d.productTypeId,
        productTypeName: d.productTypeName,
        description: d.description ?? '',
        sortOrder: d.sortOrder,
        productTypeDetailIds: d.productTypeDetails.map((pd) => pd.id),
        productTypeDetailLabels: d.productTypeDetails.map((pd) =>
          i18n.language?.startsWith('ar') ? pd.nameAr : pd.nameEn,
        ),
      })),
    )
  }, [open, routine, fullRoutine, reset, i18n.language])

  // ── Cascade: fetch product-type details when a product type is chosen ──────────
  const handleRowProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setRowProductType(id)
    setRowDetailIds([])
    if (id) fetchProductTypeDetails([id])
  }

  const cascadeOptions = cascadeGroups[0]?.details ?? []
  const cascadeSelectOptions: DropdownOption[] = cascadeOptions.map((o) => ({ value: o.id, label: o.name }))

  // ── Add / remove / edit detail rows ─────────────────────────────────────────────
  const handleAddDetail = () => {
    if (!rowProductType) {
      toast.error(t('routine.selectProductType', 'Please select a product type'))
      return
    }
    if (rowDetailIds.length === 0) {
      toast.error(t('routine.selectDetailItems', 'Please select at least one item'))
      return
    }
    if (pendingDetails.some((d) => d.productTypeId === rowProductType)) {
      toast.error(t('routine.duplicateProductType', 'This product type has already been added'))
      return
    }

    const productTypeName = productTypeOptions.find((o) => o.id === rowProductType)?.name ?? ''
    const labels = cascadeOptions.filter((o) => rowDetailIds.includes(o.id)).map((o) => o.name)

    setPendingDetails((prev) => [
      ...prev,
      {
        productTypeId: Number(rowProductType),
        productTypeName,
        description: rowDescription,
        sortOrder: prev.length,
        productTypeDetailIds: rowDetailIds,
        productTypeDetailLabels: labels,
      },
    ])

    setRowProductType('')
    setRowDetailIds([])
    setRowDescription('')
  }

  const handleRemoveDetail = (index: number) => {
    setPendingDetails((prev) =>
      prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, sortOrder: i })),
    )
  }

  const editDetailField = (index: number, field: 'description' | 'sortOrder', value: string) => {
    setPendingDetails((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, [field]: field === 'sortOrder' ? Number(value) || 0 : value } : d,
      ),
    )
  }

  // ── Submit ─────────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    if (pendingDetails.length === 0) {
      toast.error(t('routine.noDetails', 'Please add at least one product type before saving'))
      return
    }

    const payload = {
      routinTypeId: Number(values.routinTypeId),
      routineZone: Number(values.routineZone),
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      description: values.description,
      details: pendingDetails.map((d) => ({
        productTypeId: d.productTypeId,
        description: d.description,
        sortOrder: d.sortOrder,
        productTypeDetailIds: d.productTypeDetailIds,
      })),
    }

    try {
      if (isEdit && routine) {
        await updateRoutine({ id: routine.id, ...payload }).unwrap()
        toast.success(t('common.success'))
        onClose()
      } else {
        const newId = await createRoutine(payload).unwrap()
        toast.success(t('common.success'))
        onClose()
        onCreated?.(newId)
      }
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  // ── Option lists ─────────────────────────────────────────────────────────────
  const routineTypeSelectOptions = routineTypeOptions.map((o) => ({ value: o.id, label: o.name }))
  const zoneSelectOptions        = zoneOptions.map((o)       => ({ value: o.id, label: o.name }))
  const productTypeSelectOptions = productTypeOptions.map((o) => ({ value: o.id, label: o.name }))

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="border-b border-[var(--border)] pb-1 mb-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</span>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('routine.edit', 'Edit Suggestion Routine') : t('routine.add', 'Add Suggestion Routine')}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSaving}>
            {isEdit ? t('common.save') : t('common.add', 'Add')}
          </Button>
        </>
      }
    >
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--text-muted)]">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">{t('common.loading', 'Loading...')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">

          {/* ── General ──────────────────────────────────────────────────────── */}
          <SectionHeading title={t('routine.general', 'General Details')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="routinTypeId"
              render={({ field }) => (
                <Select
                  label={t('routine.type', 'Routine Type')}
                  options={routineTypeSelectOptions}
                  placeholder={t('routine.selectType', 'Choose routine type...')}
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.routinTypeId?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="routineZone"
              render={({ field }) => (
                <Select
                  label={t('routine.zone', 'Routine Zone')}
                  options={zoneSelectOptions}
                  placeholder={t('routine.selectZone', 'Choose zone...')}
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.routineZone?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="nameAr"
              render={({ field }) => (
                <Input {...field} label={t('routine.nameAr', 'Name (Arabic)')} error={errors.nameAr?.message} required dir="rtl" />
              )}
            />
            <Controller
              control={control}
              name="nameEn"
              render={({ field }) => (
                <Input {...field} label={t('routine.nameEn', 'Name (English)')} error={errors.nameEn?.message} required />
              )}
            />
            <div className="sm:col-span-2">
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea {...field} label={t('routine.description', 'Description')} error={errors.description?.message} required rows={3} />
                )}
              />
            </div>
          </div>

          {/* ── Details builder ──────────────────────────────────────────────── */}
          <SectionHeading title={t('routine.details', 'Product Types')} />
          <div className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-4">

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <div className="col-span-12 sm:col-span-4">
                <Select
                  label={t('routine.productType', 'Product Type')}
                  options={productTypeSelectOptions}
                  placeholder={t('routine.selectProductType', 'Choose product type...')}
                  value={rowProductType}
                  onChange={handleRowProductTypeChange}
                />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <MultiSelect
                  label={t('routine.items', 'Items')}
                  options={cascadeSelectOptions}
                  value={rowDetailIds}
                  onChange={(vals) => setRowDetailIds(vals.map(Number))}
                  placeholder={
                    !rowProductType
                      ? t('routine.selectProductTypeFirst', 'Select a product type first')
                      : isFetchingCascade
                        ? t('common.loading', 'Loading...')
                        : t('routine.selectItems', 'Select items...')
                  }
                  disabled={!rowProductType || isFetchingCascade}
                />
              </div>

              <div className="col-span-12 sm:col-span-2">
                <Input
                  label={t('routine.rowDescription', 'Note (optional)')}
                  value={rowDescription}
                  onChange={(e) => setRowDescription(e.target.value)}
                />
              </div>

              <div className="col-span-12 sm:col-span-2 flex sm:pt-6 justify-end">
                <Button type="button" onClick={handleAddDetail} leftIcon={<HiPlus size={14} />}>
                  {t('common.add', 'Add')}
                </Button>
              </div>
            </div>

            {pendingDetails.length > 0 ? (
              <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden bg-[var(--bg-card)]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-hover)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]">
                      <th className="p-2.5">{t('routine.productType', 'Product Type')}</th>
                      <th className="p-2.5">{t('routine.items', 'Items')}</th>
                      <th className="p-2.5">{t('routine.rowDescription', 'Note')}</th>
                      <th className="p-2.5 text-center w-20">{t('routine.sortOrder', 'Order')}</th>
                      <th className="p-2.5 text-center w-14"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {pendingDetails.map((detail, idx) => (
                      <tr key={`${detail.productTypeId}-${idx}`} className="hover:bg-[var(--bg-hover)]">
                        <td className="p-2.5 text-[var(--text-primary)] font-medium">{detail.productTypeName}</td>
                        <td className="p-2.5 text-[var(--text-secondary)]">{detail.productTypeDetailLabels.join(', ')}</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={detail.description}
                            onChange={(e) => editDetailField(idx, 'description', e.target.value)}
                            className="w-full text-sm border border-[var(--border)] rounded-[var(--radius)] px-2 py-1 bg-[var(--bg-input,var(--bg-card))] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            value={detail.sortOrder}
                            onChange={(e) => editDetailField(idx, 'sortOrder', e.target.value)}
                            className="w-16 text-center text-sm border border-[var(--border)] rounded-[var(--radius)] px-2 py-1 bg-[var(--bg-input,var(--bg-card))] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                          />
                        </td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg-card)] text-xs text-[var(--text-muted)]">
                {t('routine.noItemsAdded', 'Choose a product type and its items, then click Add.')}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}