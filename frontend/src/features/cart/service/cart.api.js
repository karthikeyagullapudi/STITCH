import axios from 'axios';

const cartApiInstance = axios.create({
  baseURL: '/api/cart',
  withCredentials: true,
});

export const getCart = async () => {
  try {
    const response = await cartApiInstance.get('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch cart' };
  }
};

export const addToCart = async (payload) => {
  try {
    const response = await cartApiInstance.post('/add', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add to cart' };
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await cartApiInstance.patch(`/item/${itemId}`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update cart' };
  }
};

export const removeCartItem = async (itemId) => {
  try {
    const response = await cartApiInstance.delete(`/item/${itemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove item' };
  }
};

export const clearCart = async () => {
  try {
    const response = await cartApiInstance.delete('/clear');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to clear cart' };
  }
};
