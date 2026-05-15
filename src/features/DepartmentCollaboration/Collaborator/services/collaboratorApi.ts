import { api } from '@/services/api'
import type {
  Collaborator,
  CreateCollaboratorRequest,
} from '../types'

export const collaboratorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all specialists ─────────────────────────────────────────────────
    getCollaborator: builder.query<Collaborator[], void>({
      query: () => '/api/admin/Collaborator',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Collaborator' as const, id })),
              { type: 'Collaborator', id: 'LIST' },
            ]
          : [{ type: 'Collaborator', id: 'LIST' }],
    }),

    // ── POST create specialist → returns new specialist id ──────────────────
    createCollaborator: builder.mutation<number, CreateCollaboratorRequest>({
      query: (body) => ({
        url: '/api/admin/Collaborator',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Collaborator', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetCollaboratorQuery,
  useCreateCollaboratorMutation,
} = collaboratorApi