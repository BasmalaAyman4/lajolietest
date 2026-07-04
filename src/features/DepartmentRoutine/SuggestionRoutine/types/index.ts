// ── List item (GET /api/admin/SuggestionRoutine) ──────────────────────────────
export interface SuggestionRoutineListItem {
  id: number
  routinType: number
  routinTypeName: string
  nameAr: string
  nameEn: string
  description: string
  imageUrl: string | null
  routineZone: number
  isStoped: boolean
  detailsCount: number
  imagesCount: number
}

// ── A single product-type-detail option from the cascading dropdown ──────────
// (GET /BasicData/getProductTypeDetailDropdown) — single "name" field.
export interface RoutineProductTypeDetail {
  id: number
  name: string
}

// ── A product-type-detail as stored inside a saved routine detail row ────────
// (GET /SuggestionRoutine/{id}) — returns nameAr/nameEn separately.
export interface SuggestionRoutineDetailItem {
  id: number
  nameAr: string
  nameEn: string
}

// ── Detail row as returned inside GET by id ───────────────────────────────────
export interface SuggestionRoutineDetail {
  detailId: number
  productTypeId: number
  productTypeName: string
  description: string | null
  sortOrder: number
  productTypeDetails: SuggestionRoutineDetailItem[]
}

// ── Image as returned inside GET by id ────────────────────────────────────────
export interface SuggestionRoutineImage {
  id: number
  imageUrl: string
}

// ── Full routine (GET by id) ──────────────────────────────────────────────────
export interface SuggestionRoutine {
  id: number
  routinTypeId: number
  nameAr: string
  nameEn: string
  description: string
  imageUrl: string | null
  routineZone: number
  isStoped: boolean
  details: SuggestionRoutineDetail[]
  images: SuggestionRoutineImage[]
}

// ── Detail row while building the form (local-only state) ────────────────────
// Kept separate from SuggestionRoutineDetail because the form only needs ids
// for submission but wants readable labels for the table UI.
export interface PendingRoutineDetail {
  productTypeId: number
  productTypeName: string
  description: string
  sortOrder: number
  productTypeDetailIds: number[]
  productTypeDetailLabels: string[]
}

// ── Request payloads ───────────────────────────────────────────────────────────
export interface RoutineDetailPayload {
  productTypeId: number
  description: string
  sortOrder: number
  productTypeDetailIds: number[]
}

export interface CreateSuggestionRoutineRequest {
  routinTypeId: number
  nameAr: string
  nameEn: string
  description: string
  routineZone: number
  details: RoutineDetailPayload[]
}

export interface UpdateSuggestionRoutineRequest extends CreateSuggestionRoutineRequest {
  id: number
}

// ── Dropdowns ──────────────────────────────────────────────────────────────────
export interface DropdownItem {
  id: number
  name: string
}

// getProductTypeDetailDropdown?productTypeIds=x returns this grouped shape
export interface ProductTypeDetailGroup {
  id: number
  name: string
  details: RoutineProductTypeDetail[]
}