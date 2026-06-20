// ─── Product Types ────────────────────────────────────────────────────────────

export interface HairType {
  id: number
  name: string
}

export interface SkinType {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  enName: string
  brandId: number
  brandName: string
  categoryId: number
  categoryName: string
  productTypeId: number
  productTypeName: string
  salePrice: number
  quantity: number
  isDeleted: boolean
  hairTypes: HairType[]
  skinTypes: SkinType[]
  isSensitiveSkin: boolean
  isActive: boolean
}

export interface ProductListResponse {
  products: Product[]
  lastPageNo: number
}

// ── Product Detail (single product by ID) ────────────────────────────────────

export interface ProductSize {
  sizeId: number
  nameAr: string
  nameEn: string
  purchasePrice: number
  salesPrice: number
}

export interface ProductColor {
  id: number
  nameAr: string
  nameEn: string
  colorHex: string
  headColorId: number | null
  purchasePrice: number
  salesPrice: number
  sizes: ProductSize[]
}

export interface ProductDetail {
  detailId: number
  colorId: number
  sizeId: number
  purchasePrice: number
  salesPrice: number
  saleaPrice?: number
  isStoped: boolean
}

export interface ProductImage {
  imageId: number
  colorId: number
  sizeId: number
  fileLink: string
  isPrimary: boolean
}

export interface ProductPackaging {
  productPackagingId: number
  sizeId: number
  sizeName: string
  packagingId: number
  packagingName: string
  qty: number
  price: number
  isStoped: boolean
}

export interface ProductFull {
  id: number
  name: string
  enName: string
  brandId: number
  categoryId: number
  subCategoryId: number | null
  howToUse: string
  description: string
  descriptionAr: string
  ingredients: string
  ingredientsAr: string
  isVegan: boolean
  forChildren: boolean
  canTry: boolean
  isDisappearColor: boolean
  isDisappearSize: boolean
  isSensitiveSkin: boolean
  isActive: boolean
  hairTypes: HairType[]
  skinTypes: SkinType[]
  colors: ProductColor[]
  details: ProductDetail[]
  productImages: ProductImage[]
  productPackaging: ProductPackaging[]
  subCategories: { id: number; name: string }[]
  beautyCategories: string[]
  concerns: string[]
  interests: string[]
  goals: string[]
  concernIds: number[]
  interestIds: number[]
  goalIds: number[]
  productTypeDetailIds: number[]
  productTypeIds: number[]
  beautyCategoryIds: number[]
  brandName: string
  categoryName: string
  subCategoryIds: number[]
  isTrending: boolean
}

// ── Dropdown types ──────────────────────────────────────────────────────────

export interface DropdownItem {
  id: number
  name: string
}

export interface SubCategoryDropdownItem {
  id: number
  name: string
  categoryId: number
}

export interface ProductTypeDetailDropdownItem {
  id: number
  name: string
  details: { id: number; name: string }[]
}

// ── Create / Update ──────────────────────────────────────────────────────────

export interface CreateProductRequest {
  name: string
  enName: string
  brandId: number
  categoryId: number
  subCategoryId: number[]
  productTypeIds: number[] 
  howToUse: string
  description: string
  descriptionAr: string
  ingredients: string
  ingredientsAr: string
  isVegan: boolean
  forChildren: boolean
  canTry: boolean
  isDisappearColor: boolean
  isDisappearSize: boolean
  hairTypes: number[]
  skinTypes: number[]
  productTypeDetailIds: number[]
  isSensitiveSkin: boolean
  isActive: boolean
  isTrending: boolean
  beautyCategoryIds: number[]
  concernIds: number[]
  interestIds: number[]
  goalIds: number[]
}

export type UpdateProductRequest = CreateProductRequest & { id: number }

// ── Product Details (saveProductDetails) ─────────────────────────────────────

export interface SizeDetailEntry {
  sizeId: number
  purchasePrice: number
  salesPrice: number
  detailId?: number
}

export interface SaveProductDetailsRequest {
  productId: number
  sizeIds: SizeDetailEntry[]
  headColorId: number | null
  colorNameAr: string | null
  colorNameEn: string | null
  colorHex: string | null
  purchasePrice?: number
  salesPrice?: number
}

export interface UpdateProductDetailsRequest {
  productId: number
  details: Array<{
    sizeId: number
    purchasePrice: number
    salesPrice: number
    detailId: number | null
  }>
}

// ── Product Colors (from getProductColors endpoint) ───────────────────────────

export interface ProductColorListItem {
  colorId: number
  nameEn: string
  nameAr: string
  colorHex: string
}

// ── Product Packaging ────────────────────────────────────────────────────────

export interface SavePackagingItem {
  productPackagingId?: number
  productId: number
  sizeId: number
  packagingId: number
  qty: number
  price: number
}

export interface SavePackagingRequest {
  saveProductPackagings: SavePackagingItem[]
}