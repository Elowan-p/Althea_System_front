import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const getAdminProducts = (params = {}) => api.get('/admin/products', { params }).then(unwrap);
export const getAdminProduct = (id) => api.get(`/admin/products/${id}`).then(unwrap);
export const createAdminProduct = (payload) => api.post('/admin/products', payload).then(unwrap);
export const updateAdminProduct = (id, payload) => api.patch(`/admin/products/${id}`, payload).then(unwrap);
export const deleteAdminProduct = (id) => api.delete(`/admin/products/${id}`).then(unwrap);
export const bulkAdminProducts = (payload) => api.post('/admin/products/bulk', payload).then(unwrap);

export const getSalesDaily = (params = {}) => api.get('/admin/dashboard/sales/daily', { params }).then(unwrap);
export const getSalesWeekly = (params = {}) => api.get('/admin/dashboard/sales/weekly', { params }).then(unwrap);
export const getSalesWeeklyByCategory = (params = {}) => api.get('/admin/dashboard/sales/weekly-by-category', { params }).then(unwrap);
export const getSalesCategoryShare = (params = {}) => api.get('/admin/dashboard/sales/category-share', { params }).then(unwrap);
