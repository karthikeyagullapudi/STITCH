import axios from 'axios';
import { API_BASE, request } from '../../../shared/api/request.js';

const couponApiInstance = axios.create({
  baseURL: `${API_BASE}/coupons`,
  withCredentials: true,
});

export const getCoupons = () =>
  request(() => couponApiInstance.get('/'), 'Failed to fetch coupons');

export const createCoupon = (payload) =>
  request(() => couponApiInstance.post('/', payload), 'Failed to create coupon');

export const updateCoupon = (couponId, payload) =>
  request(
    () => couponApiInstance.patch(`/${couponId}`, payload),
    'Failed to update coupon',
  );

export const deleteCoupon = (couponId) =>
  request(
    () => couponApiInstance.delete(`/${couponId}`),
    'Failed to delete coupon',
  );
