// ─── HeadColor Types ──────────────────────────────────────────────────────────

export interface HeadColor {
  id: number
  nameAr: string
  nameEn: string
}

export interface CreateHeadColorRequest {
  nameAr: string
  nameEn: string
}

export interface UpdateHeadColorRequest extends CreateHeadColorRequest {
  id: number
}