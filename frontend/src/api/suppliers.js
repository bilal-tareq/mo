import client from './client'

export const suppliersApi = {
  list:          (params)   => client.get('/suppliers/', { params }),
  get:           (id)       => client.get(`/suppliers/${id}/`),
  create:        (data)     => client.post('/suppliers/', data),
  update:        (id, data) => client.patch(`/suppliers/${id}/`, data),
  delete:        (id)       => client.delete(`/suppliers/${id}/`),
  listOrders:    (params)   => client.get('/suppliers/orders/', { params }),
  getOrder:      (id)       => client.get(`/suppliers/orders/${id}/`),
  createOrder:   (data)     => client.post('/suppliers/orders/', data),
  updateOrder:   (id, data) => client.patch(`/suppliers/orders/${id}/`, data),
}
