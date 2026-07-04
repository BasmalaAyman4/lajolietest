import { api } from '@/services/api'
import type {
  SuggestionRoutine,
  SuggestionRoutineListItem,
  CreateSuggestionRoutineRequest,
  UpdateSuggestionRoutineRequest,
  DropdownItem,
  ProductTypeDetailGroup,
} from '../types'

// NOTE: make sure 'SuggestionRoutine' is added to the shared `api`'s tagTypes
// (services/api.ts) alongside the existing 'AdminDiscount', etc.

export const suggestionRoutineApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── CRUD ─────────────────────────────────────────────────────────────────
    getSuggestionRoutines: builder.query<SuggestionRoutineListItem[], void>({
      query: () => '/api/admin/SuggestionRoutine',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SuggestionRoutine' as const, id })),
              { type: 'SuggestionRoutine', id: 'LIST' },
            ]
          : [{ type: 'SuggestionRoutine', id: 'LIST' }],
    }),

    getSuggestionRoutine: builder.query<SuggestionRoutine, number>({
      query: (id) => `/api/admin/SuggestionRoutine/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SuggestionRoutine', id }],
    }),

    createSuggestionRoutine: builder.mutation<number, CreateSuggestionRoutineRequest>({
      query: (body) => ({
        url: '/api/admin/SuggestionRoutine',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SuggestionRoutine', id: 'LIST' }],
    }),

    // ASSUMPTION: no update endpoint was given, this mirrors the Discount
    // module's PUT pattern (same body + id). Adjust the method/url if your
    // backend exposes something different for editing a routine.
    updateSuggestionRoutine: builder.mutation<void, UpdateSuggestionRoutineRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/admin/SuggestionRoutine/${id}`,
        method: 'PUT',
        body: { id, ...body },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SuggestionRoutine', id },
        { type: 'SuggestionRoutine', id: 'LIST' },
      ],
    }),

    // ── Toggle stop/activate ─────────────────────────────────────────────────
    // ASSUMPTION: method set to PUT since the endpoint just flips a flag.
    // Change to PATCH/DELETE if the backend expects a different verb.
    toggleSuggestionRoutineStop: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/SuggestionRoutine/IsStop/${id}`,
        method: 'Delete',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SuggestionRoutine', id },
        { type: 'SuggestionRoutine', id: 'LIST' },
      ],
    }),

    // ── Images ───────────────────────────────────────────────────────────────
    addSuggestionRoutineImages: builder.mutation<
      void,
      { suggestionRoutineId: number; images: File[] }
    >({
      query: ({ suggestionRoutineId, images }) => {
        const formData = new FormData()
        formData.append('SuggestionRoutinId', String(suggestionRoutineId))
        images.forEach((file) => formData.append('SuggestionRoutinPicture', file))
        return {
          url: '/api/admin/SuggestionRoutine/addSuggestionRoutinImage',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, { suggestionRoutineId }) => [
        { type: 'SuggestionRoutine', id: suggestionRoutineId },
        { type: 'SuggestionRoutine', id: 'LIST' },
      ],
    }),

    deleteSuggestionRoutineImage: builder.mutation<
      void,
      { imageId: number; suggestionRoutineId: number }
    >({
      query: ({ imageId }) => ({
        url: `/api/admin/SuggestionRoutine/deleteSuggestionRoutinImage/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { suggestionRoutineId }) => [
        { type: 'SuggestionRoutine', id: suggestionRoutineId },
      ],
    }),

    // ── Dropdowns ────────────────────────────────────────────────────────────
    getRoutineZoneDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getRoutineZoneDropdown',
    }),

    // Endpoint path has a typo on the backend ("ge" not "get") — kept as-is.
    getRoutineTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/geRoutineTypeDropdown',
    }),

    // ── Self-contained product-type dropdowns for this feature ─────────────────
    // Named uniquely (Routine-prefixed) so they don't collide with the
    // getProductTypeDropdown / getProductTypeDetailDropdown endpoints already
    // injected by the Product feature's productApi.ts on the same shared
    // `api` instance. Both hit the same backend URLs, just registered under
    // different RTK Query endpoint keys.
    getRoutineProductTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductTypeDropdown',
    }),

    // Backend accepts multiple ids as repeated query params:
    // ?productTypeIds=1&productTypeIds=2
    getRoutineProductTypeDetailDropdown: builder.query<ProductTypeDetailGroup[], number[]>({
      query: (productTypeIds) => {
        const params = productTypeIds.map((id) => `productTypeIds=${id}`).join('&')
        return `/api/admin/BasicData/getProductTypeDetailDropdown?${params}`
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSuggestionRoutinesQuery,
  useGetSuggestionRoutineQuery,
  useLazyGetSuggestionRoutineQuery,
  useCreateSuggestionRoutineMutation,
  useUpdateSuggestionRoutineMutation,
  useToggleSuggestionRoutineStopMutation,
  useAddSuggestionRoutineImagesMutation,
  useDeleteSuggestionRoutineImageMutation,
  useGetRoutineZoneDropdownQuery,
  useGetRoutineTypeDropdownQuery,
  useGetRoutineProductTypeDropdownQuery,
  useLazyGetRoutineProductTypeDetailDropdownQuery,
} = suggestionRoutineApi