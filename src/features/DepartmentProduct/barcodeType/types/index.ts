// ─── BarcodeType Types ────────────────────────────────────────────────────────

export interface BarcodeType {
  id: number
  nameAr: string
  nameEn: string
}

export interface CreateBarcodeTypeRequest {
  nameAr: string
  nameEn: string
}

export interface UpdateBarcodeTypeRequest extends CreateBarcodeTypeRequest {
  id: number
}