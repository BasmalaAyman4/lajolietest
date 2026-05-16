// ─── ReelCategory API ───────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { ReelCategory, CreateReelCategoryRequest, UpdateReelCategoryRequest } from '../types'

export const reelCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReelCategories: builder.query<ReelCategory[], void>({
      query: () => '/api/admin/ReelCategory',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'ReelCategory' as const, id })), { type: 'ReelCategory', id: 'LIST' }]
          : [{ type: 'ReelCategory', id: 'LIST' }],
    }),
    createReelCategory: builder.mutation<number, CreateReelCategoryRequest>({
      query: (body) => ({ url: '/api/admin/ReelCategory', method: 'POST', body }),
      invalidatesTags: [{ type: 'ReelCategory', id: 'LIST' }],
    }),
    updateReelCategory: builder.mutation<void, UpdateReelCategoryRequest>({
      query: (body) => ({ url: '/api/admin/ReelCategory', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ReelCategory', id }],
    }),
    deleteReelCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/ReelCategory?id=${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'ReelCategory', id }],
    }),
    // ── POST upload reel category image ─────────────────────────────────────────────
    uploadReelCategoryImage: builder.mutation<void, { reelCategoryId: number; file: File }>({
      query: ({ reelCategoryId, file }) => {
        const body = new FormData()
        body.append('ReelCategoryId', String(reelCategoryId))
        body.append('CategoryPicture', file)
        return { url: '/api/admin/ReelCategory/addReelCategoryImage', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { reelCategoryId }) => [{ type: 'ReelCategory', id: reelCategoryId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetReelCategoriesQuery,
  useCreateReelCategoryMutation,
  useUpdateReelCategoryMutation,
  useDeleteReelCategoryMutation,
  useUploadReelCategoryImageMutation,
} = reelCategoryApi