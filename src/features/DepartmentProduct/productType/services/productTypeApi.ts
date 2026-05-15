// ─── ProductType API ──────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  ProductType,
  CreateProductTypeRequest,
  UpdateProductTypeRequest,
} from '../types'

export const productTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all product types ───────────────────────────────────────────────
    getProductTypes: builder.query<ProductType[], void>({
      query: () => '/api/admin/ProductType',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ProductType' as const, id })),
              { type: 'ProductType', id: 'LIST' },
            ]
          : [{ type: 'ProductType', id: 'LIST' }],
    }),

    // ── POST create product type → returns new id ───────────────────────────
    createProductType: builder.mutation<number, CreateProductTypeRequest>({
      query: (body) => ({
        url: '/api/admin/ProductType',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ProductType', id: 'LIST' }],
    }),

    // ── PUT update product type ─────────────────────────────────────────────
    updateProductType: builder.mutation<void, UpdateProductTypeRequest>({
      query: (body) => ({
        url: '/api/admin/ProductType',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ProductType', id }],
    }),

    // ── DELETE product type by id ───────────────────────────────────────────
    deleteProductType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/ProductType/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'ProductType', id }],
    }),

    // ── POST upload product type image ──────────────────────────────────────
    uploadProductTypeImage: builder.mutation<void, { productTypeId: number; file: File }>({
      query: ({ productTypeId, file }) => {
        const body = new FormData()
        body.append('ProductTypeId', String(productTypeId))
        body.append('ProductTypePicture', file)
        return {
          url: '/api/admin/ProductType/addProductTypeImages',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (_result, _error, { productTypeId }) => [
        { type: 'ProductType', id: productTypeId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetProductTypesQuery,
  useCreateProductTypeMutation,
  useUpdateProductTypeMutation,
  useDeleteProductTypeMutation,
  useUploadProductTypeImageMutation,
} = productTypeApi
