// ── List item (from GET /api/admin/Affiliate) ────────────────────────────────
export interface AffiliateListItem {
  id: number
  productId: number
  productDetailsId: number
  colorId: number | null
  colorName: string
  sizeId: number | null
  sizeName: string
  productName: string
  sellerId: number
  sellerName: string
  dateFrom: string // "DD-MM-YYYY"
  dateTo: string   // "DD-MM-YYYY"
  timeFrom: string // "HH:mm:ss"
  timeTo: string   // "HH:mm:ss"
  commission: number
  affiliateLink: string | null
  isStoped: boolean
  createdDate: string // "DD-MM-YYYY"
}

// ── Seller (from GET /api/admin/Seller) ───────────────────────────────────────
export interface Seller {
  sellerId: number
  firstName: string
  lastName: string
  mobile: string
  isStop: boolean
}

// ── Product detail option (from BasicData) ────────────────────────────────────
export interface ProductDetailOption {
  detailId: number
  sizeId: number
  sizeName: string
  colorId: number
  colorName: string
  purchasePrice: number
}

// ── Dropdown item (shared, e.g. product dropdown) ─────────────────────────────
export interface DropdownItem {
  id: number
  name: string
}

// ── Pending row (local state, before the bulk save) ───────────────────────────
export interface PendingAffiliate {
  productId: number
  productDetailsId: number
  sellerId: number
  dateFrom: string // "YYYY-MM-DD"
  dateTo: string   // "YYYY-MM-DD"
  timeFrom: { hour: number; minute: number }
  timeTo: { hour: number; minute: number }
  commission: number
  label: string       // display-only: "Product — Size / Color"
  sellerLabel: string // display-only
}

// ── Request payloads ───────────────────────────────────────────────────────────
export interface SaveAffiliateItem {
  productId: number
  productDetailsId: number
  sellerId: number
  dateFrom: string // ISO datetime
  dateTo: string   // ISO datetime
  timeFrom: string // "HH:mm:ss"
  timeTo: string   // "HH:mm:ss"
  commission: number
}

export interface SaveListOfAffiliateRequest {
  saveAffiliates: SaveAffiliateItem[]
}

export interface UpdateAffiliateRequest {
  id: number
  dateFrom: string // ISO datetime
  dateTo: string   // ISO datetime
  timeFrom: string // "HH:mm:ss"
  timeTo: string   // "HH:mm:ss"
  commission: number
}