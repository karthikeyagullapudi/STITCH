import axios from 'axios';

const authApiInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const register = async ({
  email,
  password,
  name: { firstName, lastName },
  phone,
  role,
  newsletter,
}) => {
  try {
    const response = await authApiInstance.post('/auth/register', {
      email,
      password,
      name: {
        firstName,
        lastName,
      },
      phone,
      role,
      newsletter,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async ({ email, password, role, remember }) => {
  try {
    const response = await authApiInstance.post('/auth/login', {
      email,
      password,
      role,
      remember,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await authApiInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  const response = await authApiInstance.post('/auth/logout');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await authApiInstance.post('/auth/forgot-password', {
    email,
  });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await authApiInstance.post(
    `/auth/reset-password/${token}`,
    { password },
  );
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await authApiInstance.get(`/auth/verify-email/${token}`);
  return response.data;
};

export const resendVerificationEmail = async () => {
  const response = await authApiInstance.post('/auth/verify-email/resend');
  return response.data;
};
