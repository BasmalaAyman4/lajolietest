// ─── Packaging Types ──────────────────────────────────────────────────────────

export interface Packaging {
  id: number
  imageUrl?: string
  nameAr: string
  nameEn: string
  price: number
  isMultiple: boolean
  fromQty: number
  toQty: number
}

export interface CreatePackagingRequest {
  nameAr: string
  nameEn: string
  price: number
  isMultiple: boolean
  fromQty: number
  toQty: number
}

export interface UpdatePackagingRequest extends CreatePackagingRequest {
  id: number
}
