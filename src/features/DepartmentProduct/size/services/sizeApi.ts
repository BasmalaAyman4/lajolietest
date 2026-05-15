// ─── Size API ─────────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Size, CreateSizeRequest, UpdateSizeRequest } from '../types'

export const sizeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSizes: builder.query<Size[], void>({
      query: () => '/api/admin/Size',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Size' as const, id })), { type: 'Size', id: 'LIST' }]
          : [{ type: 'Size', id: 'LIST' }],
    }),
    createSize: builder.mutation<number, CreateSizeRequest>({
      query: (body) => ({ url: '/api/admin/Size', method: 'POST', body }),
      invalidatesTags: [{ type: 'Size', id: 'LIST' }],
    }),
    updateSize: builder.mutation<void, UpdateSizeRequest>({
      query: (body) => ({ url: '/api/admin/Size', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Size', id }],
    }),
    deleteSize: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Size/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Size', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSizesQuery,
  useCreateSizeMutation,
  useUpdateSizeMutation,
  useDeleteSizeMutation,
} = sizeApi