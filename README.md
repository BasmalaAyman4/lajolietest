i want order page https://lajolietest.geniussystemtest.com/api/admin/Order?pageNo=1&pageSize=20
{
  "data": [
    {
      "id": 1116,
      "createdDate": "11-04-2026",
      "userName": "Zakaria Mostafa",
      "userMobile": "01097507293",
      "mainPrice": 950,
      "totalProductDiscount": null,
      "netOrderPaid": 1000,
      "status": "Delivered",
      "paymentStatus": 1,
      "paymentMethod": 2,
      "orderAddMethodType": null,
      "orderAddMethodName": "Unknown",
      "orderDetails": [
        {
          "productDetailId": 113,
          "productName": "Mary&May Tranexamic Acid+Glutathione Eye Cream",
          "color": "No Color",
          "size": "30 g",
          "productImage": "https://api.lajolie-eg.com/LajolieData/ProductFiles/76_1829987f1-5e4d-491e-b50e-90813d009ebc.webp",
          "productBundleId": null,
          "bundleName": null,
          "bundleImage": null,
          "mainPrice": 950,
          "discountPercentage": null,
          "discountValue": null,
          "netPrice": 950,
          "qty": 1,
          "productPackaging": null
        }
      ]
    },
    {
      "id": 1117,
      "createdDate": "11-05-2026",
      "userName": "Zakaria Mostafa",
      "userMobile": "01097507293",
      "mainPrice": 4950,
      "totalProductDiscount": null,
      "netOrderPaid": 5000,
      "status": "System Cancelled",
      "paymentStatus": 1,
      "paymentMethod": 2,
      "orderAddMethodType": 1,
      "orderAddMethodName": "Mobile",
      "orderDetails": [
        {
          "productDetailId": 39,
          "productName": "The Ordinary AHA 30% + BHA 2% Peeling Solution",
          "color": "No Color",
          "size": "60ml",
          "productImage": "https://api.lajolie-eg.com/LajolieData/ProductFiles/36_111dbfc72-4b1e-4a94-9288-af8c41495f4b.webp",
          "productBundleId": null,
          "bundleName": null,
          "bundleImage": null,
          "mainPrice": 750,
          "discountPercentage": null,
          "discountValue": null,
          "netPrice": 750,
          "qty": 3,
          "productPackaging": null
        },
        {
          "productDetailId": 112,
          "productName": "Madagascar Centella Hyalu-Cica Water-Fit Sun Serum 50ml",
          "color": "No Color",
          "size": "50 ml",
          "productImage": "https://api.lajolie-eg.com/LajolieData/ProductFiles/75_17a4d59ce-6257-4527-8622-c1b796975091.webp",
          "productBundleId": null,
          "bundleName": null,
          "bundleImage": null,
          "mainPrice": 1250,
          "discountPercentage": null,
          "discountValue": null,
          "netPrice": 1250,
          "qty": 1,
          "productPackaging": null
        },
        {
          "productDetailId": 111,
          "productName": "Mixsoon Bean Essence – 50ml",
          "color": "No Color",
          "size": "50 ml",
          "productImage": "https://api.lajolie-eg.com/LajolieData/ProductFiles/74_157c24f99-777a-419c-81a4-c154eb6e06b3.webp",
          "productBundleId": null,
          "bundleName": null,
          "bundleImage": null,
          "mainPrice": 1450,
          "discountPercentage": null,
          "discountValue": null,
          "netPrice": 1450,
          "qty": 1,
          "productPackaging": null
        }
      ]
    },
    {
      "id": 1118,
      "createdDate": "11-05-2026",
      "userName": "Zakaria Mostafa",
      "userMobile": "01097507293",
      "mainPrice": 3800,
      "totalProductDiscount": null,
      "netOrderPaid": 3850,
      "status": "Confirmed",
      "paymentStatus": 1,
      "paymentMethod": 2,
      "orderAddMethodType": 2,
      "orderAddMethodName": "Website",
      "orderDetails": [
        {
          "productDetailId": 106,
          "productName": "Beauty of joseon Relief Sun Rice Probiotics 50+ PA++++ 50ml",
          "color": "No Color",
          "size": "50 ml",
          "productImage": "https://api.lajolie-eg.com/LajolieData/ProductFiles/69_10c85dfeb-4439-47c9-8d34-df8014e57c39.webp",
          "productBundleId": null,
          "bundleName": null,
          "bundleImage": null,
          "mainPrice": 1150,
          "discountPercentage": null,
          "discountValue": null,
          "netPrice": 1150,
          "qty": 2,
          "productPackaging": null
        },
        {
          "productDetailId": 103,
          "productName": "anua azelaic acid 30 ml",
          "color": "No Color",
          "size": "30ml",
          "productImage": "https://api.lajolie-eg.com/LajolieData/ProductFiles/66_1d96b6c56-3927-462e-9457-e781a6e246ea.webp",
          "productBundleId": null,
          "bundleName": null,
          "bundleImage": null,
          "mainPrice": 1500,
          "discountPercentage": null,
          "discountValue": null,
          "netPrice": 1500,
          "qty": 1,
          "productPackaging": null
        }
      ]
    }
  ],
  "lastPageNo": 1,
  "totalCount": 3,
  "defaultImages": []
} , and this for change statuse https://lajolietest.geniussystemtest.com/api/admin/Order
{
  "id": 0,
  "status": 0
} , and this to get allow method use in change staqtus https://lajolietest.geniussystemtest.com/api/admin/Order/getAllowedTransitions/1118
[
  {
    "id": 2,
    "name": "Prepared"
  },
  {
    "id": 6,
    "name": "System Cancel"
  }
] , use the shared component and the same structure of project 