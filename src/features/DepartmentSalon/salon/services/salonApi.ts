// ─── Salon API ─────────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  SalonListItem,
  SalonDetail,
  CreateSalonRequest,
  UpdateSalonRequest,
} from '../types'

export const salonApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── List ──────────────────────────────────────────────────────────────────
    getSalons: builder.query<SalonListItem[], void>({
      query: () => '/api/admin/Salon',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Salon' as const, id })),
              { type: 'Salon', id: 'LIST' },
            ]
          : [{ type: 'Salon', id: 'LIST' }],
    }),

    // ── Detail ────────────────────────────────────────────────────────────────
    getSalon: builder.query<SalonDetail, number>({
      query: (id) => `/api/admin/Salon/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Salon', id }],
    }),

    // ── Create ────────────────────────────────────────────────────────────────
    createSalon: builder.mutation<number, CreateSalonRequest>({
      query: (body) => ({ url: '/api/admin/Salon', method: 'POST', body }),
      invalidatesTags: [{ type: 'Salon', id: 'LIST' }],
    }),

    // ── Update ────────────────────────────────────────────────────────────────
    updateSalon: builder.mutation<void, UpdateSalonRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/admin/Salon/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Salon', id },
        { type: 'Salon', id: 'LIST' },
      ],
    }),

    // ── Logo ──────────────────────────────────────────────────────────────────
    addSalonLogo: builder.mutation<void, { salonId: number; logo: File }>({
      query: ({ salonId, logo }) => {
        const form = new FormData()
        form.append('SalonId', String(salonId))
        form.append('Logo', logo)
        return { url: '/api/admin/Salon/addSalonLogo', method: 'POST', body: form }
      },
      invalidatesTags: (_r, _e, { salonId }) => [{ type: 'Salon', id: salonId }],
    }),

    // ── Approve / Delete images ───────────────────────────────────────────────
    approveImage: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Salon/approveImage/${id}`, method: 'PUT' }),
      invalidatesTags: [{ type: 'Salon', id: 'LIST' }], // refresh list; page refetches detail
    }),

    approveLogo: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Salon/approveLogo/${id}`, method: 'PUT' }),
    }),

    approveBanner: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Salon/approveBanner/${id}`, method: 'PUT' }),
    }),

    approveSpecialistImage: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Salon/approveSpecialistImage/${id}`, method: 'PUT' }),
    }),

    deleteSalonImage: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Salon/deleteSalonImage/${id}`, method: 'DELETE' }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSalonsQuery,
  useGetSalonQuery,
  useCreateSalonMutation,
  useUpdateSalonMutation,
  useAddSalonLogoMutation,
  useApproveImageMutation,
  useApproveLogoMutation,
  useApproveBannerMutation,
  useApproveSpecialistImageMutation,
  useDeleteSalonImageMutation,
} = salonApi