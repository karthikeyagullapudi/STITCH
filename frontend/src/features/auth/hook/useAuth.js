import { setError, setLoading, setUser } from '../state/auth.slice';
import { register, login, getMe } from '../service/auth.service';
import { useDispatch } from 'react-redux';

export const useAuth = () => {
  const dispatch = useDispatch();

  const handleRegister = async ({
    email,
    password,
    name: { firstName, lastName },
    phone,
    role,
  }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await register({
        email,
        password,
        name: {
          firstName,
          lastName,
        },
        phone,
        role,
      });
      dispatch(setUser(data));
      return { success: true };
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        (error?.response?.data?.errors &&
          error.response.data.errors.map((e) => e.msg).join(', ')) ||
        error?.message ||
        'Registration failed';
      dispatch(setError(errorMsg));
      console.log(error);
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogin = async ({ email, password }) => {
    try {
      dispatch(setLoading(true));
      const data = await login({ email, password });
      dispatch(setUser(data));
      dispatch(setError(null));
    } catch (error) {
      dispatch(setError(error?.response?.data?.message));
      console.log(error);
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
    } catch (error) {
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { handleRegister, handleLogin, loadUser };
};
