// ─── SalonServiceDiscount Types ───────────────────────────────────────────────

// ── List item (GET /SalonServiceDiscount) ─────────────────────────────────────
export interface SalonServiceDiscount {
  id: number
  dateFrom: string       // "dd-MM-yyyy" from list
  toDate: string         // "dd-MM-yyyy" from list
  isStoped: boolean
  createdBySalon: boolean
  isApproved: boolean
  approvedBy: string
  approvedDate: string
}

// ── Detail row inside a full discount ─────────────────────────────────────────
export interface DiscountDetail {
  detailId: number
  salonServiceId: number
  name: string
  discountValue: number
  isStoped: boolean
}

// ── Full discount (GET /SalonServiceDiscount/:id) ─────────────────────────────
export interface SalonServiceDiscountFull {
  id: number
  dateFrom: string       // ISO from detail endpoint
  toDate: string
  isStoped: boolean
  createdBySalon: boolean
  salonId: number
  isApproved: boolean
  approvedBy: string
  approvedDate: string
  details: DiscountDetail[]
}

// ── Create request ────────────────────────────────────────────────────────────
export interface DiscountDetailRequest {
  salonServiceId: number
  discountValue: number
}

export interface CreateDiscountRequest {
  dateFrom: string       // ISO
  toDate: string         // ISO
  salonId: number
  details: DiscountDetailRequest[]
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
export interface SalonServiceDropdownItem {
  id: number
  name: string
}
