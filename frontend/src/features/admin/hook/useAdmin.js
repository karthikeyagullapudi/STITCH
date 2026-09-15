import { useDispatch } from 'react-redux';
import {
  getDashboard,
  getAnalytics,
  getCustomers,
  updateCustomerStatus,
  getAdmins,
  updateAdminApproval,
} from '../service/admin.api.js';
import {
  setCustomers,
  updateCustomer,
  setAdmins,
  updateAdmin,
  setLoading,
  setError,
} from '../state/admin.slice.js';
import { readError } from '../../../shared/api/request.js';

export const useAdmin = () => {
  const dispatch = useDispatch();

  // Page-level requests: resolve to the response body or an error message.
  const run = async (call, fallback) => {
    try {
      return { success: true, ...(await call()) };
    } catch (error) {
      return { success: false, error: readError(error, fallback) };
    }
  };

  // List requests: stored in the slice with loading/error state.
  const load = async (call, onData, fallback) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      onData(await call());
    } catch (error) {
      dispatch(setError(readError(error, fallback)));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const withUpdate = async (call, onData, fallback) => {
    const result = await run(call, fallback);
    if (result.success) onData(result);
    return result;
  };

  return {
    handleGetDashboard: () => run(getDashboard, 'Failed to fetch dashboard'),
    handleGetAnalytics: (days) =>
      run(() => getAnalytics(days), 'Failed to fetch analytics'),
    handleGetCustomers: (params) =>
      load(
        () => getCustomers(params),
        (data) => dispatch(setCustomers(data)),
        'Failed to fetch customers',
      ),
    handleUpdateCustomerStatus: (userId, status) =>
      withUpdate(
        () => updateCustomerStatus(userId, status),
        (data) => dispatch(updateCustomer(data.customer)),
        'Failed to update customer',
      ),
    handleGetAdmins: () =>
      load(
        getAdmins,
        (data) => dispatch(setAdmins(data.admins)),
        'Failed to fetch admins',
      ),
    handleUpdateAdminApproval: (userId, approved) =>
      withUpdate(
        () => updateAdminApproval(userId, approved),
        (data) => dispatch(updateAdmin(data.admin)),
        'Failed to update admin',
      ),
  };
};
