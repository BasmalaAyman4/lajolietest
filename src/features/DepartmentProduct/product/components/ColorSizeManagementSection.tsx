// ─── ColorSizeManagementSection ───────────────────────────────────────────────
//
//  Tab content for "Colors & Sizes" (or "Sizes & Pricing" / "Colors")
//  depending on product flags:
//   - isDisappearColor → sizes-only mode
//   - isDisappearSize  → colors-only mode
//   - default          → full colors + sizes

import { useState } from 'react'
import { toast } from 'sonner'
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiPauseCircle,
  FiPlayCircle,
} from 'react-icons/fi'
import { Button, ConfirmModal, Input } from '@/components/shared'
import ColorDetailsForm from './ColorDetailsForm'
import {
  useStopProductDetailMutation,
  useDeleteProductDetailMutation,
  useUpdateProductDetailsMutation,
} from '../services/productApi'
import type { ProductFull, ProductColor, ProductDetail } from '../types'
import { getApiError } from '@/services/apiHelpers'
import { useTranslation } from 'react-i18next'

// ── helpers ───────────────────────────────────────────────────────────────────
const rgbToHex = (rgb: string | undefined): string => {
  if (!rgb || rgb.startsWith('#')) return rgb ?? '#000000'
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!m) return '#000000'
  return `#${[m[1], m[2], m[3]].map((n) => parseInt(n).toString(16).padStart(2, '0')).join('')}`
}

interface ColorSizeManagementSectionProps {
  productId: number
  product: ProductFull
  onUpdate: () => void
  isDisappearColor?: boolean
  isDisappearSize?: boolean
}

type DialogState =
  | { open: false }
  | { open: true; type: 'stop'; detailId: number; isStoped: boolean }
  | { open: true; type: 'delete'; detailId: number }

export default function ColorSizeManagementSection({
  productId,
  product,
  onUpdate,
  isDisappearColor = false,
  isDisappearSize = false,
}: ColorSizeManagementSectionProps) {
  const { t } = useTranslation()
  const [isAdding, setIsAdding] = useState(false)
  const [editingColor, setEditingColor] = useState<ProductColor | null>(null)
  const [editingDetail, setEditingDetail] = useState<ProductDetail | null>(null)
  const [addingSizeToColor, setAddingSizeToColor] = useState<ProductColor | null>(null)
  const [editingSize, setEditingSize] = useState<{
    color: ProductColor
    detail: ProductDetail
    purchasePrice: number
    salesPrice: number
  } | null>(null)
  const [dialog, setDialog] = useState<DialogState>({ open: false })

  const [stopDetail, { isLoading: isStopping }] = useStopProductDetailMutation()
  const [deleteDetail, { isLoading: isDeleting }] = useDeleteProductDetailMutation()
  const [updateDetails, { isLoading: isUpdatingSize }] = useUpdateProductDetailsMutation()

  const anyFormOpen =
    isAdding || !!editingColor || !!editingDetail || !!addingSizeToColor || !!editingSize

  const closeAllForms = () => {
    setIsAdding(false)
    setEditingColor(null)
    setEditingDetail(null)
    setAddingSizeToColor(null)
    setEditingSize(null)
  }

  const handleSaveSuccess = (msg: string) => {
    toast.success(msg)
    closeAllForms()
    onUpdate()
  }

  const handleUpdateSize = async () => {
    if (!editingSize) return
    try {
      await updateDetails({
        productId,
        details: [{
          detailId: editingSize.detail.detailId,
          sizeId: editingSize.detail.sizeId,
          purchasePrice: editingSize.purchasePrice,
          salesPrice: editingSize.salesPrice,
        }],
      }).unwrap()
      toast.success('Prices updated successfully')
      closeAllForms()
      onUpdate()
    } catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            }
  }

  const handleStop = async () => {
    if (!dialog.open || dialog.type !== 'stop') return
    try {
      await stopDetail(dialog.detailId).unwrap()
      toast.success(`Detail ${dialog.isStoped ? 'activated' : 'stopped'} successfully`)
      setDialog({ open: false })
      onUpdate()
    } catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            }
  }

  const handleDelete = async () => {
    if (!dialog.open || dialog.type !== 'delete') return
    try {
      await deleteDetail(dialog.detailId).unwrap()
      toast.success('Detail deleted successfully')
      setDialog({ open: false })
      onUpdate()
    } catch (error: any) {
              toast.error(getApiError(error, t('common.error')))
            }
  }

  const colors = product.colors ?? []
  const details = product.details ?? []

  // Build a sizeId → name lookup from all sizes across all colors
  const sizeNameMap = new Map<number, { nameAr: string; nameEn: string }>()
  colors.forEach((c) =>
    (c.sizes ?? []).forEach((s) => {
      if (!sizeNameMap.has(s.sizeId)) {
        sizeNameMap.set(s.sizeId, { nameAr: s.nameAr, nameEn: s.nameEn })
      }
    }),
  )

  // ── Sizes-only mode ────────────────────────────────────────────────────────
  if (isDisappearColor) {
    return (
      <>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <span className="font-semibold text-sm text-[var(--text-primary)]">Sizes &amp; Pricing</span>
            <Button
              onClick={() => { closeAllForms(); setIsAdding(true) }}
              disabled={anyFormOpen}
              leftIcon={<FiPlus size={14} />}
            >
              Add Sizes
            </Button>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {/* Add form */}
            {isAdding && (
              <ColorDetailsForm
                productId={productId}
                product={product}
                onSave={handleSaveSuccess}
                onCancel={() => setIsAdding(false)}
                sizesOnly
              />
            )}

            {/* Edit form */}
            {editingDetail && (
              <div className="rounded-[var(--radius-lg)] border-2 border-[var(--accent)] bg-[var(--bg-subtle)] p-4 flex flex-col gap-4">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Edit Prices —{' '}
                  {sizeNameMap.get(editingDetail.sizeId)
                    ? `${sizeNameMap.get(editingDetail.sizeId)!.nameAr} / ${sizeNameMap.get(editingDetail.sizeId)!.nameEn}`
                    : `Size #${editingDetail.sizeId}`}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Purchase Price (EGP)"
                    type="number"
                    value={String(editingDetail.purchasePrice ?? 0)}
                    onChange={(e) =>
                      setEditingDetail((prev) =>
                        prev ? { ...prev, purchasePrice: parseFloat(e.target.value) || 0 } : prev
                      )
                    }
                  />
                  <Input
                    label="Sales Price (EGP)"
                    type="number"
                    value={String(editingDetail.salesPrice ?? editingDetail.saleaPrice ?? 0)}
                    onChange={(e) =>
                      setEditingDetail((prev) =>
                        prev
                          ? { ...prev, salesPrice: parseFloat(e.target.value) || 0, saleaPrice: parseFloat(e.target.value) || 0 }
                          : prev
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="secondary" onClick={() => setEditingDetail(null)} disabled={isUpdatingSize}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await updateDetails({
                          productId,
                          details: [{
                            detailId: editingDetail.detailId,
                            sizeId: editingDetail.sizeId,
                            purchasePrice: editingDetail.purchasePrice ?? 0,
                            salesPrice: editingDetail.salesPrice ?? editingDetail.saleaPrice ?? 0,
                          }],
                        }).unwrap()
                        toast.success('Prices updated successfully')
                        closeAllForms()
                        onUpdate()
                      } catch {
                        toast.error('Failed to update prices')
                      }
                    }}
                    loading={isUpdatingSize}
                  >
                    Save Prices
                  </Button>
                </div>
              </div>
            )}

            {/* Rows */}
            {!anyFormOpen && details.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-6">
                No sizes yet. Click &quot;Add Sizes&quot; to start.
              </p>
            )}

            {!anyFormOpen && details.map((d) => (
              <div
                key={d.detailId}
                className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-subtle)]"
              >
                <div className="flex items-center gap-5 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">
                    {sizeNameMap.get(d.sizeId)
                      ? `${sizeNameMap.get(d.sizeId)!.nameAr} / ${sizeNameMap.get(d.sizeId)!.nameEn}`
                      : `Size #${d.sizeId}`}
                  </span>
                  <span className="text-blue-600">Purchase: {d.purchasePrice} EGP</span>
                  <span className="text-green-700">Sales: {d.salesPrice ?? d.saleaPrice} EGP</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    d.isStoped
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {d.isStoped ? 'Stopped' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingDetail(d)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--accent-soft)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    <FiEdit size={14} />
                  </button>
               {/*    <button
                    type="button"
                    onClick={() => setDialog({ open: true, type: 'stop', detailId: d.detailId, isStoped: d.isStoped })}
                    className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                      d.isStoped
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-orange-500 hover:bg-orange-50'
                    }`}
                  >
                    {d.isStoped ? <FiPlayCircle size={16} /> : <FiPauseCircle size={16} />}
                  </button> */}
                  <button
                    type="button"
                    onClick={() => setDialog({ open: true, type: 'delete', detailId: d.detailId })}
                    className="w-7 h-7 flex items-center justify-center rounded text-[var(--danger)] hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialogs dialog={dialog} setDialog={setDialog}
          onStop={handleStop} onDelete={handleDelete}
          isStopping={isStopping} isDeleting={isDeleting}
        />
      </>
    )
  }

  // ── Colors & Sizes mode (default) ─────────────────────────────────────────
  return (
    <>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <span className="font-semibold text-sm text-[var(--text-primary)]">
            {isDisappearSize ? 'Colors' : 'Colors & Sizes'}
          </span>
          <Button
            onClick={() => { closeAllForms(); setIsAdding(true) }}
            disabled={anyFormOpen}
            leftIcon={<FiPlus size={14} />}
          >
            Add Color
          </Button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Forms */}
          {isAdding && (
            <ColorDetailsForm
              productId={productId} product={product}
              onSave={handleSaveSuccess}
              onCancel={() => setIsAdding(false)}
              isDisappearSize={isDisappearSize}
            />
          )}
          {editingColor && (
            <ColorDetailsForm
              productId={productId} product={product}
              initialData={editingColor}
              onSave={handleSaveSuccess}
              onCancel={() => setEditingColor(null)}
              isDisappearSize={isDisappearSize}
            />
          )}
          {addingSizeToColor && (
            <ColorDetailsForm
              productId={productId} product={product}
              onSave={handleSaveSuccess}
              onCancel={() => setAddingSizeToColor(null)}
              addSizesToColor={addingSizeToColor}
            />
          )}
          {editingSize && (
            <div className="rounded-[var(--radius-lg)] border-2 border-[var(--accent)] bg-[var(--bg-subtle)] p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Edit Prices — {editingSize.color.nameEn}
                  {' · '}
                  {sizeNameMap.get(editingSize.detail.sizeId)?.nameEn ?? `Size #${editingSize.detail.sizeId}`}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Purchase Price (EGP)"
                  type="number"
                  value={String(editingSize.purchasePrice)}
                  onChange={(e) =>
                    setEditingSize((prev) =>
                      prev ? { ...prev, purchasePrice: parseFloat(e.target.value) || 0 } : prev
                    )
                  }
                />
                <Input
                  label="Sales Price (EGP)"
                  type="number"
                  value={String(editingSize.salesPrice)}
                  onChange={(e) =>
                    setEditingSize((prev) =>
                      prev ? { ...prev, salesPrice: parseFloat(e.target.value) || 0 } : prev
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="secondary" onClick={() => setEditingSize(null)} disabled={isUpdatingSize}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSize} loading={isUpdatingSize}>
                  Save Prices
                </Button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!anyFormOpen && colors.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">
              No colors yet. Click &quot;Add Color&quot; to start.
            </p>
          )}

          {/* Color list */}
          {!anyFormOpen && colors.map((color) => (
            <div
              key={color.id}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-subtle)] p-3 flex flex-col gap-3"
            >
              {/* Color header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded border-2 border-[var(--border)] shadow-sm flex-shrink-0"
                    style={{ backgroundColor: rgbToHex(color.colorHex) }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {color.nameAr} / {color.nameEn}
                    </p>
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      {rgbToHex(color.colorHex)}
                    </p>
                    {isDisappearSize && (
                      <div className="flex gap-3 text-xs mt-1">
                        <span className="text-blue-600">Purchase: {color.purchasePrice ?? 0} EGP</span>
                        <span className="text-green-700">Sales: {color.salesPrice ?? 0} EGP</span>
                      </div>
                    )}
                  </div>
                </div>
                {!isDisappearSize && (
                  <Button
                    variant="secondary"
                    onClick={() => setAddingSizeToColor(color)}
                    disabled={anyFormOpen}
                    leftIcon={<FiPlus size={13} />}
                  >
                    Add Size
                  </Button>
                )}
              </div>

              {/* Sizes under this color */}
              {!isDisappearSize && (color.sizes ?? []).length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Sizes & Pricing
                  </p>
                  {(color.sizes ?? []).map((size, idx) => {
                    const detail = details.find(
                      (d) => d.colorId === color.id && d.sizeId === size.sizeId,
                    )
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-5 text-sm flex-1">
                          <div>
                            <p className="text-[10px] text-[var(--text-muted)]">Size</p>
                            <p className="font-medium">{size.nameAr}</p>
                            <p className="text-xs text-[var(--text-muted)]">{size.nameEn}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[var(--text-muted)]">Purchase</p>
                            <p className="font-semibold text-blue-600">{size.purchasePrice} EGP</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[var(--text-muted)]">Sales</p>
                            <p className="font-semibold text-green-700">{size.salesPrice} EGP</p>
                          </div>
                          {detail && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              detail.isStoped ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'
                            }`}>
                              {detail.isStoped ? 'Stopped' : 'Active'}
                            </span>
                          )}
                        </div>
                        {detail && (
                          <div className="flex items-center gap-1 border-l border-[var(--border)] pl-2">
                            <button
                              type="button"
                              onClick={() => setEditingSize({
                                color,
                                detail,
                                purchasePrice: detail.purchasePrice ?? 0,
                                salesPrice: detail.salesPrice ?? detail.saleaPrice ?? 0,
                              })}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--accent-soft)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                            >
                              <FiEdit size={14} />
                            </button>
                          {/*   <button
                              type="button"
                              onClick={() => setDialog({ open: true, type: 'stop', detailId: detail.detailId, isStoped: detail.isStoped })}
                              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                                detail.isStoped
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-orange-500 hover:bg-orange-50'
                              }`}
                            >
                              {detail.isStoped ? <FiPlayCircle size={16} /> : <FiPauseCircle size={16} />}
                            </button> */}
                            <button
                              type="button"
                              onClick={() => setDialog({ open: true, type: 'delete', detailId: detail.detailId })}
                              className="w-7 h-7 flex items-center justify-center rounded text-[var(--danger)] hover:bg-red-50 transition-colors"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialogs dialog={dialog} setDialog={setDialog}
        onStop={handleStop} onDelete={handleDelete}
        isStopping={isStopping} isDeleting={isDeleting}
      />
    </>
  )
}

// ── Confirmation dialogs ──────────────────────────────────────────────────────
function Dialogs({
  dialog,
  setDialog,
  onStop,
  onDelete,
  isStopping,
  isDeleting,
}: {
  dialog: DialogState
  setDialog: (d: DialogState) => void
  onStop: () => void
  onDelete: () => void
  isStopping: boolean
  isDeleting: boolean
}) {
  const close = () => setDialog({ open: false })
  return (
    <>
      <ConfirmModal
        open={dialog.open && dialog.type === 'stop'}
        onClose={close}
        onConfirm={onStop}
        loading={isStopping}
        title={dialog.open && dialog.type === 'stop' && dialog.isStoped ? 'Activate Detail' : 'Stop Detail'}
        message={`Are you sure you want to ${dialog.open && dialog.type === 'stop' && dialog.isStoped ? 'activate' : 'stop'} this detail?`}
      />
      <ConfirmModal
        open={dialog.open && dialog.type === 'delete'}
        onClose={close}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Delete Detail"
        message="Are you sure you want to delete this detail? This action cannot be undone."
      />
    </>
  )
}