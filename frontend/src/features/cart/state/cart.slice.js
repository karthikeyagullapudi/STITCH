import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    errors: null,
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload?.items || [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.errors = action.payload;
    },
  },
});

export const { setCart, setLoading, setError } = cartSlice.actions;
export default cartSlice.reducer;
