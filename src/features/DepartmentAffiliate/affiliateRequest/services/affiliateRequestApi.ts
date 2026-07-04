import { api } from '@/services/api'
import type { AffiliateRequestItem } from '../types'

export const affiliateRequestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAffiliateRequests: builder.query<AffiliateRequestItem[], void>({
      query: () => '/api/admin/AffiliateRequest',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminAffiliateRequest' as const, id })),
              { type: 'AdminAffiliateRequest', id: 'LIST' },
            ]
          : [{ type: 'AdminAffiliateRequest', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const { useGetAdminAffiliateRequestsQuery } = affiliateRequestApi