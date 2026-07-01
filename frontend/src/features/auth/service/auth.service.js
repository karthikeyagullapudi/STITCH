import axios from 'axios';

const authApiInstance = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
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
}) => {
  try {
    const response = await authApiInstance.post('/register', {
      email,
      password,
      name: {
        firstName,
        lastName,
      },
      phone,
      role,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await authApiInstance.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await authApiInstance.get('/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};
