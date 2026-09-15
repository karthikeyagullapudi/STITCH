import axios from 'axios';
import { API_BASE, request } from '../../../shared/api/request.js';

const cartApiInstance = axios.create({
  baseURL: `${API_BASE}/cart`,
  withCredentials: true,
});

export const getCart = () =>
  request(() => cartApiInstance.get('/'), 'Failed to fetch cart');

export const addToCart = (payload) =>
  request(() => cartApiInstance.post('/add', payload), 'Failed to add to cart');

export const updateCartItem = (itemId, quantity) =>
  request(
    () => cartApiInstance.patch(`/item/${itemId}`, { quantity }),
    'Failed to update cart',
  );

export const removeCartItem = (itemId) =>
  request(() => cartApiInstance.delete(`/item/${itemId}`), 'Failed to remove item');

export const clearCart = () =>
  request(() => cartApiInstance.delete('/clear'), 'Failed to clear cart');
