// ─── Interest Types ───────────────────────────────────────────────────────────

export interface Interest {
  id: number
  imageUrl?: string
  nameAr: string
  nameEn: string
  codeKey: string
  isActive: boolean
  sortOrder: number
}

export interface CreateInterestRequest {
  codeKey: string
  nameAr: string
  nameEn: string
  isActive: number
  sortOrder: number
}

export interface UpdateInterestRequest extends CreateInterestRequest {
  id: number
}
