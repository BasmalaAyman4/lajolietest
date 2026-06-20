import { api } from '@/services/api'
import type { OrderListResponse, AllowedTransition, UpdateStatusRequest } from '../types'

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET paginated orders ──────────────────────────────────────────────────
    getOrders: builder.query<
      OrderListResponse,
      { pageNo: number; pageSize: number; searchText?: string }
    >({
      query: ({ pageNo, pageSize, searchText }) => {
        const params = new URLSearchParams({
          pageNo: String(pageNo),
          pageSize: String(pageSize),
        })
        if (searchText) params.set('searchText', searchText)
        return `/api/admin/Order?${params.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    // ── GET allowed transitions for a specific order ──────────────────────────
    getAllowedTransitions: builder.query<AllowedTransition[], number>({
      query: (orderId) => `/api/admin/Order/getAllowedTransitions/${orderId}`,
      // We don't cache this for long or we can tag it with the order id
      providesTags: (_r, _e, id) => [{ type: 'Order', id: `TRANSITIONS_${id}` }],
    }),

    // ── PUT update order status ───────────────────────────────────────────────
    updateOrderStatus: builder.mutation<void, UpdateStatusRequest>({
      query: (body) => ({
        url: '/api/admin/Order',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: `TRANSITIONS_${id}` },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetOrdersQuery,
  useGetAllowedTransitionsQuery,
  useUpdateOrderStatusMutation,
} = orderApi
