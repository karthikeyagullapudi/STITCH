import axios from 'axios';

const productApiInstance = axios.create({
  baseURL: '/api/products',
  withCredentials: true,
});

export const createProducts = async (productsData) => {
  try {
    const response = await productApiInstance.post('/create', productsData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create product' };
  }
};

// params: { search, category, status, page, limit }
export const getAdminProducts = async (params) => {
  try {
    const response = await productApiInstance.get('/admin/all-products', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch products' };
  }
};

// params: { q, gender, category, size, tag, collection, sort, page, limit }
export const getsAllProducts = async (params) => {
  try {
    const response = await productApiInstance.get('/all-products', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch products' };
  }
};

export const getProductBySlug = async (slug) => {
  try {
    const response = await productApiInstance.get(`/product/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch product' };
  }
};

export const getAdminProductById = async (productId) => {
  try {
    const response = await productApiInstance.get(`/admin/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch product' };
  }
};

// Accepts FormData (full edit) or a plain object (e.g. { status }).
export const updateProduct = async (productId, productData) => {
  try {
    const response = await productApiInstance.patch(`/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update product' };
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await productApiInstance.delete(`/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete product' };
  }
};
