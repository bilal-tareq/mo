import client from './client'

export const reportsApi = {
  daily:            (params) => client.get('/reports/daily/', { params }),
  branchComparison: (params) => client.get('/reports/branch-comparison/', { params }),
  salesTrend:       (params) => client.get('/reports/sales-trend/', { params }),
  inventory:        (params) => client.get('/reports/inventory/', { params }),
  topProducts:      (params) => client.get('/reports/top-products/', { params }),
}
