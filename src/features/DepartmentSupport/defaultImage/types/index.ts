// ─── DefaultImage Types ───────────────────────────────────────────────────

export interface ImageSectionOption {
    id: number
    name: string
  }
  export interface ImagePhotoTypeOption {
    id: number
    name: string
  }
  
  export interface DefaultImage {
    id: number
    defaultImageSectionId: number,
    defaultImageSectionName: string,
    defaultImagePhotoTypeId: number,
    defaultImagePhotoTypeName: string,
    imageUrl: string,
    altText: string | null,
    sortOrder: number | null,
    isActive: boolean
  
  }
  
  export interface CreateDefaultImageRequest {
    defaultImageSectionId: number,
    defaultImagePhotoTypeId: number,
    altText: string,
    sortOrder: number,
    isActive: boolean
  }
  
  export interface UpdateDefaultImageRequest extends CreateDefaultImageRequest {
    id: number
  }