https://lajolietest.geniussystemtest.com/api/admin/SalonServiceDiscount
[
  {
    "id": 2,
    "dateFrom": "07-02-2026",
    "toDate": "13-02-2026",
    "isStoped": true,
    "createdBySalon": true,
    "isApproved": false,
    "approvedBy": "",
    "approvedDate": ""
  },
  {
    "id": 3,
    "dateFrom": "07-02-2026",
    "toDate": "09-02-2026",
    "isStoped": false,
    "createdBySalon": true,
    "isApproved": false,
    "approvedBy": "",
    "approvedDate": ""
  },
  {
    "id": 4,
    "dateFrom": "08-02-2026",
    "toDate": "08-02-2026",
    "isStoped": false,
    "createdBySalon": true,
    "isApproved": false,
    "approvedBy": "",
    "approvedDate": ""
  },
  {
    "id": 7,
    "dateFrom": "28-04-2026",
    "toDate": "30-04-2026",
    "isStoped": false,
    "createdBySalon": true,
    "isApproved": false,
    "approvedBy": "",
    "approvedDate": ""
  }
] , https://lajolietest.geniussystemtest.com/api/admin/SalonServiceDiscount/7
{
  "id": 7,
  "dateFrom": "2026-04-28T00:00:00",
  "toDate": "2026-04-30T00:00:00",
  "isStoped": false,
  "createdBySalon": true,
  "salonId": 12,
  "isApproved": false,
  "approvedBy": "",
  "approvedDate": "2026-05-12T23:05:33.5812787+03:00",
  "details": [
    {
      "detailId": 6,
      "salonServiceId": 28,
      "name": "NAILS",
      "discountValue": 40,
      "isStoped": true
    },
    {
      "detailId": 7,
      "salonServiceId": 27,
      "name": "hair",
      "discountValue": 20,
      "isStoped": false
    }
  ]
} , this is for post {
  "dateFrom": "2026-05-12T20:05:39.982Z",
  "toDate": "2026-05-12T20:05:39.982Z",
  "salonId": 0,
  "details": [
    {
      "salonServiceId": 0,
      "discountValue": 0
    }
  ]
} , and this for approve https://lajolietest.geniussystemtest.com/api/admin/SalonServiceDiscount/approveDiscount/0
, and this for delete discount https://lajolietest.geniussystemtest.com/api/admin/SalonServiceDiscount/stopDiscount/0
 , and this for delete detail in discount https://lajolietest.geniussystemtest.com/api/admin/SalonServiceDiscount/stopDetails/0
 , and this for dropdown https://lajolietest.geniussystemtest.com/api/admin/BasicData/getSalonServiceDropDowns
 