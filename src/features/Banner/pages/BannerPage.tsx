import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Input,
  Select,
  Button,
  Toggle,
  UploadImage,
} from '@/components/shared'
import type { UploadedFile } from '@/components/shared/UploadImage'
import DualColorPicker from '@/features/DepartmentProduct/product/components/DualColorPicker'
import {
  useGetBannerTypeDropdownQuery,
  useGetBannerDisplayTargetDropdownQuery,
  useGetBannerContentModeDropdownQuery,
  useGetProductDropdownQuery,
  useGetSalonDropdownQuery,
  useGetBannersQuery,
  useAddBannerMutation,
  useAddBannerImageMutation,
  useUpdateBannerMutation,
} from '../services/bannerApi'
import { getApiError } from '@/services/apiHelpers'
import { useTranslation } from 'react-i18next'

export default function BannerPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  // ── Queries ─────────────────────────────────────────────────────────────
  const { data: bannerTypes = [] } = useGetBannerTypeDropdownQuery()
  const { data: displayTargets = [] } = useGetBannerDisplayTargetDropdownQuery()
  const { data: contentModes = [] } = useGetBannerContentModeDropdownQuery()
  const { data: products = [] } = useGetProductDropdownQuery()
  const { data: salons = [] } = useGetSalonDropdownQuery()

  const { data: banners = [] } = useGetBannersQuery(undefined, { skip: !isEditMode })
  const existingBanner = useMemo(() => banners.find((b) => b.id === Number(id)), [banners, id])

  // ── Memoized Options ────────────────────────────────────────────────────
  const mapOptions = (arr: any[]) => arr.map((item) => ({ value: String(item.id), label: item.name }))

  const bannerTypeOptions = useMemo(() => mapOptions(bannerTypes), [bannerTypes])
  const displayTargetOptions = useMemo(() => mapOptions(displayTargets), [displayTargets])
  const contentModeOptions = useMemo(() => mapOptions(contentModes), [contentModes])
  const productOptions = useMemo(() => mapOptions(products), [products])
  const salonOptions = useMemo(() => mapOptions(salons), [salons])

  // ── Mutations ───────────────────────────────────────────────────────────
  const [addBanner, { isLoading: isAdding }] = useAddBannerMutation()
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation()
  const [addBannerImage, { isLoading: isUploading }] = useAddBannerImageMutation()

  // ── Form State ──────────────────────────────────────────────────────────
  const [bannerTypeId, setBannerTypeId] = useState<number | null>(null)
  const [productId, setProductId] = useState<number | null>(null)
  const [salonId, setSalonId] = useState<number | null>(null)
  const [titleEn, setTitleEn] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [firstColor, setFirstColor] = useState('')
  const [bannerDisplayTargetId, setBannerDisplayTargetId] = useState<number | null>(null)
  const [bannerContentModeId, setBannerContentModeId] = useState<number | null>(null)
  const [isAppDownloadLink, setIsAppDownloadLink] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([])
  const [isNewImageUploaded, setIsNewImageUploaded] = useState(false)

  const isLoading = isAdding || isUpdating || isUploading

  // ── Pre-fill on Edit ────────────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && existingBanner) {
      setBannerTypeId(existingBanner.bannerTypeId)
      setProductId(existingBanner.productId)
      setSalonId(existingBanner.salonId)
      setTitleEn(existingBanner.titleEn || '')
      setDescriptionEn(existingBanner.descriptionEn || '')
      setTitleAr(existingBanner.titleAr || '')
      setDescriptionAr(existingBanner.descriptionAr || '')
      setFirstColor(existingBanner.firstColor || '')
      setBannerDisplayTargetId(existingBanner.bannerDisplayTargetId)
      setBannerContentModeId(existingBanner.bannerContentModeId)
      setIsAppDownloadLink(existingBanner.isAppDownloadLink)
      setIsActive(existingBanner.isActive)

      if (existingBanner.imageUrl) {
        // We can create a fake file object just for preview purpose
        setImageFiles([{
          file: new File([''], 'banner-image', { type: 'image/webp' }),
          preview: existingBanner.imageUrl,
        }])
      }
    }
  }, [existingBanner, isEditMode])

  // Determine what to show based on Banner Type
  const selectedBannerType = useMemo(
    () => bannerTypes.find((bt) => bt.id === bannerTypeId),
    [bannerTypes, bannerTypeId]
  )

  const isProductSelected = selectedBannerType?.name?.toLowerCase() === 'product'
  const isSalonSelected = selectedBannerType?.name?.toLowerCase() === 'salon'

  const selectedContentMode = useMemo(
    () => contentModes.find((cm) => cm.id === bannerContentModeId),
    [contentModes, bannerContentModeId]
  )
  const isImageOnly = selectedContentMode?.name?.toLowerCase() === 'image only'

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (bannerDisplayTargetId === null || !bannerContentModeId) {
      toast.error('Please fill in all required dropdowns.')
      return
    }

    if (!isImageOnly && !bannerTypeId) {
      toast.error('Please select a Banner Type.')
      return
    }

    if (imageFiles.length === 0) {
      toast.error('Please upload a banner image.')
      return
    }

    try {
      const payload = {
        bannerTypeId: isImageOnly ? null : bannerTypeId,
        productId: (!isImageOnly && isProductSelected) ? (productId ?? null) : null,
        salonId: (!isImageOnly && isSalonSelected) ? (salonId ?? null) : null,
        titleEn: isImageOnly ? null : titleEn,
        descriptionEn: isImageOnly ? null : descriptionEn,
        titleAr: isImageOnly ? null : titleAr,
        descriptionAr: isImageOnly ? null : descriptionAr,
        firstColor: isImageOnly ? null : firstColor,
        secondColor: null,
        bannerDisplayTargetId,
        bannerContentModeId,
        isAppDownloadLink,
        isActive,
      }

      let bannerId: number

      if (isEditMode) {
        // Edit mode
        await updateBanner({ id: Number(id), ...payload }).unwrap()
        bannerId = Number(id)
      } else {
        // Create mode
        bannerId = await addBanner(payload).unwrap()
      }

      // 2. Upload banner image only if it's a new upload or create mode
      // If edit mode and image wasn't changed (isNewImageUploaded is false), we can skip.
      if (!isEditMode || isNewImageUploaded) {
        await addBannerImage({
          BannerId: bannerId,
          BannerPicture: imageFiles[0].file,
        }).unwrap()
      }

      toast.success(`Banner ${isEditMode ? 'updated' : 'created'} successfully!`)
      
      navigate('/banner')
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error', 'An error occurred')))
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isEditMode ? 'Edit Banner' : 'Create Banner'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isEditMode ? 'Update existing banner settings.' : 'Add a new banner and configure its settings.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isImageOnly && (
            <Select
              label="Banner Type"
              value={bannerTypeId !== null ? String(bannerTypeId) : ''}
              onChange={(e) => {
                setBannerTypeId(Number(e.target.value))
                setProductId(null)
                setSalonId(null)
              }}
              options={bannerTypeOptions}
              placeholder="Select Banner Type"
              required
            />
          )}

          <Select
            label="Display Target"
            value={bannerDisplayTargetId !== null ? String(bannerDisplayTargetId) : ''}
            onChange={(e) => setBannerDisplayTargetId(Number(e.target.value))}
            options={displayTargetOptions}
            placeholder="Select Display Target"
            required
          />

          <Select
            label="Content Mode"
            value={bannerContentModeId !== null ? String(bannerContentModeId) : ''}
            onChange={(e) => setBannerContentModeId(Number(e.target.value))}
            options={contentModeOptions}
            placeholder="Select Content Mode"
            required
          />

          {!isImageOnly && isProductSelected && (
            <Select
              label="Select Product"
              value={productId !== null ? String(productId) : ''}
              onChange={(e) => setProductId(Number(e.target.value))}
              options={productOptions}
              placeholder="Select Product"
            />
          )}

          {!isImageOnly && isSalonSelected && (
            <Select
              label="Select Salon"
              value={salonId !== null ? String(salonId) : ''}
              onChange={(e) => setSalonId(Number(e.target.value))}
              options={salonOptions}
              placeholder="Select Salon"
            />
          )}
        </div>

        {!isImageOnly && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
            />
            <Input
              label="Title (Arabic)"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              dir="rtl"
            />
            <Input
              label="Description (English)"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
            />
            <Input
              label="Description (Arabic)"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              dir="rtl"
            />
          </div>
        )}

        {!isImageOnly && (
          <div className="w-full max-w-md">
            <DualColorPicker
              value={firstColor}
              onChange={(hex) => setFirstColor(hex)}
              required
            />
          </div>
        )}

        <div className="flex gap-6 items-center pt-2">
          <Toggle
            checked={isAppDownloadLink}
            onChange={setIsAppDownloadLink}
            label="App Download Link"
          />
          <Toggle
            checked={isActive}
            onChange={setIsActive}
            label="Active"
          />
        </div>

        <div className="pt-2">
          <UploadImage
            label="Banner Image"
            value={imageFiles}
            onChange={(files) => {
              setImageFiles(files)
              setIsNewImageUploaded(true)
            }}
            mode="image"
            multiple={false}
            required={!isEditMode}
          />
        </div>

        <div className="flex justify-end border-t border-[var(--border)] pt-4 mt-2 gap-2">
          <Button variant="secondary" onClick={() => navigate('/banner')} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            {isEditMode ? 'Save Changes' : 'Submit Banner'}
          </Button>
        </div>
      </form>
    </div>
  )
}
