import { api } from '@/services/api'

interface DropdownItem {
  id: number
  name: string
}

export interface Banner {
  id: number
  imageUrl: string | null
  bannerTypeId: number | null
  bannerTypeName: string | null
  bannerDisplayTargetId: number
  bannerDisplayTargetName: string
  bannerContentModeId: number
  bannerContentModeName: string
  titleEn: string | null
  descriptionEn: string | null
  titleAr: string | null
  descriptionAr: string | null
  firstColor: string | null
  secondColor: string | null
  productId: number | null
  salonId: number | null
  isAppDownloadLink: boolean
  isActive: boolean
  isDeleted: boolean
  createdDate: string
  modifiedDate: string | null
}

interface AddBannerPayload {
  bannerTypeId: number | null
  productId: number | null
  salonId: number | null
  titleEn: string | null
  descriptionEn: string | null
  titleAr: string | null
  descriptionAr: string | null
  firstColor: string | null
  bannerDisplayTargetId: number
  bannerContentModeId: number
  isAppDownloadLink: boolean
  isActive: boolean
}

export interface UpdateBannerPayload extends AddBannerPayload {
  id: number
  secondColor: string | null
}


export const bannerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBannerTypeDropdown: build.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBannerTypeDropdown',
    }),
    getBannerDisplayTargetDropdown: build.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBannerDisplayTargetDropdown',
    }),
    getBannerContentModeDropdown: build.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBannerContentModeDropdown',
    }),
    getProductDropdown: build.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductDropdown',
    }),
    getSalonDropdown: build.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSalonDropdown',
    }),
    addBanner: build.mutation<number, AddBannerPayload>({
      query: (body) => ({
        url: '/api/admin/Banner',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: build.mutation<void, UpdateBannerPayload>({
      query: (body) => ({
        url: '/api/admin/Banner',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Banner'],
    }),
    addBannerImage: build.mutation<void, { BannerId: number; BannerPicture: File }>({
      query: ({ BannerId, BannerPicture }) => {
        const formData = new FormData()
        formData.append('BannerId', String(BannerId))
        formData.append('BannerPicture', BannerPicture)

        return {
          url: '/api/admin/Banner/addBannerImage',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['Banner'],
    }),
    getBanners: build.query<Banner[], void>({
      query: () => '/api/admin/Banner',
      providesTags: ['Banner'],
    }),
    deleteBanner: build.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Banner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBannerTypeDropdownQuery,
  useGetBannerDisplayTargetDropdownQuery,
  useGetBannerContentModeDropdownQuery,
  useGetProductDropdownQuery,
  useGetSalonDropdownQuery,
  useAddBannerMutation,
  useAddBannerImageMutation,
  useGetBannersQuery,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} = bannerApi
