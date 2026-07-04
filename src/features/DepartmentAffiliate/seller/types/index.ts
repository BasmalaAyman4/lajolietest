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

// ── Affiliate Request (from GET /api/admin/AffiliateRequest) ─────────────────
// Read-only — no create/update/delete for this resource.
export interface AffiliateRequestItem {
  id: number
  fullName: string
  countryId: number
  countryName: string
  cityId: number
  cityName: string
  areaId: number
  areaName: string
  additionalMobileNumber: string | null
  haveAudienceOnWhatsApp: boolean
  haveAudienceOnInstagram: boolean
  haveYouSoldOnlineBefore: boolean
  numberOfFollowers: number | null
  instagramLink: string
  facebookLink: string
  tikTokLink: string
  whyDoYouWantToJoin: string
  userId: number
  userMobile: string
  createdDate: string // ISO datetime, e.g. "2026-04-22T16:00:29.13"
}

// ── Seller (from GET /api/admin/Seller) ───────────────────────────────────────
export interface SellerListItem {
  sellerId: number
  firstName: string
  lastName: string
  mobile: string
  isStop: boolean
}

// ── User lookup by mobile (from GET /api/admin/Seller/getUser?mobile=...) ────
// Used to find an existing user account before promoting them to a seller.
export interface SellerUserLookup {
  id: number
  firstName: string
  lastName: string
  username: string | null
  email: string | null
  mobile: string
  verifyFlage: boolean
  gender: string | null
  isSeller: boolean | null
  registFrom: string | null
  registrationDate: string // "DD-MM-YYYY"
}