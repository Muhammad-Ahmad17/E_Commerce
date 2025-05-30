import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const BASE_URL = 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.location.href = '/login';
      toast({
        title: 'Session expired',
        description: 'Please login again',
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Authentication
export const registerUser = (userData: any) => {
  return api.post('/api/registration/register', userData);
};

export const loginUser = (credentials: { email: string; password: string }) => {
  return api.post('/api/registration/login', credentials);
};

// Buyer APIs
export const getBuyerProfile = () => {
  return api.get('/api/buyer/profile');
};

export const getRecommendedProducts = () => {
  return api.get('/api/buyer/recommended');
};

export const getProductsByCategory = (category: string) => {
  return api.get(`/api/buyer/selected?category=${category}`);
};

export const getProductDetails = (id: string) => {
  return api.get(`/api/buyer/product/${id}`);
};

export const getBuyerOrders = () => {
  return api.get('/api/buyer/orders');
};

export const addProductReview = (reviewData: { productId: number; rating: number; comment: string }) => {
  return api.post('/api/buyer/addReview', reviewData);
};

// Cart APIs
export const getCart = () => {
  return api.get('/api/buyer/cart');
};

export const addToCart = (productData: { productId: number; quantity: number }) => {
  return api.post('/api/buyer/cart/add', productData);
};

export const removeFromCart = (productId: { productId: string }) => {
  return api.delete('/api/buyer/cart/delete', { data: productId });
};

export const checkoutCart = () => {
  return api.post('/api/buyer/cart/checkout');
};

// Vendor APIs
export const getVendorProfile = () => {
  return api.get('/api/vendors/profile');
};

export const getVendorProducts = () => {
  return api.get('/api/vendors/products');
};

export const addVendorProduct = (productData: any) => {
  return api.post('/api/vendors/addProduct', productData); // <-- FIXED
};

export const updateVendorProduct = (productId: string, productData: any) => {
  return api.put('/api/vendors/updateProduct', { productId, ...productData }); // <-- FIXED
};

export const deleteVendorProduct = (productId: string) => {
  return api.delete('/api/vendors/deleteProduct', { data: { productId } }); // <-- FIXED
};

export const getVendorOrders = () => {
  return api.get('/api/vendors/pendingOrders');
};

export const getVendorAnalytics = () => {
  return api.get('/api/vendors/analytics');
};

export const markOrderAsDelivered = (orderId: string) => {
  return api.put('/api/vendors/markOrderAsDelivered', { orderId });
};

