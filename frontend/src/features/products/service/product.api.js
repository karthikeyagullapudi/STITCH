import axios from 'axios';
import { API_BASE, request } from '../../../shared/api/request.js';

const productApiInstance = axios.create({
  baseURL: `${API_BASE}/products`,
  withCredentials: true,
});

export const createProducts = (productsData) =>
  request(
    () => productApiInstance.post('/create', productsData),
    'Failed to create product',
  );

// params: { search, category, status, page, limit }
export const getAdminProducts = (params) =>
  request(
    () => productApiInstance.get('/admin/all-products', { params }),
    'Failed to fetch products',
  );

// params: { q, gender, category, size, tag, collection, sort, page, limit }
export const getAllProducts = (params) =>
  request(
    () => productApiInstance.get('/all-products', { params }),
    'Failed to fetch products',
  );

export const getProductBySlug = (slug) =>
  request(
    () => productApiInstance.get(`/product/${slug}`),
    'Failed to fetch product',
  );

export const getAdminProductById = (productId) =>
  request(
    () => productApiInstance.get(`/admin/${productId}`),
    'Failed to fetch product',
  );

// Accepts FormData (full edit) or a plain object (e.g. { status }).
export const updateProduct = (productId, productData) =>
  request(
    () => productApiInstance.patch(`/${productId}`, productData),
    'Failed to update product',
  );

export const deleteProduct = (productId) =>
  request(
    () => productApiInstance.delete(`/${productId}`),
    'Failed to delete product',
  );
