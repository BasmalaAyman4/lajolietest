// ─── Report Types ─────────────────────────────────────────────────────────────

export interface Report {
  id: number
  nameAr: string
  nameEn: string
}

export interface CreateReportRequest {
  nameAr: string
  nameEn: string
}

export interface UpdateReportRequest extends CreateReportRequest {
  id: number
}
