// ─── Purchase API ─────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  Purchase,
  PurchaseFull,
  CreatePurchaseRequest,
  SavePackagingPurchaseRequest,
  DropdownItem,
  ProductDetailOption,
  UpdatePurchaseRequest,
} from '../types'

// Re-export shape expected from BasicData endpoints
export type { DropdownItem }

export const purchaseApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET all purchases ───────────────────────────────────────────────────
    getPurchases: builder.query<Purchase[], void>({
      query: () => '/api/admin/Purchase',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Purchase' as const, id })),
              { type: 'Purchase', id: 'LIST' },
            ]
          : [{ type: 'Purchase', id: 'LIST' }],
    }),

    // ── GET single purchase with full details ───────────────────────────────
    getPurchase: builder.query<PurchaseFull, number>({
      query: (id) => `/api/admin/Purchase/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Purchase', id }],
    }),

    // ── POST create product purchase ────────────────────────────────────────
    createPurchase: builder.mutation<void, CreatePurchaseRequest>({
      query: (body) => ({ url: '/api/admin/Purchase', method: 'POST', body }),
      invalidatesTags: [{ type: 'Purchase', id: 'LIST' }],
    }),

    // ── POST create packaging purchase ──────────────────────────────────────
    savePackagingPurchase: builder.mutation<void, SavePackagingPurchaseRequest>({
      query: (body) => ({ url: '/api/admin/Purchase/savePackagingPurchase', method: 'POST', body }),
      invalidatesTags: [{ type: 'Purchase', id: 'LIST' }],
    }),

    // ── DELETE single detail row ─────────────────────────────────────────────
    // DELETE /api/admin/Purchase/deleteDetail?id={detailId}
    deletePurchaseDetail: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Purchase/deleteDetail?id=${id}`,
        method: 'DELETE',
      }),
      // Invalidate all purchase details since we don't know the parent id here
      invalidatesTags: [{ type: 'Purchase', id: 'LIST' }],
    }),
 deletePurchase: builder.mutation<void, number>({
  query: (id) => ({
    url: `/api/admin/Purchase?id=${id}`,
    method: 'DELETE',
  }),
   invalidatesTags: [{ type: 'Purchase', id: 'LIST' }],

}),
updatePurchase: builder.mutation<void, UpdatePurchaseRequest>({
  query: ({ id, ...body }) => ({
    url: `/api/admin/Purchase`,
    method: 'PUT',
    body: { id, ...body },  // ✅ id in both URL and body
  }),
  invalidatesTags: (_r, _e, { id }) => [
    { type: 'Purchase', id },
    { type: 'Purchase', id: 'LIST' },
  ],
}),
 
    // ── Dropdowns ───────────────────────────────────────────────────────────
    getVendorDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getVendorDropdown',
    }),
    getStoreDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getStoreDropdown',
    }),
    getBranchDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBranchDropdown',
    }),
    getProductDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductDropdown',
    }),
    getPackagingDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getPackagingDropdown',
    }),

    // ── Lazy: product detail options by product id ──────────────────────────
    getProductDetails: builder.query<ProductDetailOption[], number>({
      query: (productId) => `/api/admin/BasicData/getProductDetails/${productId}`,
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetPurchasesQuery,
  useGetPurchaseQuery,
  useCreatePurchaseMutation,
  useSavePackagingPurchaseMutation,
  useDeletePurchaseDetailMutation,
  useDeletePurchaseMutation,
  useUpdatePurchaseMutation,
  useGetVendorDropdownQuery,
  useGetStoreDropdownQuery,
  useGetBranchDropdownQuery,
  useGetProductDropdownQuery,
  useGetPackagingDropdownQuery,
  useLazyGetProductDetailsQuery,
} = purchaseApi
