import client from './client'

export const inventoryApi = {
  listStock:      (params)   => client.get('/inventory/stock/', { params }),
  listMovements:  (params)   => client.get('/inventory/movements/', { params }),
  createMovement: (data)     => client.post('/inventory/movements/', data),
  listTransfers:  (params)   => client.get('/inventory/transfers/', { params }),
  createTransfer: (data)     => client.post('/inventory/transfers/', data),
  updateTransfer: (id, data) => client.patch(`/inventory/transfers/${id}/`, data),
}
