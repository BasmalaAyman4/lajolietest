// ─── Size Types ───────────────────────────────────────────────────────────────

export interface Size {
  id: number
  nameAr: string
  nameEn: string
  description: string
}

export interface CreateSizeRequest {
  nameAr: string
  nameEn: string
  description: string
}

export interface UpdateSizeRequest extends CreateSizeRequest {
  id: number
}