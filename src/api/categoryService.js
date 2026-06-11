import apiClient from "./client";

export const categoryService = {
    getAll: async () => apiClient.get('/products'),
    getById: async (id) => apiClient.get(`/products/${id}`),
    getByCategory: async (category) => apiClient.get(`/categories/${category}/products`),
    
}