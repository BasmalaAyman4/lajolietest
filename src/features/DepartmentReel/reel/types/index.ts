// ─── Reel Types ───────────────────────────────────────────────────────────────

export interface Reel {
  id: number
  title: string
  description: string
  createdDate: string
  uploadedBy: string
  isApproved: boolean
  isStoped: boolean
}

export interface ReelDetail {
  id: number
  title: string
  description: string
  createdDate: string
  uploadedBy: string
  productId: number | null
  productName: string
  salonId: number | null
  salonName: string
  salonServiceId: number | null
  salonServiceName: string
  salonPackageId: number | null
  salonPackageName: string
  makeupArtist: number | null
  makeupArtistName: string
  imageThumbnailUrl: string
  videoUrl: string
  isApproved: boolean
  isStoped: boolean
  reelsCategoryId: number
  reelsCategoryName: string
  reelsPurposeId: number
  reelsPurposeName: string
}

// ── Category / Purpose dropdown items ──────────────────────────────────────

export interface ReelDropdownItem {
  id: number
  name: string
}

export interface SalonServiceDropdownItem {
  id: number
  name: string
  salonId: number
}

export interface SalonPackageDropdownItem {
  id: number
  name: string
  salonId: number
}

// ── POST body (fields omitted based on category/purpose selection) ──────────

export interface CreateReelRequest {
  title: string
  description: string
  reelsCategoryId: number
  reelsPurposeId: number
  productId?: number
  salonId?: number
  salonServiceId?: number
  salonPackageId?: number
  makeupArtist?: number
}