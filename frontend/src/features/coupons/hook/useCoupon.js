import { useDispatch } from 'react-redux';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../service/coupon.api.js';
import {
  setCoupons,
  upsertCoupon,
  removeCoupon,
  setLoading,
  setError,
} from '../state/coupon.slice.js';
import { readError } from '../../../shared/api/request.js';

export const useCoupon = () => {
  const dispatch = useDispatch();

  // Runs a write and reports the outcome to the calling form.
  const run = async (call, onSuccess, fallback) => {
    try {
      dispatch(setError(null));
      const data = await call();
      onSuccess(data);
      return { success: true, message: data?.message };
    } catch (error) {
      const errorMsg = readError(error, fallback);
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    }
  };

  const handleGetCoupons = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getCoupons();
      dispatch(setCoupons(data?.coupons));
    } catch (error) {
      dispatch(setError(readError(error, 'Failed to fetch coupons')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleGetCoupons,
    handleCreateCoupon: (payload) =>
      run(
        () => createCoupon(payload),
        (data) => dispatch(upsertCoupon(data.coupon)),
        'Failed to create coupon',
      ),
    handleUpdateCoupon: (couponId, payload) =>
      run(
        () => updateCoupon(couponId, payload),
        (data) => dispatch(upsertCoupon(data.coupon)),
        'Failed to update coupon',
      ),
    handleDeleteCoupon: (couponId) =>
      run(
        () => deleteCoupon(couponId),
        () => dispatch(removeCoupon(couponId)),
        'Failed to delete coupon',
      ),
  };
};
