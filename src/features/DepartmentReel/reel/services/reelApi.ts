// ─── Reel API ─────────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  Reel,
  ReelDetail,
  ReelDropdownItem,
  SalonServiceDropdownItem,
  SalonPackageDropdownItem,
  CreateReelRequest,
} from '../types'

export const reelApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all reels ───────────────────────────────────────────────────────
    getReels: builder.query<Reel[], void>({
      query: () => '/api/admin/Reals',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reel' as const, id })),
              { type: 'Reel', id: 'LIST' },
            ]
          : [{ type: 'Reel', id: 'LIST' }],
    }),

    // ── GET single reel ─────────────────────────────────────────────────────
 

    // ── GET category dropdown ───────────────────────────────────────────────
    getReelsCategoryDropdown: builder.query<ReelDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getReelsCategoryDropdown',
    }),

    // ── GET purpose dropdown ────────────────────────────────────────────────
    getReelsPurposeDropdown: builder.query<ReelDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getReelsPurposeDropdown',
    }),
   getProductDropdown: builder.query<ReelDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductDropdown',
    }),
    // ── GET salon dropdown ──────────────────────────────────────────────────
    getSalonDropdown: builder.query<ReelDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSalonDropdown',
    }),

    // ── GET salon service dropdown (all, filter client-side by salonId) ─────
    getSalonServiceDropdown: builder.query<SalonServiceDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSalonServiceDropDowns',
    }),

    // ── GET salon package dropdown (all, filter client-side by salonId) ─────
    getSalonPackageDropdown: builder.query<SalonPackageDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSalonPackageDropDowns',
    }),

    // ── POST create reel → returns new id ───────────────────────────────────
    createReel: builder.mutation<number, CreateReelRequest>({
      query: (body) => ({ url: '/api/admin/Reals', method: 'POST', body }),
      invalidatesTags: [{ type: 'Reel', id: 'LIST' }],
    }),

    // ── POST upload reel video ───────────────────────────────────────────────
    uploadReelVideo: builder.mutation<void, { reelId: number; file: File }>({
      query: ({ reelId, file }) => {
        const body = new FormData()
        body.append('RealVideo', file)
        return {
          url: `/api/admin/Reals/saveRealVideo?RealId=${reelId}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (_r, _e, { reelId }) => [{ type: 'Reel', id: reelId }],
    }),

    getReelById: builder.query<ReelDetail, number>({
      query: (id) => `/api/admin/Reals/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SalonReel', id }],
    }),

    // ── DELETE reel ──────────────────────────────────────────────────────────
    deleteReel: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Reals/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Reel', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetReelsQuery,
  useGetReelByIdQuery,
  useGetReelsCategoryDropdownQuery,
  useGetReelsPurposeDropdownQuery,
  useGetProductDropdownQuery,
  useGetSalonDropdownQuery,
  useGetSalonServiceDropdownQuery,
  useGetSalonPackageDropdownQuery,
  useCreateReelMutation,
  useUploadReelVideoMutation,
  useDeleteReelMutation,
  useLazyGetReelByIdQuery,
} = reelApi