import { setError, setLoading, setUser } from '../state/auth.slice';
import {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from '../service/auth.service';
import { setCart } from '../../cart/state/cart.slice.js';
import { setWishlist } from '../../wishlist/state/wishlist.slice.js';
import { useDispatch } from 'react-redux';
import { readError } from '../../../shared/api/request.js';

export const useAuth = () => {
  const dispatch = useDispatch();

  const handleRegister = async ({
    email,
    password,
    name: { firstName, lastName },
    phone,
    role,
    newsletter,
  }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      // Registering doesn't sign the user in (no cookie is set), so leave the
      // auth user untouched — the page sends them to /login next.
      await register({
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
      return { success: true };
    } catch (error) {
      const errorMsg = readError(error, 'Registration failed');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogin = async ({ email, password, role, remember }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await login({ email, password, role, remember });
      dispatch(setUser(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      const errorMsg = readError(error, 'Login failed');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadUser = async () => {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      if (data?.success) {
        dispatch(setUser(data.user));
      }
    } catch {
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Clears the session locally even if the request fails.
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      dispatch(setUser(null));
      dispatch(setCart({ items: [] }));
      dispatch(setWishlist({ items: [] }));
    }
  };

  /* The helpers below report back to their page instead of the shared slice
     error, so their messages never leak onto the login form. */

  const handleForgotPassword = async (email) => {
    try {
      const data = await forgotPassword(email);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: readError(error, 'Request failed') };
    }
  };

  const handleResetPassword = async (token, password) => {
    try {
      const data = await resetPassword(token, password);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: readError(error, 'Reset failed') };
    }
  };

  const handleVerifyEmail = async (token) => {
    try {
      const data = await verifyEmail(token);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: readError(error, 'Verification failed') };
    }
  };

  const handleResendVerification = async () => {
    try {
      const data = await resendVerificationEmail();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: readError(error, 'Could not send email') };
    }
  };

  return {
    handleRegister,
    handleLogin,
    loadUser,
    handleLogout,
    handleForgotPassword,
    handleResetPassword,
    handleVerifyEmail,
    handleResendVerification,
  };
};
