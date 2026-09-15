import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    adminProducts: [],
    adminProductsMeta: {
      total: 0,
      page: 1,
      pages: 1,
      categories: [],
      stats: { total: 0, active: 0, draft: 0, archived: 0, outOfStock: 0 },
    },
    allProducts: [],
    // Paging + filter options for the last storefront listing request.
    productsMeta: {
      total: 0,
      page: 1,
      pages: 1,
      facets: { categories: [], sizes: [], tags: [] },
    },
    loading: false,
    errors: null,
  },
  reducers: {
    setAdminProducts: (state, action) => {
      state.adminProducts = action.payload;
    },
    setAdminProductsMeta: (state, action) => {
      state.adminProductsMeta = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.errors = action.payload;
    },
    setAllProducts: (state, action) => {
      state.allProducts = action.payload;
    },
    setProductsMeta: (state, action) => {
      state.productsMeta = action.payload;
    },
  },
});

export const {
  setAdminProducts,
  setAdminProductsMeta,
  setAllProducts,
  setProductsMeta,
  setLoading,
  setError,
} = productSlice.actions;

export default productSlice.reducer;
