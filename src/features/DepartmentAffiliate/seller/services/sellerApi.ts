import { api } from '@/services/api'
import type { SellerListItem, SellerUserLookup } from '../types'

export const sellerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSellerList: builder.query<SellerListItem[], void>({
      query: () => '/api/admin/Seller',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ sellerId }) => ({ type: 'AdminSeller' as const, id: sellerId })),
              { type: 'AdminSeller', id: 'LIST' },
            ]
          : [{ type: 'AdminSeller', id: 'LIST' }],
    }),

    // Look up an existing user account by mobile before promoting them to a seller.
    // Lazy: only fires when the admin clicks "Search".
    getUserByMobile: builder.query<SellerUserLookup, string>({
      query: (mobile) => `/api/admin/Seller/getUser?mobile=${encodeURIComponent(mobile)}`,
    }),

    // Promote a user (by their user id, from getUser) to a seller.
    setSeller: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/api/admin/Seller/setSeller/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: [{ type: 'AdminSeller', id: 'LIST' }],
    }),

    // Toggle stop / activate (same endpoint for both, by sellerId)
    stopAdminSeller: builder.mutation<void, number>({
      query: (sellerId) => ({
        url: `/api/admin/Seller/stopSeller/${sellerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, sellerId) => [
        { type: 'AdminSeller', id: sellerId },
        { type: 'AdminSeller', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAdminSellerListQuery,
  useLazyGetUserByMobileQuery,
  useSetSellerMutation,
  useStopAdminSellerMutation,
} = sellerApi