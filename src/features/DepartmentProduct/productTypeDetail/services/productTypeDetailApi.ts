// ─── ProductTypeDetail API ──────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { ProductTypeDetail, CreateProductTypeDetailRequest, UpdateProductTypeDetailRequest } from '../types'

export interface ProductTypeDropdownItem {
  id: number
  name: string
}

export const productTypeDetailApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductTypeDetails: builder.query<ProductTypeDetail[], void>({
      query: () => '/api/admin/ProductTypeDetail',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'ProductTypeDetail' as const, id })), { type: 'ProductTypeDetail', id: 'LIST' }]
          : [{ type: 'ProductTypeDetail', id: 'LIST' }],
    }),
    createProductTypeDetail: builder.mutation<number, CreateProductTypeDetailRequest>({
      query: (body) => ({ url: '/api/admin/ProductTypeDetail', method: 'POST', body }),
      invalidatesTags: [{ type: 'ProductTypeDetail', id: 'LIST' }],
    }),
  updateProductTypeDetail: builder.mutation<void, UpdateProductTypeDetailRequest>({
  query: (body) => ({ url: '/api/admin/ProductTypeDetail', method: 'PUT', body }),
  invalidatesTags: (_r, _e, { id }) => [
    { type: 'ProductTypeDetail', id },
    { type: 'ProductTypeDetail', id: 'LIST' }, // ← add this
  ],
}),
    deleteProductTypeDetail: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/ProductTypeDetail/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'ProductTypeDetail', id }],
    }),
    // ── POST upload ProductTypeDetail image ───────────────────────────────────────────
    uploadProductTypeDetailImage: builder.mutation<void, { ProductTypeDetailId: number; file: File }>({
      query: ({ ProductTypeDetailId, file }) => {
        const body = new FormData()
        body.append('ProductTypeDetailId', String(ProductTypeDetailId))
        body.append('ProductTypeDetailPicture', file)
        return { url: '/api/admin/ProductTypeDetail/addProductTypeDetailImages', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { ProductTypeDetailId }) => [{ type: 'ProductTypeDetail', id: ProductTypeDetailId }],
    }),
    // ── GET ProductType dropdown ────────────────────────────────────────
    getProductTypeDropdown: builder.query<ProductTypeDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductTypeDropdown',
      providesTags: [{ type: 'ProductType', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetProductTypeDetailsQuery,
  useCreateProductTypeDetailMutation,
  useUpdateProductTypeDetailMutation,
  useDeleteProductTypeDetailMutation,
  useUploadProductTypeDetailImageMutation,
  useGetProductTypeDropdownQuery,
} = productTypeDetailApi