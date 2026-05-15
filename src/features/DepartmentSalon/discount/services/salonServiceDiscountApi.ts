// ─── SalonServiceDiscount API ─────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  SalonServiceDiscount,
  SalonServiceDiscountFull,
  CreateDiscountRequest,
  SalonServiceDropdownItem,
} from '../types'

export const salonServiceDiscountApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET all discounts ───────────────────────────────────────────────────
    getDiscounts: builder.query<SalonServiceDiscount[], void>({
      query: () => '/api/admin/SalonServiceDiscount',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SalonServiceDiscount' as const, id })),
              { type: 'SalonServiceDiscount', id: 'LIST' },
            ]
          : [{ type: 'SalonServiceDiscount', id: 'LIST' }],
    }),

    // ── GET single discount with full details ───────────────────────────────
    getDiscount: builder.query<SalonServiceDiscountFull, number>({
      query: (id) => `/api/admin/SalonServiceDiscount/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'SalonServiceDiscount', id }],
    }),

    // ── POST create discount ────────────────────────────────────────────────
    createDiscount: builder.mutation<void, CreateDiscountRequest>({
      query: (body) => ({ url: '/api/admin/SalonServiceDiscount', method: 'POST', body }),
      invalidatesTags: [{ type: 'SalonServiceDiscount', id: 'LIST' }],
    }),

    // ── PUT approve discount ────────────────────────────────────────────────
    approveDiscount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/SalonServiceDiscount/approveDiscount/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'SalonServiceDiscount', id },
        { type: 'SalonServiceDiscount', id: 'LIST' },
      ],
    }),

    // ── DELETE (stop) entire discount ───────────────────────────────────────
    stopDiscount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/SalonServiceDiscount/stopDiscount/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'SalonServiceDiscount', id },
        { type: 'SalonServiceDiscount', id: 'LIST' },
      ],
    }),

    // ── DELETE (stop) a single detail row ───────────────────────────────────
    stopDiscountDetail: builder.mutation<void, { discountId: number; detailId: number }>({
      query: ({ detailId }) => ({
        url: `/api/admin/SalonServiceDiscount/stopDetails/${detailId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { discountId }) => [
        { type: 'SalonServiceDiscount', id: discountId },
      ],
    }),

    // ── GET salon service dropdown ──────────────────────────────────────────
    getSalonServiceDropdown: builder.query<SalonServiceDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSalonServiceDropDowns',
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetDiscountsQuery,
  useGetDiscountQuery,
  useCreateDiscountMutation,
  useApproveDiscountMutation,
  useStopDiscountMutation,
  useStopDiscountDetailMutation,
  useGetSalonServiceDropdownQuery,
} = salonServiceDiscountApi
