import axios from 'axios';
import { request } from '../../../shared/api/request.js';

const newsletterApiInstance = axios.create({
  baseURL: '/api/newsletter',
  withCredentials: true,
});

export const subscribe = (email) =>
  request(
    () => newsletterApiInstance.post('/subscribe', { email }),
    'Failed to subscribe',
  );
