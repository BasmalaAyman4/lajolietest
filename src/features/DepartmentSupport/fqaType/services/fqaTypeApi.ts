
import { api } from '@/services/api'
import type {
  FqaType,
  CreateFqaTypeRequest,
  UpdateFqaTypeRequest,
} from '../types'

export const fqaTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all specialists ─────────────────────────────────────────────────
    getFqaTypes: builder.query<FqaType[], void>({
      query: () => '/api/admin/FqaType',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'FqaType' as const, id })),
              { type: 'FqaType', id: 'LIST' },
            ]
          : [{ type: 'FqaType', id: 'LIST' }],
    }),

    // ── POST create specialist → returns new specialist id ──────────────────
    createFqaType: builder.mutation<number, CreateFqaTypeRequest>({
      query: (body) => ({
        url: '/api/admin/FqaType',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'FqaType', id: 'LIST' }],
    }),

    // ── PUT update specialist ───────────────────────────────────────────────
    updateFqaType: builder.mutation<void, UpdateFqaTypeRequest>({
      query: (body) => ({
        url: '/api/admin/FqaType',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'FqaType', id }],
    }),

    // ── DELETE specialist by id ─────────────────────────────────────────────
    deleteFqaType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/FqaType?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'FqaType', id }],
    }),

    // ── POST upload specialist image ────────────────────────────────────────
    uploadFqaTypeImage: builder.mutation<void, { fqaTypeId: number; file: File }>({
      query: ({ fqaTypeId, file }) => {
        const body = new FormData()
        body.append('TypeId', String(fqaTypeId))
        body.append('TypePicture', file)
        return {
          url: '/api/admin/FqaType/addFQATypeImages',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (_result, _error, { fqaTypeId }) => [
        { type: 'FqaType', id: fqaTypeId },
      ],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetFqaTypesQuery,
  useCreateFqaTypeMutation,
  useUpdateFqaTypeMutation,
  useDeleteFqaTypeMutation,
  useUploadFqaTypeImageMutation,
} = fqaTypeApi