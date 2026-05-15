// ─── Goal API ─────────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Goal, CreateGoalRequest, UpdateGoalRequest } from '../types'

// Shape returned by /api/admin/BasicData/getBeautyCategoryDropdown
export interface BeautyCategoryDropdownItem {
  id: number
  name: string
}

export const goalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all goals ───────────────────────────────────────────────────────
    getGoals: builder.query<Goal[], void>({
      query: () => '/api/admin/Goal',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Goal' as const, id })), { type: 'Goal', id: 'LIST' }]
          : [{ type: 'Goal', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createGoal: builder.mutation<number, CreateGoalRequest>({
      query: (body) => ({ url: '/api/admin/Goal', method: 'POST', body }),
      invalidatesTags: [{ type: 'Goal', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateGoal: builder.mutation<void, UpdateGoalRequest>({
      query: (body) => ({ url: '/api/admin/Goal', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Goal', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteGoal: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Goal/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Goal', id }],
    }),

    // ── POST upload goal image ──────────────────────────────────────────────
    uploadGoalImage: builder.mutation<void, { goalId: number; file: File }>({
      query: ({ goalId, file }) => {
        const body = new FormData()
        body.append('GoalId', String(goalId))
        body.append('Picture', file)
        return { url: '/api/admin/Goal/addGoalImages', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { goalId }) => [{ type: 'Goal', id: goalId }],
    }),

    // ── GET beauty category dropdown ────────────────────────────────────────
    getBeautyCategoryDropdown: builder.query<BeautyCategoryDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBeautyCategoryDropdown',
      providesTags: [{ type: 'BeautyCategory', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useUploadGoalImageMutation,
  useGetBeautyCategoryDropdownQuery,
} = goalApi