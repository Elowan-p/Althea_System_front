import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
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
  return config;
}, (error) => Promise.reject(error));

const responseFromData = (data) => ({ data });
const normalizeSearchValue = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const cacheStore = new Map();

const getCachedEntry = (key) => {
  const entry = cacheStore.get(key);

  if (!entry) {
    return null;
  }

  if (entry.data && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry;
  }

  if (entry.promise) {
    return entry;
  }

  cacheStore.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const seedProductCache = (product) => {
  if (product?.id) {
    setCachedData(`product:${product.id}`, product);
  }
};

const seedCategoryCache = (category) => {
  if (category?.id) {
    setCachedData(`category:${category.id}`, category);
  }
};

const seedProductsCache = (products) => {
  if (Array.isArray(products)) {
    products.forEach(seedProductCache);
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

  if (cachedEntry?.data) {
    return responseFromData(cachedEntry.data);
  }

  if (cachedEntry?.promise) {
    return cachedEntry.promise;
  }

  const requestPromise = fetcher()
    .then((response) => {
      cacheStore.set(key, {
        data: response.data,
        timestamp: Date.now(),
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return responseFromData(response.data);
    })
    .catch((error) => {
      cacheStore.delete(key);
      throw error;
    });

  cacheStore.set(key, { promise: requestPromise });

  return requestPromise;
};

// Home Service
export const getHomeData = () => cachedGet(
  'home',
  () => api.get('/home'),
  {
    onSuccess: (data) => {
      seedCategoriesCache(data?.categories);
      seedProductsCache(data?.topProducts);
    },
  }
);

// Category Service
export const getCategories = () => cachedGet(
  'categories',
  () => api.get('/categories'),
  {
    onSuccess: (data) => {
      seedCategoriesCache(data);
      data?.forEach((category) => seedProductsCache(category?.products));
    },
  }
);

export const getCategory = (id) => cachedGet(
  `category:${id}`,
  () => api.get(`/categories/${id}`),
  {
    onSuccess: (data) => {
      seedCategoryCache(data);
      seedProductsCache(data?.products);
    },
  }
);

export const getCategoryProducts = (categoryId, params) => cachedGet(
  `category-products:${categoryId}`,
  () => api.get(`/categories/${categoryId}/products`, { params }),
  {
    onSuccess: (data) => seedProductsCache(data),
  }
);

// Products Service
export const getProducts = () => cachedGet(
  'products',
  () => api.get('/products'),
  {
    onSuccess: (data) => seedProductsCache(data),
  }
);

export const getProduct = (id) => cachedGet(
  `product:${id}`,
  () => api.get(`/products/${id}`),
  {
    onSuccess: (data) => seedProductCache(data),
  }
);

export const getSimilarProducts = (id) => cachedGet(
  `product-similar:${id}`,
  () => api.get(`/products/${id}/similar`),
  {
    onSuccess: (data) => seedProductsCache(data),
  }
);

export const searchProducts = async (query) => {
  const normalizedQuery = normalizeSearchValue(query);

  if (normalizedQuery.length < 2) {
    return responseFromData([]);
  }

  const productsResponse = await getProducts();
  const filteredProducts = (productsResponse.data || []).filter((product) => {
    const searchableContent = normalizeSearchValue([
      product?.title,
      product?.description,
      product?.medicalDomain,
      product?.powerSupplyType,
      product?.category?.title,
    ].join(' '));

    return searchableContent.includes(normalizedQuery);
  });

  return responseFromData(filteredProducts);
};

// Auth Service
export const register = (data) => api.post('/auth/register', data);
export const verifyEmail = (token) => api.get('/auth/verify-email', { params: { token } });
export const login = (data) => api.post('/auth/login_check', data);
export const logout = () => api.post('/auth/logout');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });

// Cart & Order Service (Keep for future use even if not in current scope)
export const syncCart = (cartItems) => api.post('/cart', { items: cartItems });
export const submitCheckout = (orderData) => api.post('/checkout', orderData);
export const getOrders = (year) => api.get('/user/orders', { params: { year } });

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
