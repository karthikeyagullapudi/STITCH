import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    pending: [],
    errors: null,
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload?.items || [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.errors = action.payload;
    },
    startPending: (state, action) => {
      if (!state.pending.includes(action.payload)) {
        state.pending.push(action.payload);
      }
    },
    stopPending: (state, action) => {
      state.pending = state.pending.filter((id) => id !== action.payload);
    },
  },
});

export const { setWishlist, setLoading, setError, startPending, stopPending } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
