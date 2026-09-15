import { useDispatch } from 'react-redux';
import {
  getOrderSummary,
  checkout,
  verifyOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../service/order.api.js';
import {
  setOrders,
  setAdminOrders,
  updateOrder,
  setLoading,
  setError,
} from '../state/order.slice.js';
import { readError } from '../../../shared/api/request.js';

export const useOrder = () => {
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

  const withOrderUpdate = async (call, fallback) => {
    const result = await run(call, fallback);
    if (result.success) dispatch(updateOrder(result.order));
    return result;
  };

  return {
    handleGetOrderSummary: (couponCode) =>
      run(() => getOrderSummary(couponCode), 'Failed to price order'),
    handleCheckout: (payload) =>
      run(() => checkout(payload), 'Failed to create order'),
    handleVerifyOrder: (payload) =>
      run(() => verifyOrder(payload), 'Failed to verify payment'),
    handleGetOrderById: (orderId) =>
      run(() => getOrderById(orderId), 'Failed to fetch order'),
    handleGetMyOrders: () =>
      load(getMyOrders, (data) => dispatch(setOrders(data.orders)), 'Failed to fetch orders'),
    handleGetAllOrders: (params) =>
      load(
        () => getAllOrders(params),
        (data) => dispatch(setAdminOrders(data)),
        'Failed to fetch orders',
      ),
    handleCancelOrder: (orderId) =>
      withOrderUpdate(() => cancelOrder(orderId), 'Failed to cancel order'),
    handleUpdateOrderStatus: (orderId, status) =>
      withOrderUpdate(
        () => updateOrderStatus(orderId, status),
        'Failed to update order',
      ),
  };
};
