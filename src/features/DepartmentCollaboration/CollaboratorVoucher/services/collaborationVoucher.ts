import { api } from '@/services/api'
import type {
  CollaboratorVoucherDetail,
  CreateCollaboratorVoucherRequest,
  UpdateCollaboratorVoucherRequest,
  CollaboratorVoucherOption,
} from '../types'

export const collaboratorVoucherApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all specialists ─────────────────────────────────────────────────
    getCollaboratorVoucher: builder.query<CollaboratorVoucherDetail[], void>({
      query: () => '/api/admin/CollaboratorVoucher',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'CollaboratorVoucher' as const, id })),
              { type: 'CollaboratorVoucher', id: 'LIST' },
            ]
          : [{ type: 'CollaboratorVoucher', id: 'LIST' }],
    }),

    // ── POST create specialist → returns new specialist id ──────────────────
    createCollaboratorVoucher: builder.mutation<number, CreateCollaboratorVoucherRequest>({
      query: (body) => ({
        url: '/api/admin/CollaboratorVoucher',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CollaboratorVoucher', id: 'LIST' }],
    }),

    // ── PUT update specialist ───────────────────────────────────────────────
    updateCollaboratorVoucher: builder.mutation<void, UpdateCollaboratorVoucherRequest>({
      query: (body) => ({
        url: '/api/admin/CollaboratorVoucher',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CollaboratorVoucher', id }],
    }),

    // ── DELETE specialist by id ─────────────────────────────────────────────
    deleteCollaboratorVoucher: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/CollaboratorVoucher?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'CollaboratorVoucher', id }],
    }),



    // ── GET jobs dropdown ───────────────────────────────────────────────────
    getCollaboratorDropdown: builder.query<CollaboratorVoucherOption[], void>({
      query: () => '/api/admin/getCollaboratorsDropdown',
      providesTags: [{ type: 'Dropdown', id: 'Collaborators' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCollaboratorVoucherQuery,
  useCreateCollaboratorVoucherMutation,
  useUpdateCollaboratorVoucherMutation,
  useDeleteCollaboratorVoucherMutation,
  useGetCollaboratorDropdownQuery,
} = collaboratorVoucherApi