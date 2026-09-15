import axios from 'axios';
import { API_BASE, request } from '../../../shared/api/request.js';

const orderApiInstance = axios.create({
  baseURL: `${API_BASE}/orders`,
  withCredentials: true,
});

export const getOrderSummary = (couponCode) =>
  request(
    () => orderApiInstance.post('/summary', { couponCode }),
    'Failed to price order',
  );

export const checkout = (payload) =>
  request(() => orderApiInstance.post('/checkout', payload), 'Failed to create order');

export const verifyOrder = (payload) =>
  request(() => orderApiInstance.post('/verify', payload), 'Failed to verify payment');

export const getMyOrders = () =>
  request(() => orderApiInstance.get('/'), 'Failed to fetch orders');

export const getOrderById = (orderId) =>
  request(() => orderApiInstance.get(`/${orderId}`), 'Failed to fetch order');

export const cancelOrder = (orderId) =>
  request(
    () => orderApiInstance.post(`/${orderId}/cancel`),
    'Failed to cancel order',
  );

export const getAllOrders = (params) =>
  request(
    () => orderApiInstance.get('/admin/all', { params }),
    'Failed to fetch orders',
  );

export const updateOrderStatus = (orderId, status) =>
  request(
    () => orderApiInstance.patch(`/admin/${orderId}/status`, { status }),
    'Failed to update order',
  );
