

import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppStore'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import CategoryProductPage from '@/features/DepartmentProduct/category/pages/CategoryPage'
import SubCategoryPage from '@/features/DepartmentProduct/subCategory/pages/SubCategoryPage'
import ProductPage from '@/features/DepartmentProduct/product/pages/ProductPage'
import ProductDetailPage from '@/features/DepartmentProduct/product/pages/ProductDetailsPage'
import ProductTypePage from '@/features/DepartmentProduct/productType/pages/ProductTypePage'
import PackagingPage from '@/features/DepartmentProduct/packaging/pages/PackagingPage'
import InterestPage from '@/features/DepartmentProduct/interest/pages/InterestPage'
import BranchPage from '@/features/DepartmentProduct/branch/pages/BranchPage'
import BrandPage from '@/features/DepartmentProduct/brand/pages/BrandPage'
import BeautyCategoryPage from '@/features/DepartmentProduct/beautyCategory/pages/BeautyCategoryPage'
import StorePage from '@/features/DepartmentProduct/store/pages/StorePage'
import SizesPage from '@/features/DepartmentProduct/size/pages/SizePage'
import HeadcolorPage from '@/features/DepartmentProduct/headColor/pages/HeadColorPage'
import VendorPage from '@/features/DepartmentProduct/vendor/pages/VendorPage'
import ConcernPage from '@/features/DepartmentProduct/concern/pages/ConcernPage'
import GoalPage from '@/features/DepartmentProduct/goals/pages/GoalPage'
import BarcodeTypePage from '@/features/DepartmentProduct/barcodeType/pages/BarcodeTypePage'
import ProductTypeDetailPage from '@/features/DepartmentProduct/productTypeDetail/pages/ProductTypeDetailPage'
import ProductBundlePage from '@/features/DepartmentProduct/bundle/pages/ProductBundlePage'
import BundleDetailsPage from '@/features/DepartmentProduct/bundle/pages/BundleDetailsPage'
import PurchasePage from '@/features/DepartmentProduct/purchase/pages/PurchasePage'
import PurchaseDetailsPage from '@/features/DepartmentProduct/purchase/pages/PurchaseDetailsPage'
import RoutineTypePage from '@/features/DepartmentRoutine/routineType/pages/RoutineTypePage'
import ReportPage from '@/features/DepartmentSupport/reportIssues/pages/ReportPage'
import CountryPage from '@/features/DepartmentLocation/country/pages/CountryPage'
import CityPage from '@/features/DepartmentLocation/city/pages/CityPage'
import AreaPage from '@/features/DepartmentLocation/area/pages/AreaPage'
import CollaboratorPage from '@/features/DepartmentCollaboration/Collaborator/pages/CollaboratorPage'
import CollaborationVoucherPage from '@/features/DepartmentCollaboration/CollaboratorVoucher/pages/CollaborationVoucherPage.tsx'
import VoucherPage from '@/features/DepartmentOffer/voucher/pages/VoucherPage'
import SalonsPage from '@/features/DepartmentSalon/salon/pages/SalonsPage'
import SalonDetailPage from '@/features/DepartmentSalon/salon/pages/SalonDetailPage'
import ServiceCategoryPage from '@/features/DepartmentSalon/serviceCategory/pages/ServiceCategoryPage'
import ServiceTypePage from '@/features/DepartmentSalon/serviceType/pages/ServiceTypePage'
import ServiceCodePage from '@/features/DepartmentSalon/serviceCode/pages/ServiceCodePage'
import SpecialistJobPage from '@/features/DepartmentSalon/specialistJob/pages/SpecialistJobPage'
import SalonServiceDiscountPage from '@/features/DepartmentSalon/discount/pages/SalonServiceDiscountPage'
import DiscountDetailsPage from '@/features/DepartmentSalon/discount/pages/DiscountDetailsPage'
import HowToUse from '@/features/DepartmentSupport/howToUse/pages/HowToUsePage'
import DefaultImagePage from '@/features/DepartmentSupport/defaultImage/pages/DefaultImagePage'
import ReelCategoryPage from '@/features/DepartmentReel/reelCategory/pages/ReelCategoryPage'
import ReelPage from '@/features/DepartmentReel/reel/pages/ReelPage'
import TermsTypePage from '@/features/DepartmentSupport/termsType/pages/TermsTypePage'
import TermsAndConditionsPage from '@/features/DepartmentSupport/termsAndCondition/pages/TermsAndConditionsPage'
import SendSmsPage from '@/features/DepartmentSalon/sendSms/pages/SendSmsPage'
import OrderPage from '@/features/orders/pages/OrderPage'
import StartupMediaPage from '@/features/DepartmentSupport/startupMedia/pages/StartupMediaPage'
import PendingPhotoApprovalsPage from '@/features/DepartmentSalon/salon/pages/PendingPhotoApprovalsPage'
import BannerPage from '@/features/Banner/pages/BannerPage'
import BannerListPage from '@/features/Banner/pages/BannerListPage'
import ContactUsPage from '@/features/DepartmentSupport/contactUs/pages/ContactUsPage'
import FqaTypePage from '@/features/DepartmentSupport/fqaType/pages/FqaTypePage'
import AdminDiscountPage from '@/features/DepartmentOffer/adminDiscount/pages/AdminDiscountPage'
import ShippingOfferPage from '@/features/DepartmentOffer/shippingOffers/pages/ShippingOfferPage'
import PointOptionsPage from '@/features/DepartmentOffer/pointOptions/pages/PointOptionsPage'
import ChairTypePage from '@/features/DepartmentSalon/chairType/page/ChairTypePage'
import SuggestionRoutinePage from '@/features/DepartmentRoutine/SuggestionRoutine/pages/SuggestionRoutinePage'
import AppOptionPage from '@/features/appOption/pages/AppOptionPage'
import AffiliatePage from '@/features/DepartmentAffiliate/affiliate/pages/AffiliatePage'
import AffiliateRequestPage from '@/features/DepartmentAffiliate/affiliateRequest/pages/AffiliateReqPage'
import SellerPage from '@/features/DepartmentAffiliate/seller/pages/SellerPage'
// ── Guards ─────────────────────────────────────────────────────────────────────

function PrivateRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}

// ── Router ─────────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // Public routes (login, otp)
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },

  // Protected routes (dashboard)
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'category', element: <CategoryProductPage /> },
          { path: 'subCategory', element: <SubCategoryPage /> },
          { path: 'products', element: <ProductPage /> },
          { path: 'products/:id', element: <ProductDetailPage /> },
          { path: 'productType', element: <ProductTypePage /> },
          { path: "interest", element: <InterestPage /> },
          { path: "packaging", element: <PackagingPage /> },
          { path: "branch", element: <BranchPage /> },
          { path: "brand", element: <BrandPage /> },
          { path: "beautyCategory", element: <BeautyCategoryPage /> },
          { path: "store", element: <StorePage /> },
          { path: "sizes", element: <SizesPage /> },
          { path: "headcolor", element: <HeadcolorPage /> },
          { path: "vendor", element: <VendorPage /> },
          { path: "concern", element: <ConcernPage /> },
          { path: "goal", element: <GoalPage /> },
          { path: "barcodeType", element: <BarcodeTypePage /> },
          { path: "productTypeDetail", element: <ProductTypeDetailPage /> },
          { path: "product-bundles", element: <ProductBundlePage /> },
          { path: "product-bundles/:id", element: <BundleDetailsPage /> },
          { path: "purchases", element: <PurchasePage /> },
          { path: "purchases/:id", element: <PurchaseDetailsPage /> },
          { path: "routine-types", element: <RoutineTypePage /> },
          { path: "report-issues", element: <ReportPage /> },
          { path: "country", element: <CountryPage /> },
          { path: "city", element: <CityPage /> },
          { path: "area", element: <AreaPage /> },
          { path: "collaborator", element: <CollaboratorPage /> },
          { path: "collaboration-vouchers", element: <CollaborationVoucherPage /> },
          { path: "voucher", element: <VoucherPage /> },
          { path: "salons", element: <SalonsPage /> },
          { path: "salon-detail/:id", element: <SalonDetailPage /> },
          { path: "service-category", element: <ServiceCategoryPage /> },
          { path: "service-type", element: <ServiceTypePage /> },
          { path: "service-code", element: <ServiceCodePage /> },
          { path: "specialistJob", element: <SpecialistJobPage /> },
          { path: "salon-discounts", element: <SalonServiceDiscountPage /> },
          { path: "salon-discounts/:id", element: <DiscountDetailsPage /> },
          { path: "how-to-use", element: <HowToUse /> },
          { path: "default-image", element: <DefaultImagePage /> },
          { path: "reel-categories", element: <ReelCategoryPage /> },
          { path: "reels", element: <ReelPage /> },
          { path: "terms-types", element: <TermsTypePage /> },
          { path: "terms-and-conditions", element: <TermsAndConditionsPage /> },
          { path: "send-sms", element: <SendSmsPage /> },
          { path: "orders", element: <OrderPage /> },
          {path:"startup-media",element:<StartupMediaPage/>},
          {path:"pending-phaoto",element:<PendingPhotoApprovalsPage/>},
          {path:"banner",element:<BannerListPage/>},
          {path:"banner/create",element:<BannerPage/>},
          {path:"banner/edit/:id",element:<BannerPage/>},
          {path:"contact-us",element:<ContactUsPage/>},
          { path: 'fqa-types', element: <FqaTypePage /> },
          {path:"discount",element:<AdminDiscountPage/>},
          { path: "shipping-offer", element: <ShippingOfferPage /> },
          { path: "point-options", element: <PointOptionsPage /> },
          {path:"chair-type",element:<ChairTypePage/>},
          {path:"suggestion-routine",element:<SuggestionRoutinePage/>},
          {path:"app-options",element:<AppOptionPage/>},
          { path: 'affiliates', element: <AffiliatePage /> },
          { path: 'affiliate-request', element: <AffiliateRequestPage /> },
          { path: 'sellers', element: <SellerPage /> },

        ],
      },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
