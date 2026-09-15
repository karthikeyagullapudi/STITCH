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

export const getAdminProducts = async () => {
  try {
    const response = await productApiInstance.get('/admin/all-products');
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
