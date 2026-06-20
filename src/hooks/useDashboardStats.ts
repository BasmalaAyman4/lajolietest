import { useMemo } from 'react'
import { useGetProductsQuery } from '@/features/DepartmentProduct/product/services/productApi'
import { useGetOrdersQuery } from '@/features/orders/services/orderApi'
import { useGetSalonsQuery, useGetPendingPhotoApprovalsQuery } from '@/features/DepartmentSalon/salon/services/salonApi'
import { useGetPurchasesQuery } from '@/features/DepartmentProduct/purchase/services/purchaseApi'

export function useDashboardStats() {
  const {
    data: productsFirstPage,
    isLoading: productsLoading,
  } = useGetProductsQuery({ pageNo: 1, pageSize: 1 })

  const lastProductPage = productsFirstPage?.lastPageNo ?? 1

  const {
    data: productsLastPage,
    isLoading: productsLastLoading,
  } = useGetProductsQuery(
    { pageNo: lastProductPage, pageSize: 1 },
    { skip: lastProductPage <= 1 },
  )

  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery({
    pageNo: 1,
    pageSize: 100,
  })

  const { data: salons = [], isLoading: salonsLoading } = useGetSalonsQuery()

  const { data: pendingData, isLoading: pendingLoading } = useGetPendingPhotoApprovalsQuery({
    pageNo: 1,
    pageSize: 100,
  })

  const { data: purchases = [], isLoading: purchasesLoading } = useGetPurchasesQuery()

  const productCount = useMemo(() => {
    if (!productsFirstPage) return null
    if (lastProductPage <= 1) return productsFirstPage.products.length
    return (lastProductPage - 1) + (productsLastPage?.products.length ?? 0)
  }, [productsFirstPage, lastProductPage, productsLastPage])

  const verifiedSalons = useMemo(
    () => salons.filter((s) => s.isVerify).length,
    [salons],
  )

  const isLoading =
    productsLoading ||
    (lastProductPage > 1 && productsLastLoading) ||
    ordersLoading ||
    salonsLoading ||
    pendingLoading ||
    purchasesLoading

  const allOrders = ordersData?.data ?? []
  const recentOrders = allOrders.slice(0, 5)

  return {
    isLoading,
    productCount,
    orderCount: ordersData?.totalCount ?? 0,
    allOrders,
    recentOrders,
    salons,
    salonCount: salons.length,
    verifiedSalons,
    pendingCount: pendingData?.totalCount ?? 0,
    pendingItems: pendingData?.data ?? [],
    purchaseCount: purchases.length,
  }
}
