import { api } from '@/services/api'
import type {
  Voucher,
  VoucherListItem,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  DropdownItem,
  ProductDetailOption,
} from '../types'

export const voucherApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Voucher CRUD ─────────────────────────────────────────────────────────
    getVouchers: builder.query<VoucherListItem[], void>({
      query: () => '/api/admin/Voucher',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Voucher' as const, id })),
              { type: 'Voucher', id: 'LIST' },
            ]
          : [{ type: 'Voucher', id: 'LIST' }],
    }),

    getVoucher: builder.query<Voucher, number>({
      query: (id) => `/api/admin/Voucher/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Voucher', id }],
    }),

    createVoucher: builder.mutation<number, CreateVoucherRequest>({
      query: (body) => ({
        url: '/api/admin/Voucher',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Voucher', id: 'LIST' }],
    }),

    updateVoucher: builder.mutation<void, UpdateVoucherRequest>({
      query: (body) => ({
        url: '/api/admin/Voucher',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Voucher', id },
        { type: 'Voucher', id: 'LIST' },
      ],
    }),

    deleteVoucher: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Voucher?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Voucher', id },
        { type: 'Voucher', id: 'LIST' },
      ],
    }),

    // ── Stop Status Modifiers ────────────────────────────────────────────────
    stopVoucher: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Voucher/stop/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Voucher', id },
        { type: 'Voucher', id: 'LIST' },
      ],
    }),

    stopVoucherDetail: builder.mutation<void, { id: number; detailId: number }>({
      query: ({ id, detailId }) => ({
        url: `/api/admin/Voucher/stop/${id}/${detailId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Voucher', id },
        { type: 'Voucher', id: 'LIST' },
      ],
    }),

    // ── Dropdowns from BasicData ─────────────────────────────────────────────
    getUserDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/geUserDropdown',
    }),

    getVoucherTargetTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getVoucherTargetTypeDropdown',
    }),

    getProductDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductDropdown',
    }),

    getProductDetails: builder.query<ProductDetailOption[], number>({
      query: (productId) => `/api/admin/BasicData/getProductDetails/${productId}`,
    }),

    getCategoryDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getCategoryDropdown',
    }),

    getSubCategoryDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSubCategoryDropdown',
    }),

    getBrandDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBrandDropdown',
    }),

    getSalonDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSalonDropdown',
    }),

    getSalonServiceDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSalonServiceDropDowns',
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVouchersQuery,
  useGetVoucherQuery,
  useLazyGetVoucherQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useStopVoucherMutation,
  useStopVoucherDetailMutation,
  useGetUserDropdownQuery,
  useGetVoucherTargetTypeDropdownQuery,
  useGetProductDropdownQuery,
  useLazyGetProductDetailsQuery,
  useGetCategoryDropdownQuery,
  useGetSubCategoryDropdownQuery,
  useGetBrandDropdownQuery,
  useGetSalonDropdownQuery,
  useGetSalonServiceDropdownQuery,
} = voucherApi
