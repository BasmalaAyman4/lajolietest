// ─── Salon Reel Types ─────────────────────────────────────────────────────────

export interface Reel {
  id: number
  title: string
  description: string
  createdDate: string
  isApproved: boolean
  isStoped: boolean
}

// Returned by GET /api/salon/Reals/:id  (detail)
export interface ReelDetail extends Reel {
  imageThumbnailUrl?: string
  videoUrl?: string
}

export interface CreateReelRequest {
  title: string
  description: string
}