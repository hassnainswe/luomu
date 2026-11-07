import axios from 'axios';

const api = axios.create({
  // Production default is same-origin (/api on Vercel); local dev talks to the Node server.
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : ''),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Surface the API's own message (e.g. "Invalid voucher code") to callers via err.message.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message;
    if (msg) err.message = msg;
    else if (!err.response) err.message = 'Cannot reach LUOMU right now. Please check your connection and try again.';
    return Promise.reject(err);
  }
);

// No client-side fallback data: the backend serves its own local catalog when Supabase
// is not configured, and faking orders here would confirm orders nobody receives.

export const productsAPI = {
  getAll: (params = {}) => api.get('/api/products', { params }),
  getFeatured: () => api.get('/api/products/featured'),
  getBySlug: (slug) => api.get(`/api/products/${slug}`),
  getRelated: (slug) => api.get(`/api/products/${slug}/related`),
};

export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
};

export const ordersAPI = {
  create: (payload) => api.post('/api/orders', payload),
  getByNumber: (orderNumber) => api.get(`/api/orders/${orderNumber}`),
  validateVoucher: (code, subtotal) => api.post('/api/orders/validate-voucher', { code, subtotal }),
  track: (order_number, phone) => api.post('/api/orders/track', { order_number, phone }),
};

export const newsletterAPI = {
  subscribe: (email) => api.post('/api/newsletter', { email }),
};

export default api;
