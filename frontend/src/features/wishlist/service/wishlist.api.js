import axios from 'axios';
import { API_BASE, request } from '../../../shared/api/request.js';

const wishlistApiInstance = axios.create({
  baseURL: `${API_BASE}/wishlist`,
  withCredentials: true,
});

export const getWishlist = () =>
  request(() => wishlistApiInstance.get('/'), 'Failed to fetch wishlist');

export const addToWishlist = (payload) =>
  request(
    () => wishlistApiInstance.post('/add', payload),
    'Failed to save to wishlist',
  );

export const updateWishlistItem = (itemId, payload) =>
  request(
    () => wishlistApiInstance.put(`/update/${itemId}`, payload),
    'Failed to update wishlist item',
  );

export const removeWishlistItem = (itemId) =>
  request(
    () => wishlistApiInstance.delete(`/remove/${itemId}`),
    'Failed to remove item',
  );

export const moveToCart = (itemId, quantity) =>
  request(
    () =>
      wishlistApiInstance.post(
        `/move-to-cart/${itemId}`,
        quantity ? { quantity } : {},
      ),
    'Failed to move item to bag',
  );

export const clearWishlist = () =>
  request(() => wishlistApiInstance.delete('/clear'), 'Failed to clear wishlist');
