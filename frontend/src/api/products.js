import client from './client'

export const productsApi = {
  // Categories
  listCategories:   (params)   => client.get('/products/categories/', { params }),
  createCategory:   (data)     => client.post('/products/categories/', data),
  updateCategory:   (id, data) => client.patch(`/products/categories/${id}/`, data),
  deleteCategory:   (id)       => client.delete(`/products/categories/${id}/`),

  // Products
  list:   (params)   => client.get('/products/', { params }),
  get:    (id)       => client.get(`/products/${id}/`),
  create: (data)     => client.post('/products/', data),
  update: (id, data) => client.patch(`/products/${id}/`, data),
  delete: (id)       => client.delete(`/products/${id}/`),

  // Variants
  listVariants:   (productId)          => client.get(`/products/${productId}/variants/`),
  createVariant:  (productId, data)    => client.post(`/products/${productId}/variants/`, data),
  updateVariant:  (productId, id, data)=> client.patch(`/products/${productId}/variants/${id}/`, data),
  deleteVariant:  (productId, id)      => client.delete(`/products/${productId}/variants/${id}/`),
}
