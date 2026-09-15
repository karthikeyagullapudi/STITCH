import axios from 'axios';

const accountApiInstance = axios.create({
  baseURL: '/api/users/me',
  withCredentials: true,
});

// Every request surfaces the server's JSON error body (or a fallback message).
const request = async (call, fallback) => {
  try {
    const response = await call();
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: fallback };
  }
};

export const updateProfile = (payload) =>
  request(() => accountApiInstance.patch('/', payload), 'Failed to update profile');

export const changePassword = (payload) =>
  request(
    () => accountApiInstance.patch('/password', payload),
    'Failed to update password',
  );

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return request(
    () => accountApiInstance.post('/avatar', formData),
    'Failed to upload photo',
  );
};

export const addAddress = (payload) =>
  request(() => accountApiInstance.post('/addresses', payload), 'Failed to add address');

export const updateAddress = (addressId, payload) =>
  request(
    () => accountApiInstance.patch(`/addresses/${addressId}`, payload),
    'Failed to update address',
  );

export const deleteAddress = (addressId) =>
  request(
    () => accountApiInstance.delete(`/addresses/${addressId}`),
    'Failed to remove address',
  );

export const sendPhoneOtp = () =>
  request(() => accountApiInstance.post('/verify-phone'), 'Failed to send code');

export const verifyPhoneOtp = (otp) =>
  request(
    () => accountApiInstance.post('/verify-phone/confirm', { otp }),
    'Failed to verify code',
  );
