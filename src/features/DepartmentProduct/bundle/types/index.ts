// ─── ProductBundle Types ──────────────────────────────────────────────────────

// ── List item (from GET /ProductBundle) ───────────────────────────────────────
export interface ProductBundle {
  id: number
  nameAr: string
  nameEn: string
  bundlePrice: number
  priceBefore: number
  qty: number
  imageUrl: string | null
  isDeleted: boolean
}

// ── Full detail (from GET /ProductBundle/:id) ─────────────────────────────────
export interface ProductBundleDetail {
  bandleDetsilId: number
  productDetailId: number
  productId: number
  productName: string
  colorId: number
  colorName: string
  sizeId: number
  sizeName: string
  priceInBundle: number
  qty: number
}

export interface ProductBundleFull extends ProductBundle {
  description: string
  detail: ProductBundleDetail[]
}

// ── Create / Update request ───────────────────────────────────────────────────
export interface BundleDetailRequest {
  productDetailId: number
  priceInBundle: number
  qty: number
}

export interface CreateProductBundleRequest {
  nameAr: string
  nameEn: string
  description: string
  bundlePrice: number
  priceBefore: number
  qty: number
  details: BundleDetailRequest[]
}

export interface UpdateProductBundleRequest extends CreateProductBundleRequest {
  id: number
}

// ── Dropdown types ────────────────────────────────────────────────────────────
export interface ProductDropdownItem {
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
