// ─── Purchase Types ───────────────────────────────────────────────────────────

// ── List item (GET /Purchase) ──────────────────────────────────────────────────
export interface Purchase {
  id: number
  purchaseDate: string      // "dd-MM-yyyy" from list endpoint
  qty: number
  total: number
  vendorId: number
  vendorName: string
  storeId: number
  storeName: string
  branchId: number
  branchName: string
  note: string
}

// ── Detail row inside a full purchase ─────────────────────────────────────────
export interface PurchaseDetail {
  detailId: number
  productDetailId: number
  productId: number
  productName: string
  colorId: number
  colorName: string
  sizeId: number
  sizeName: string
  purchasePrice: number
  qty: number
}

// ── Full purchase (GET /Purchase/:id) ─────────────────────────────────────────
export interface PurchaseFull {
  id: number
  purchaseDate: string      // ISO "2025-10-19T00:00:00" from detail endpoint
  vendorId: number
  storeId: number
  branchId: number
  note: string
  details: PurchaseDetail[]
}

// ── Create request ────────────────────────────────────────────────────────────
export interface PurchaseDetailRequest {
  purchasePrice: number
  qty: number
  productDetailId: number
}

export interface CreatePurchaseRequest {
  purchaseDate: string      // "YYYY-MM-DD"
  vendorId: number
  storeId: number
  branchId: number
  note: string
  details: PurchaseDetailRequest[]
}

// ── Packaging purchase (POST /Purchase/savePackagingPurchase) ─────────────────
export interface PackagingPurchaseDetailRequest {
  purchasePrice: number
  qty: number
  packagingId: number
}

export interface SavePackagingPurchaseRequest {
  purchaseDate: string
  vendorId: number
  storeId: number
  branchId: number
  note: string
  details: PackagingPurchaseDetailRequest[]
}

// ── Dropdown helpers ──────────────────────────────────────────────────────────
export interface DropdownItem {
  id: number
  name: string
}

export interface ProductDetailOption {
  detailId: number
  sizeId: number
  sizeName: string
  colorId: number
  colorName: string
  purchasePrice: number
}
