import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    adminProducts: [],
    loading: false,
    errors: null,
  },
  reducers: {
    setAdminProducts: (state, action) => {
      state.adminProducts = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.errors = action.payload;
    },
  },
});

export const { setAdminProducts, setLoading, setError } = productSlice.actions;

export default productSlice.reducer;
