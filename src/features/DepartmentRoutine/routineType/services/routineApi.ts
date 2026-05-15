
import { api } from '@/services/api'
import type { RoutineType, CreateRoutineTypeRequest, UpdateRoutineTypeRequest } from '../types'

export const routineTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoutineTypes: builder.query<RoutineType[], void>({
      query: () => '/api/admin/RoutinType',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'RoutinType' as const, id })), { type: 'RoutinType', id: 'LIST' }]
          : [{ type: 'RoutinType', id: 'LIST' }],
    }),
    createRoutineType: builder.mutation<number, CreateRoutineTypeRequest>({
      query: (body) => ({ url: '/api/admin/RoutinType', method: 'POST', body }),
      invalidatesTags: [{ type: 'RoutinType', id: 'LIST' }],
    }),
    updateRoutineType: builder.mutation<void, UpdateRoutineTypeRequest>({
      query: (body) => ({ url: '/api/admin/RoutinType', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RoutinType', id }],
    }),
    deleteRoutineType: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/RoutinType?id=${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'RoutinType', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRoutineTypesQuery,
  useCreateRoutineTypeMutation,
  useUpdateRoutineTypeMutation,
  useDeleteRoutineTypeMutation,
} = routineTypeApi