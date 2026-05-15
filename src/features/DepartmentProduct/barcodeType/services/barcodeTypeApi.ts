// ─── BarcodeType API ──────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { BarcodeType, CreateBarcodeTypeRequest, UpdateBarcodeTypeRequest } from '../types'

export const barcodeTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBarcodeTypes: builder.query<BarcodeType[], void>({
      query: () => '/api/admin/BarcodeType',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'BarcodeType' as const, id })), { type: 'BarcodeType', id: 'LIST' }]
          : [{ type: 'BarcodeType', id: 'LIST' }],
    }),
    createBarcodeType: builder.mutation<number, CreateBarcodeTypeRequest>({
      query: (body) => ({ url: '/api/admin/BarcodeType', method: 'POST', body }),
      invalidatesTags: [{ type: 'BarcodeType', id: 'LIST' }],
    }),
    updateBarcodeType: builder.mutation<void, UpdateBarcodeTypeRequest>({
      query: (body) => ({ url: '/api/admin/BarcodeType', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'BarcodeType', id }],
    }),
    deleteBarcodeType: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/BarcodeType/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'BarcodeType', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBarcodeTypesQuery,
  useCreateBarcodeTypeMutation,
  useUpdateBarcodeTypeMutation,
  useDeleteBarcodeTypeMutation,
} = barcodeTypeApi