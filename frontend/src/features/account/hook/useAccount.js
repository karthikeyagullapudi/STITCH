import { useDispatch } from 'react-redux';
import {
  updateProfile,
  changePassword,
  uploadAvatar,
  addAddress,
  updateAddress,
  deleteAddress,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../service/account.api.js';
import { setUser } from '../../auth/state/auth.slice.js';
import { readError } from '../../../shared/api/request.js';

/* Account data lives on the auth user, so every successful response that
   returns the user is synced straight back into the auth slice. */
export const useAccount = () => {
  const dispatch = useDispatch();

  const run = async (call, fallback) => {
    try {
      const data = await call();
      if (data?.user) dispatch(setUser(data.user));
      return { success: true, message: data?.message, user: data?.user };
    } catch (error) {
      return { success: false, error: readError(error, fallback) };
    }
  };

  return {
    handleUpdateProfile: (payload) =>
      run(() => updateProfile(payload), 'Failed to update profile'),
    handleChangePassword: (payload) =>
      run(() => changePassword(payload), 'Failed to update password'),
    handleUploadAvatar: (file) =>
      run(() => uploadAvatar(file), 'Failed to upload photo'),
    handleAddAddress: (payload) =>
      run(() => addAddress(payload), 'Failed to add address'),
    handleUpdateAddress: (addressId, payload) =>
      run(() => updateAddress(addressId, payload), 'Failed to update address'),
    handleDeleteAddress: (addressId) =>
      run(() => deleteAddress(addressId), 'Failed to remove address'),
    handleSendPhoneOtp: () => run(sendPhoneOtp, 'Failed to send code'),
    handleVerifyPhoneOtp: (otp) =>
      run(() => verifyPhoneOtp(otp), 'Failed to verify code'),
  };
};
