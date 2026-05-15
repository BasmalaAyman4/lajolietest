// ─── ProductBundle API ────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  ProductBundle,
  ProductBundleFull,
  CreateProductBundleRequest,
  UpdateProductBundleRequest,
  ProductDropdownItem,
  ProductDetailOption,
} from '../types'

export const productBundleApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET list ────────────────────────────────────────────────────────────
    getProductBundles: builder.query<ProductBundle[], void>({
      query: () => '/api/admin/ProductBundle',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ProductBundle' as const, id })),
              { type: 'ProductBundle', id: 'LIST' },
            ]
          : [{ type: 'ProductBundle', id: 'LIST' }],
    }),

    // ── GET single bundle with full details ─────────────────────────────────
    getProductBundle: builder.query<ProductBundleFull, number>({
      query: (id) => `/api/admin/ProductBundle/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'ProductBundle', id }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createProductBundle: builder.mutation<number, CreateProductBundleRequest>({
      query: (body) => ({ url: '/api/admin/ProductBundle', method: 'POST', body }),
      invalidatesTags: [{ type: 'ProductBundle', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateProductBundle: builder.mutation<void, UpdateProductBundleRequest>({
      query: ({ id, ...body }) => ({ url: `/api/admin/ProductBundle/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'ProductBundle', id },
        { type: 'ProductBundle', id: 'LIST' },
      ],
    }),

    // ── DELETE bundle ───────────────────────────────────────────────────────
    deleteProductBundle: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/ProductBundle/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'ProductBundle', id }],
    }),

    // ── DELETE single product detail from a bundle ──────────────────────────
    // DELETE /api/admin/ProductBundle/{bundleId}/{productDetailId}
    removeBundleDetail: builder.mutation<void, { bundleId: number; productDetailId: number }>({
      query: ({ bundleId, productDetailId }) => ({
        url: `/api/admin/ProductBundle/${bundleId}/${productDetailId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { bundleId }) => [{ type: 'ProductBundle', id: bundleId }],
    }),

    // ── POST upload bundle image ────────────────────────────────────────────
    uploadBundleImage: builder.mutation<void, { bundleId: number; file: File }>({
      query: ({ bundleId, file }) => {
        const body = new FormData()
        body.append('BundleId', String(bundleId))
        body.append('BundlePicture', file)
        return { url: '/api/admin/ProductBundle/addProductBundleImages', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { bundleId }) => [{ type: 'ProductBundle', id: bundleId }],
    }),

    // ── GET product dropdown ────────────────────────────────────────────────
    getProductDropdown: builder.query<ProductDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductDropdown',
    }),

    // ── GET product detail options for a specific product ───────────────────
    getProductDetails: builder.query<ProductDetailOption[], number>({
      query: (productId) => `/api/admin/BasicData/getProductDetails/${productId}`,
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetProductBundlesQuery,
  useGetProductBundleQuery,
  useCreateProductBundleMutation,
  useUpdateProductBundleMutation,
  useDeleteProductBundleMutation,
  useRemoveBundleDetailMutation,
  useUploadBundleImageMutation,
  useGetProductDropdownQuery,
  useLazyGetProductDetailsQuery,
} = productBundleApi
