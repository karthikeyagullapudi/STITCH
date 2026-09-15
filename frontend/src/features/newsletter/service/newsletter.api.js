import axios from 'axios';
import { API_BASE, request } from '../../../shared/api/request.js';

const newsletterApiInstance = axios.create({
  baseURL: `${API_BASE}/newsletter`,
  withCredentials: true,
});

export const subscribe = (email) =>
  request(
    () => newsletterApiInstance.post('/subscribe', { email }),
    'Failed to subscribe',
  );
