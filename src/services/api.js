import axios from 'axios';

// API documentation refers to Althea Systems internal services
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for handling tokens (authentication)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Home Service
export const getHomeData = () => api.get('/home');

// Category/Products Service
export const getCategoryProducts = (categoryId, params) => api.get(`/categories/${categoryId}/products`, { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getSimilarProducts = (id) => api.get(`/products/${id}/similar`);
export const searchProducts = (filters) => api.post('/search', filters);

// Cart & Order Service
export const syncCart = (cartItems) => api.post('/cart', { items: cartItems });
export const submitCheckout = (orderData) => api.post('/checkout', orderData);
export const getOrders = (year) => api.get('/user/orders', { params: { year } });

// Auth Service
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const resetPassword = (email) => api.post('/auth/reset-password', { email });

// User Profile CRUD
export const updateProfile = (data) => api.put('/user/profile', data);
export const getAddresses = () => api.get('/user/addresses');
export const createAddress = (data) => api.post('/user/addresses', data);
export const updateAddress = (id, data) => api.put(`/user/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/user/addresses/${id}`);

export const getPaymentMethods = () => api.get('/user/payments');
export const createPaymentMethod = (data) => api.post('/user/payments', data);
export const deletePaymentMethod = (id) => api.delete(`/user/payments/${id}`);

// Messaging Service
export const sendMessage = (data) => api.post('/contact', data);

export default api;
