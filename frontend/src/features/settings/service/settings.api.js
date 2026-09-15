import axios from 'axios';
import { request } from '../../../shared/api/request.js';

const settingsApiInstance = axios.create({
  baseURL: '/api/settings',
  withCredentials: true,
});

export const getSettings = () =>
  request(() => settingsApiInstance.get('/'), 'Failed to fetch settings');
