import axios from 'axios';
import { request } from '../../../shared/api/request.js';

const adminApiInstance = axios.create({
  baseURL: '/api/admin',
  withCredentials: true,
});

export const getDashboard = () =>
  request(() => adminApiInstance.get('/dashboard'), 'Failed to fetch dashboard');

export const getAnalytics = (days) =>
  request(
    () => adminApiInstance.get('/analytics', { params: { days } }),
    'Failed to fetch analytics',
  );

export const getCustomers = (params) =>
  request(
    () => adminApiInstance.get('/customers', { params }),
    'Failed to fetch customers',
  );

export const updateCustomerStatus = (userId, status) =>
  request(
    () => adminApiInstance.patch(`/customers/${userId}/status`, { status }),
    'Failed to update customer',
  );

export const getAdmins = () =>
  request(() => adminApiInstance.get('/admins'), 'Failed to fetch admins');

export const updateAdminApproval = (userId, approved) =>
  request(
    () => adminApiInstance.patch(`/admins/${userId}/approval`, { approved }),
    'Failed to update admin',
  );
