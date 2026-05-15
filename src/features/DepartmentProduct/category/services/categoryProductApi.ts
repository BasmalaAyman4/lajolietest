
import { api } from '@/services/api'
import type {
  CategoryProduct,
  CreateCategoryProductRequest,
  UpdateCategoryProductRequest,
} from '../types'

export const categoryProductApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all specialists ─────────────────────────────────────────────────
    getCategoryProducts: builder.query<CategoryProduct[], void>({
      query: () => '/api/admin/Category',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'CategoryProduct' as const, id })),
              { type: 'CategoryProduct', id: 'LIST' },
            ]
          : [{ type: 'CategoryProduct', id: 'LIST' }],
    }),

    // ── POST create specialist → returns new specialist id ──────────────────
    createCategoryProduct: builder.mutation<number, CreateCategoryProductRequest>({
      query: (body) => ({
        url: '/api/admin/Category',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CategoryProduct', id: 'LIST' }],
    }),

    // ── PUT update specialist ───────────────────────────────────────────────
    updateCategoryProduct: builder.mutation<void, UpdateCategoryProductRequest>({
      query: (body) => ({
        url: '/api/admin/Category',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CategoryProduct', id }],
    }),

    // ── DELETE specialist by id ─────────────────────────────────────────────
    deleteCategoryProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'CategoryProduct', id }],
    }),

    // ── POST upload specialist image ────────────────────────────────────────
    uploadCategoryImage: builder.mutation<void, { categoryId: number; file: File }>({
      query: ({ categoryId, file }) => {
        const body = new FormData()
        body.append('CategoryId', String(categoryId))
        body.append('CategoryPicture', file)
        return {
          url: '/api/admin/Category/addCategoryImages',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (_result, _error, { categoryId }) => [
        { type: 'CategoryProduct', id: categoryId },
      ],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetCategoryProductsQuery,
  useCreateCategoryProductMutation,
  useUpdateCategoryProductMutation,
  useDeleteCategoryProductMutation,
  useUploadCategoryImageMutation,
} = categoryProductApi