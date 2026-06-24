import { setError, setLoading, setUser } from '../state/auth.slice';
import { register } from '../service/auth.service';
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
  };

  return { handleRegister };
};
