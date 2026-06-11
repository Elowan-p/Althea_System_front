import axios from 'axios';
import i18n from 'i18next';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const CACHE_TTL = 5 * 60 * 1000;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const locale = (i18n.language || 'fr').split('-')[0].toLowerCase();
  if (!config.params) config.params = {};
  if (!config.params.locale) {
    config.params.locale = locale;
  }

  return config;
}, (error) => Promise.reject(error));

const responseFromData = (data) => ({ data });

const normalizeSearchValue = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const cacheStore = new Map();

i18n.on('languageChanged', () => {
  cacheStore.clear();
});

const getCachedEntry = (key) => {
  const entry = cacheStore.get(key);

  if (!entry) return null;

  if (entry.data && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry;
  }

  if (entry.promise) return entry;

  cacheStore.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cacheStore.set(key, { data, timestamp: Date.now() });
};

const seedProductCache = (product) => {
  if (product?.id) setCachedData(`product:${product.id}`, product);
};

const seedCategoryCache = (category) => {
  if (category?.id) setCachedData(`category:${category.id}`, category);
};

const seedProductsIntoEntityCache = (products) => {
  if (Array.isArray(products)) products.forEach(seedProductCache);
};

const seedFullProductsCache = (products) => {
  if (Array.isArray(products)) {
    seedProductsIntoEntityCache(products);
    setCachedData('products', products);
  }
};

const seedCategoriesCache = (categories) => {
  if (Array.isArray(categories)) {
    categories.forEach(seedCategoryCache);
    setCachedData('categories', categories);
  }
};

const cachedGet = async (key, fetcher, { onSuccess } = {}) => {
  const cachedEntry = getCachedEntry(key);

  if (cachedEntry?.data) return responseFromData(cachedEntry.data);
  if (cachedEntry?.promise) return cachedEntry.promise;

  const requestPromise = fetcher()
    .then((response) => {
      cacheStore.set(key, { data: response.data, timestamp: Date.now() });
      if (onSuccess) onSuccess(response.data);
      return responseFromData(response.data);
    })
    .catch((error) => {
      cacheStore.delete(key);
      throw error;
    });

  cacheStore.set(key, { promise: requestPromise });
  return requestPromise;
};

export const getHomeData = () => cachedGet(
  'home',
  () => api.get('/home'),
  {
    onSuccess: (data) => {
      seedCategoriesCache(data?.categories);
      seedProductsIntoEntityCache(data?.topProducts);
    },
  }
);

export const getCategories = () => cachedGet(
  'categories',
  () => api.get('/categories'),
  {
    onSuccess: (data) => {
      seedCategoriesCache(data);
      data?.forEach((category) => seedProductsIntoEntityCache(category?.products));
    },
  }
);

export const getCategory = (id) => cachedGet(
  `category:${id}`,
  () => api.get(`/categories/${id}`),
  {
    onSuccess: (data) => {
      seedCategoryCache(data);
      seedProductsIntoEntityCache(data?.products);
    },
  }
);

export const getCategoryProducts = (categoryId, params) => cachedGet(
  `category-products:${categoryId}`,
  () => api.get(`/categories/${categoryId}/products`, { params }),
  { onSuccess: (data) => seedProductsIntoEntityCache(data) }
);

export const getProducts = () => cachedGet(
  'products',
  () => api.get('/products'),
  { onSuccess: (data) => seedFullProductsCache(data) }
);

export const getProduct = (id) => cachedGet(
  `product:${id}`,
  () => api.get(`/products/${id}`),
  { onSuccess: (data) => seedProductCache(data) }
);

export const getSimilarProducts = (id) => cachedGet(
  `product-similar:${id}`,
  () => api.get(`/products/${id}/similar`),
  { onSuccess: (data) => seedProductsIntoEntityCache(data) }
);

export const searchProducts = async (query) => {
  const normalizedQuery = normalizeSearchValue(query);
  if (normalizedQuery.length < 2) return responseFromData([]);

  const response = await api.get('/products/search', { params: { q: query.trim() } });
  return responseFromData(response.data);
};

export const register = (data) => api.post('/auth/register', data);

export const getUserProfile = () => api.get('/auth/me');
export const updateUserProfile = (data) => api.put('/auth/me', data);

export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);

export const login = (data) => api.post('/auth/login_check', {
  username: data.username,
  password: data.password,
});

export const logout = () => api.post('/auth/logout');

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password });

export const getMyCart = () => api.get('/order/my-order');

export const addItemToCart = (productId, quantity = 1) =>
  api.post('/order/add-item', { productId, quantity });

export const updateCartItems = (items) =>
  api.patch('/order/update-items', { items });

export const removeCartItem = (itemId) =>
  api.delete(`/order/remove-item/${itemId}`);

export const checkoutCart = () => api.post('/order/checkout');

export const getOrderSuccess = (sessionId) =>
  api.get('/order/success', { params: { session_id: sessionId } });

export const getInvoicePdf = (orderId) =>
  api.get(`/invoice/${orderId}`, { responseType: 'blob' });

export const sendMessage = (data) => api.post('/contact', data);

export const createChatConversation = (data = {}) => api.post('/chatbot/conversations', data);
export const sendChatMessage = (data) => api.post('/chatbot/messages', data);
export const getChatQuestions = () => api.get('/chatbot/questions');
export const escalateChatbot = (data) => api.post('/chatbot/escalate', data);

export const clearApiCache = () => cacheStore.clear();

export const verifyAdminTwoFA = (data) => api.post('/admin/auth/verify-2fa', data);

export const getDailySales = () => api.get('/admin/dashboard/sales/daily');
export const getWeeklySales = () => api.get('/admin/dashboard/sales/weekly');
export const getWeeklySalesByCategory = () => api.get('/admin/dashboard/sales/weekly-by-category');
export const getCategoryShare = () => api.get('/admin/dashboard/sales/category-share');

export const getAdminProducts = (params) => api.get('/admin/products', { params });
export const getAdminProduct = (id) => api.get(`/admin/products/${id}`);
export const createAdminProduct = (data) => api.post('/admin/products', data);
export const updateAdminProduct = (id, data) => api.patch(`/admin/products/${id}`, data);
export const deleteAdminProduct = (id) => api.delete(`/admin/products/${id}`);

export const bulkAdminProducts = (data) => api.post('/admin/products/bulk', data);

export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.patch(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const getAdminOrder = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { status });

export const getAdminContacts = (params) => api.get('/admin/contact/messages', { params });
export const getAdminContact = (id) => api.get(`/admin/contact/messages/${id}`);
export const updateContactStatus = (id, status) => api.patch(`/admin/contact/messages/${id}/status`, { status });
export const replyContact = (id, message) => api.post(`/admin/contact/messages/${id}/reply`, { reply: message });

export const getAdminChatbotConversations = (params) => api.get('/admin/chatbot/conversations', { params });
export const getAdminChatbotConversation = (id) => api.get(`/admin/chatbot/conversations/${id}`);

export const getAdminCarousel = () => api.get('/admin/carousel');
export const createCarouselItem = (data) => api.post('/admin/carousel', data);
export const updateCarouselItem = (id, data) => api.patch(`/admin/carousel/${id}`, data);
export const deleteCarouselItem = (id) => api.delete(`/admin/carousel/${id}`);

export const reorderCarousel = (items) => api.patch('/admin/carousel/reorder', { items });

export const getTopProducts = () => cachedGet(
  'homepage-top-products',
  () => api.get('/homepage/top-products'),
  { onSuccess: (data) => seedProductsIntoEntityCache(data) }
);

export const getAdminTopProducts = () => api.get('/admin/homepage/top-products');
export const updateTopProducts = (productIds) => api.put('/admin/homepage/top-products', { productIds });

export const uploadFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/admin/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export default api;
