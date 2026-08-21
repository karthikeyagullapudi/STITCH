import { useDispatch } from 'react-redux';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  createCartOrder,
  verifyCartOrder,
} from '../service/cart.api.js';
import { setCart, setLoading, setError } from '../state/cart.slice.js';

const readError = (error, fallback) =>
  error?.message || error?.errors?.map((e) => e.msg).join(', ') || fallback;

export const useCart = () => {
  const dispatch = useDispatch();

  const handleGetCart = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getCart();
      dispatch(setCart(data?.cart));
      return data?.cart;
    } catch {
      // A failed load (e.g. logged-out) just means an empty bag — stay quiet.
      dispatch(setCart({ items: [] }));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddToCart = async (payload) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await addToCart(payload);
      dispatch(setCart(data?.cart));
      return { success: true, cart: data?.cart };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to add to cart');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpdateCartItem = async (itemId, quantity) => {
    try {
      dispatch(setError(null));
      const data = await updateCartItem(itemId, quantity);
      dispatch(setCart(data?.cart));
      return { success: true, cart: data?.cart };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to update cart');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    }
  };

  const handleRemoveCartItem = async (itemId) => {
    try {
      dispatch(setError(null));
      const data = await removeCartItem(itemId);
      dispatch(setCart(data?.cart));
      return { success: true, cart: data?.cart };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to remove item');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    }
  };

  const handleClearCart = async () => {
    try {
      dispatch(setError(null));
      const data = await clearCart();
      dispatch(setCart(data?.cart));
      return { success: true };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to clear cart');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    }
  };

  const handleCheckout = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await createCartOrder();
      return { success: true, order: data?.order, key: data?.key };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to create order');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleVerifyCartOrder = async ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await verifyCartOrder({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });
      return { success: true, order: data?.order };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to verify order');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleGetCart,
    handleAddToCart,
    handleUpdateCartItem,
    handleRemoveCartItem,
    handleClearCart,
    handleCheckout,
    handleVerifyCartOrder,
  };
};
