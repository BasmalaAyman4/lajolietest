// ─── Service Code Types ──────────────────────────────────────────────────────────────

export interface ServiceCode {
  id: number
  imageUrl?: string
  nameAr: string
  nameEn: string
  description: string
}

export interface CreateServiceCodeRequest {
  nameAr: string
  nameEn: string
  description: string
}

export interface UpdateServiceCodeRequest extends CreateServiceCodeRequest {
  id: number
}
