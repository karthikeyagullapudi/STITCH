import { createSlice } from '@reduxjs/toolkit';

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    coupons: [],
    loading: false,
    errors: null,
  },
  reducers: {
    setCoupons: (state, action) => {
      state.coupons = action.payload || [];
    },
    // Adds a new coupon to the top, or replaces an updated one in place.
    upsertCoupon: (state, action) => {
      const index = state.coupons.findIndex((c) => c._id === action.payload._id);
      if (index === -1) state.coupons.unshift(action.payload);
      else state.coupons[index] = action.payload;
    },
    removeCoupon: (state, action) => {
      state.coupons = state.coupons.filter((c) => c._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.errors = action.payload;
    },
  },
});

export const {
  setCoupons,
  upsertCoupon,
  removeCoupon,
  setLoading,
  setError,
} = couponSlice.actions;
export default couponSlice.reducer;
