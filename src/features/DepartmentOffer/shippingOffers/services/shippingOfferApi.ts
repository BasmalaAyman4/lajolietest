import { api } from '@/services/api'
import type {
  ShippingOffer,
  ShippingOfferListResponse,
  CreateShippingOfferRequest,
  UpdateShippingOfferRequest,
} from '../types'

export const shippingOfferApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getShippingOffers: builder.query<ShippingOfferListResponse, { pageNo: number; pageSize: number }>({
      query: ({ pageNo, pageSize }) => `/api/admin/ShippingOffer?pageNo=${pageNo}&pageSize=${pageSize}`,
      providesTags: (result) =>
        result?.shippingOffers
          ? [
              ...result.shippingOffers.map(({ id }) => ({ type: 'ShippingOffer' as const, id })),
              { type: 'ShippingOffer', id: 'LIST' },
            ]
          : [{ type: 'ShippingOffer', id: 'LIST' }],
    }),

    createShippingOffer: builder.mutation<void, CreateShippingOfferRequest>({
      query: (body) => ({
        url: '/api/admin/ShippingOffer',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ShippingOffer', id: 'LIST' }],
    }),

    updateShippingOffer: builder.mutation<void, UpdateShippingOfferRequest>({
      query: (body) => ({
        url: '/api/admin/ShippingOffer',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ShippingOffer', id },
        { type: 'ShippingOffer', id: 'LIST' },
      ],
    }),

    stopShippingOffer: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/ShippingOffer?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ShippingOffer', id },
        { type: 'ShippingOffer', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetShippingOffersQuery,
  useCreateShippingOfferMutation,
  useUpdateShippingOfferMutation,
  useStopShippingOfferMutation,
} = shippingOfferApi
