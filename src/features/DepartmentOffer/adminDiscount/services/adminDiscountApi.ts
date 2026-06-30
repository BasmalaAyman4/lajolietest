import { api } from '@/services/api'
import type {
  Discount,
  DiscountListItem,
  CreateDiscountRequest,
  UpdateDiscountRequest,
  DropdownItem,
  ProductDetailOption,
} from '../types'

export const adminDiscountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Discount CRUD ────────────────────────────────────────────────────────
    getAdminDiscounts: builder.query<DiscountListItem[], void>({
      query: () => '/api/admin/Discount',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminDiscount' as const, id })),
              { type: 'AdminDiscount', id: 'LIST' },
            ]
          : [{ type: 'AdminDiscount', id: 'LIST' }],
    }),

    getAdminDiscount: builder.query<Discount, number>({
      query: (id) => `/api/admin/Discount/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AdminDiscount', id }],
    }),

    createAdminDiscount: builder.mutation<number, CreateDiscountRequest>({
      query: (body) => ({
        url: '/api/admin/Discount',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminDiscount', id: 'LIST' }],
    }),

    updateAdminDiscount: builder.mutation<void, UpdateDiscountRequest>({
      query: (body) => ({
        url: '/api/admin/Discount',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminDiscount', id },
        { type: 'AdminDiscount', id: 'LIST' },
      ],
    }),

    // ── Toggle stop (same endpoint for stop & resume) ────────────────────────
    stopAdminDiscount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Discount/stopDiscount/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminDiscount', id },
        { type: 'AdminDiscount', id: 'LIST' },
      ],
    }),

    stopAdminDiscountDetail: builder.mutation<void, { discountId: number; detailId: number }>({
      query: ({ discountId, detailId }) => ({
        url: `/api/admin/Discount/stopProductDiscount/${discountId}/${detailId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { discountId }) => [
        { type: 'AdminDiscount', id: discountId },
        { type: 'AdminDiscount', id: 'LIST' },
      ],
    }),

    // ── Dropdowns ────────────────────────────────────────────────────────────
    getAdminDiscountTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getDiscountDropdown',
    }),

    getAdminProductDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductDropdown',
    }),

    getAdminProductDetails: builder.query<ProductDetailOption[], number>({
      query: (productId) => `/api/admin/BasicData/getProductDetails/${productId}`,
    }),

    getAdminCategoryDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getCategoryDropdown',
    }),

    getAdminSubCategoryDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSubCategoryDropdown',
    }),

    getAdminBrandDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBrandDropdown',
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAdminDiscountsQuery,
  useGetAdminDiscountQuery,
  useLazyGetAdminDiscountQuery,
  useCreateAdminDiscountMutation,
  useUpdateAdminDiscountMutation,
  useStopAdminDiscountMutation,
  useStopAdminDiscountDetailMutation,
  useGetAdminDiscountTypeDropdownQuery,
  useGetAdminProductDropdownQuery,
  useLazyGetAdminProductDetailsQuery,
  useGetAdminCategoryDropdownQuery,
  useGetAdminSubCategoryDropdownQuery,
  useGetAdminBrandDropdownQuery,
} = adminDiscountApi
