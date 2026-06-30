// ── List item (from GET /api/admin/Discount) ─────────────────────────────────
export interface DiscountListItem {
  id: number
  dateFrom: string
  toDate: string
  isStoped: boolean
  noOfProducts: number
  discountType: number
  discountTypeName: string
}

// ── Detail row inside a full discount (GET by id) ────────────────────────────
export interface DiscountDetail {
  detailId: number
  discountValue: number
  isStoped: boolean
  // Product-specific fields (discountType === 2)
  productDetailsId?: number
  productId?: number
  productNameAr?: string
  productNameEn?: string
  colorId?: number
  colorNameAr?: string
  colorNameEn?: string
  colorHex?: string
  sizeId?: number
  sizeNameAr?: string
  sizeNameEn?: string
  purchasePrice?: number
  salesPrice?: number
  // Category / Subcategory / Brand name (returned by API for those types)
  name?: string
}

// ── Full discount (GET by id) ─────────────────────────────────────────────────
export interface Discount {
  dateFrom: string
  toDate: string
  discountType: number
  discountTypeName: string
  isStoped: boolean
  details: DiscountDetail[]
  discountCategories: DiscountDetail[]
  discountSubCategories: DiscountDetail[]
  discountBrands: DiscountDetail[]
}

// ── Pending detail row (before save — local state in the form) ───────────────
export interface PendingDetail {
  relatedId: number
  discountValue: number
  // display-only label shown in the table
  label: string
}

// ── Request payloads ──────────────────────────────────────────────────────────
export interface DiscountDetailPayload {
  relatedId: number
  discountValue: number
}

export interface CreateDiscountRequest {
  discountType: number
  dateFrom: string
  toDate: string
  details: DiscountDetailPayload[]
}

export interface UpdateDiscountRequest extends CreateDiscountRequest {
  id: number
}

// ── Dropdown item (shared) ────────────────────────────────────────────────────
export interface DropdownItem {
  id: number
  name: string
}

// ── Product detail option (from BasicData) ───────────────────────────────────
export interface ProductDetailOption {
  detailId: number
  sizeId: number
  sizeName: string
  colorId: number
  colorName: string
  purchasePrice: number
}
