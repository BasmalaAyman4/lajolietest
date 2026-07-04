import { api } from '@/services/api'
import type {
  AffiliateListItem,
  Seller,
  DropdownItem,
  ProductDetailOption,
  SaveListOfAffiliateRequest,
  UpdateAffiliateRequest,
} from '../types'

export const affiliateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Affiliate CRUD ─────────────────────────────────────────────────────────
    getAdminAffiliates: builder.query<AffiliateListItem[], void>({
      query: () => '/api/admin/Affiliate',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminAffiliate' as const, id })),
              { type: 'AdminAffiliate', id: 'LIST' },
            ]
          : [{ type: 'AdminAffiliate', id: 'LIST' }],
    }),

    // Bulk create — takes the full pending list at once
    saveListOfAffiliate: builder.mutation<void, SaveListOfAffiliateRequest>({
      query: (body) => ({
        url: '/api/admin/Affiliate/saveListOfAffiliate',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminAffiliate', id: 'LIST' }],
    }),

    // Edit — only date/time/commission are updatable
    updateAdminAffiliate: builder.mutation<void, UpdateAffiliateRequest>({
      query: (body) => ({
        url: '/api/admin/Affiliate',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminAffiliate', id },
        { type: 'AdminAffiliate', id: 'LIST' },
      ],
    }),

    // Toggle stop / activate (same endpoint for both)
    stopAdminAffiliate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Affiliate/stop/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminAffiliate', id },
        { type: 'AdminAffiliate', id: 'LIST' },
      ],
    }),

    // ── Dropdowns ────────────────────────────────────────────────────────────
    getAdminSellers: builder.query<Seller[], void>({
      query: () => '/api/admin/Seller',
    }),

    getAdminProductDropdownForAffiliate: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductDropdown',
    }),

    getAdminProductDetailsForAffiliate: builder.query<ProductDetailOption[], number>({
      query: (productId) => `/api/admin/BasicData/getProductDetails/${productId}`,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAdminAffiliatesQuery,
  useSaveListOfAffiliateMutation,
  useUpdateAdminAffiliateMutation,
  useStopAdminAffiliateMutation,
  useGetAdminSellersQuery,
  useGetAdminProductDropdownForAffiliateQuery,
  useLazyGetAdminProductDetailsForAffiliateQuery,
} = affiliateApi