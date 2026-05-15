// ─── BeautyCategory API ───────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  BeautyCategory,
  CreateBeautyCategoryRequest,
  UpdateBeautyCategoryRequest,
} from '../types'

export const beautyCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all beauty categories ───────────────────────────────────────────
    getBeautyCategories: builder.query<BeautyCategory[], void>({
      query: () => '/api/admin/BeautyCategory',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'BeautyCategory' as const, id })),
              { type: 'BeautyCategory', id: 'LIST' },
            ]
          : [{ type: 'BeautyCategory', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createBeautyCategory: builder.mutation<number, CreateBeautyCategoryRequest>({
      query: (body) => ({ url: '/api/admin/BeautyCategory', method: 'POST', body }),
      invalidatesTags: [{ type: 'BeautyCategory', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateBeautyCategory: builder.mutation<void, UpdateBeautyCategoryRequest>({
      query: (body) => ({ url: '/api/admin/BeautyCategory', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'BeautyCategory', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteBeautyCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/BeautyCategory/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'BeautyCategory', id }],
    }),

    // ── POST upload image ───────────────────────────────────────────────────
    uploadBeautyCategoryImage: builder.mutation<void, { beautyCategoryId: number; file: File }>({
      query: ({ beautyCategoryId, file }) => {
        const body = new FormData()
        body.append('BeautyCategoryId', String(beautyCategoryId))
        body.append('Picture', file)
        return { url: '/api/admin/BeautyCategory/addBeautyCategoryImages', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { beautyCategoryId }) => [
        { type: 'BeautyCategory', id: beautyCategoryId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBeautyCategoriesQuery,
  useCreateBeautyCategoryMutation,
  useUpdateBeautyCategoryMutation,
  useDeleteBeautyCategoryMutation,
  useUploadBeautyCategoryImageMutation,
} = beautyCategoryApi
