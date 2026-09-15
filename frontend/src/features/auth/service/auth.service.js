import axios from 'axios';
import { API_BASE, request } from '../../../shared/api/request.js';

const authApiInstance = axios.create({
  baseURL: `${API_BASE}/auth`,
  withCredentials: true,
});

// Full-page redirect target for "Continue with Google".
export const GOOGLE_AUTH_URL = `${API_BASE}/auth/google`;

export const register = (payload) =>
  request(() => authApiInstance.post('/register', payload), 'Registration failed');

export const login = (payload) =>
  request(() => authApiInstance.post('/login', payload), 'Login failed');

export const getMe = () =>
  request(() => authApiInstance.get('/me'), 'Not signed in');

export const logout = () =>
  request(() => authApiInstance.post('/logout'), 'Logout failed');

export const forgotPassword = (email) =>
  request(
    () => authApiInstance.post('/forgot-password', { email }),
    'Request failed',
  );

export const resetPassword = (token, password) =>
  request(
    () => authApiInstance.post(`/reset-password/${token}`, { password }),
    'Reset failed',
  );

export const verifyEmail = (token) =>
  request(
    () => authApiInstance.get(`/verify-email/${token}`),
    'Verification failed',
  );

export const resendVerificationEmail = () =>
  request(
    () => authApiInstance.post('/verify-email/resend'),
    'Could not send email',
  );
