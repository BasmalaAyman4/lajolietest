// ─── Interest API ─────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  Interest,
  CreateInterestRequest,
  UpdateInterestRequest,
} from '../types'

export const interestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all interests ───────────────────────────────────────────────────
    getInterests: builder.query<Interest[], void>({
      query: () => '/api/admin/Interest',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Interest' as const, id })),
              { type: 'Interest', id: 'LIST' },
            ]
          : [{ type: 'Interest', id: 'LIST' }],
    }),

    // ── POST create interest → returns new id ───────────────────────────────
    createInterest: builder.mutation<number, CreateInterestRequest>({
      query: (body) => ({
        url: '/api/admin/Interest',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Interest', id: 'LIST' }],
    }),

    // ── PUT update interest ─────────────────────────────────────────────────
    updateInterest: builder.mutation<void, UpdateInterestRequest>({
      query: (body) => ({
        url: '/api/admin/Interest',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Interest', id }],
    }),

    // ── DELETE interest by id ───────────────────────────────────────────────
    deleteInterest: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Interest/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Interest', id }],
    }),

    // ── POST upload interest image ──────────────────────────────────────────
    uploadInterestImage: builder.mutation<void, { interestId: number; file: File }>({
      query: ({ interestId, file }) => {
        const body = new FormData()
        body.append('InterestId', String(interestId))
        body.append('Picture', file)
        return {
          url: '/api/admin/Interest/addInterestImages',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (_result, _error, { interestId }) => [
        { type: 'Interest', id: interestId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetInterestsQuery,
  useCreateInterestMutation,
  useUpdateInterestMutation,
  useDeleteInterestMutation,
  useUploadInterestImageMutation,
} = interestApi
