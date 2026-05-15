// ─── Brand API ────────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '../types'

export const brandApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all brands ──────────────────────────────────────────────────────
    getBrands: builder.query<Brand[], void>({
      query: () => '/api/admin/Brand',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Brand' as const, id })),
              { type: 'Brand', id: 'LIST' },
            ]
          : [{ type: 'Brand', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createBrand: builder.mutation<number, CreateBrandRequest>({
      query: (body) => ({ url: '/api/admin/Brand', method: 'POST', body }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateBrand: builder.mutation<void, UpdateBrandRequest>({
      query: (body) => ({ url: '/api/admin/Brand', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Brand', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Brand/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Brand', id }],
    }),

    // ── POST upload brand image ─────────────────────────────────────────────
    uploadBrandImage: builder.mutation<void, { brandId: number; file: File }>({
      query: ({ brandId, file }) => {
        const body = new FormData()
        body.append('BrandId', String(brandId))
        body.append('BrandPicture', file)
        return { url: '/api/admin/Brand/addBrandImages', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { brandId }) => [{ type: 'Brand', id: brandId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useUploadBrandImageMutation,
} = brandApi
