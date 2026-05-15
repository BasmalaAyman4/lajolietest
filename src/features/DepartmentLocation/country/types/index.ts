// ─── Country Types ─────────────────────────────────────────────────────────────

export interface Country {
  id: number
  nameAr: string
  nameEn: string
}

export interface CreateCountryRequest {
  nameAr: string
  nameEn: string
}

export interface UpdateCountryRequest extends CreateCountryRequest {
  id: number
}
