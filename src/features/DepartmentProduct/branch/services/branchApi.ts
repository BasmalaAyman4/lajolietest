// ─── Branch API ───────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Branch, CreateBranchRequest, UpdateBranchRequest } from '../types'

export const branchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all branches ────────────────────────────────────────────────────
    getBranches: builder.query<Branch[], void>({
      query: () => '/api/admin/Branch',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Branch' as const, id })),
              { type: 'Branch', id: 'LIST' },
            ]
          : [{ type: 'Branch', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createBranch: builder.mutation<number, CreateBranchRequest>({
      query: (body) => ({ url: '/api/admin/Branch', method: 'POST', body }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateBranch: builder.mutation<void, UpdateBranchRequest>({
      query: (body) => ({ url: '/api/admin/Branch', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Branch', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteBranch: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Branch/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Branch', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi
