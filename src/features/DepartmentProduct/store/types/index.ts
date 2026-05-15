// ─── Store Types ──────────────────────────────────────────────────────────────

export interface Store {
  id: number
  nameAr: string
  nameEn: string
  description: string
}

export interface CreateStoreRequest {
  nameAr: string
  nameEn: string
  description: string
}

export interface UpdateStoreRequest extends CreateStoreRequest {
  id: number
}