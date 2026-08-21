import axios from 'axios';

const wishlistApiInstance = axios.create({
  baseURL: '/api/wishlist',
  withCredentials: true,
});

export const getWishlist = async () => {
  try {
    const response = await wishlistApiInstance.get('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch wishlist' };
  }
};

export const addToWishlist = async (payload) => {
  try {
    const response = await wishlistApiInstance.post('/add', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to save to wishlist' };
  }
};

export const updateWishlistItem = async (itemId, payload) => {
  try {
    const response = await wishlistApiInstance.put(`/update/${itemId}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update wishlist item' };
  }
};

export const removeWishlistItem = async (itemId) => {
  try {
    const response = await wishlistApiInstance.delete(`/remove/${itemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove item' };
  }
};

export const getWishlistProduct = async (productId) => {
  try {
    const response = await wishlistApiInstance.get(`/product/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check wishlist' };
  }
};

export const moveToCart = async (itemId, quantity) => {
  try {
    const response = await wishlistApiInstance.post(
      `/move-to-cart/${itemId}`,
      quantity ? { quantity } : {},
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to move item to bag' };
  }
};
