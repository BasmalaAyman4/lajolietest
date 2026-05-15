// ─── Branch Types ─────────────────────────────────────────────────────────────

export interface Branch {
  id: number
  nameAr: string
  nameEn: string
  description: string
}

export interface CreateBranchRequest {
  nameAr: string
  nameEn: string
  description: string
}

export interface UpdateBranchRequest extends CreateBranchRequest {
  id: number
}
