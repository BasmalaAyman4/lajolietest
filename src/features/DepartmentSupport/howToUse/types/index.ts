// ─── HowToUse Types ───────────────────────────────────────────────────────────

export interface HowToUse {
  id: number
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  howToUsePurposeId: number
  howToUsePurposeName: string
  howToUseMediaTypeId: number
  howToUseMediaTypeName: string
  imageUrl: string | null
  videoUrl: string | null
  sortOrder: number
  isActive: boolean
  isDeleted: boolean
  createdDate: string
}

// ── Create uses FormData (multipart) — built in the component ─────────────────
export interface CreateHowToUsePayload {
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  howToUsePurposeId: number
  howToUseMediaTypeId: number
  sortOrder: number
  isActive: boolean
  image?: File | null
  video?: File | null
}

export interface DropdownItem {
  id: number
  name: string
}

// Media type IDs from the API
export const MEDIA_TYPE = {
  IMAGE: 1,
  VIDEO: 2,
} as const
