import axios from 'axios';
import { API_BASE, request } from '../../../shared/api/request.js';

const settingsApiInstance = axios.create({
  baseURL: `${API_BASE}/settings`,
  withCredentials: true,
});

export const getSettings = () =>
  request(() => settingsApiInstance.get('/'), 'Failed to fetch settings');

export const updateSettings = (payload) =>
  request(
    () => settingsApiInstance.patch('/', payload),
    'Failed to update settings',
  );
