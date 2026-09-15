import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    adminOrders: [],
    adminMeta: { total: 0, page: 1, pages: 1 },
    loading: false,
    errors: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload || [];
    },
    setAdminOrders: (state, action) => {
      const { orders = [], total = 0, page = 1, pages = 1 } =
        action.payload || {};
      state.adminOrders = orders;
      state.adminMeta = { total, page, pages };
    },
    // Replaces an updated order wherever it is listed.
    updateOrder: (state, action) => {
      const replace = (list) =>
        list.map((order) =>
          order._id === action.payload._id ? action.payload : order,
        );
      state.orders = replace(state.orders);
      state.adminOrders = replace(state.adminOrders);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.errors = action.payload;
    },
  },
});

export const { setOrders, setAdminOrders, updateOrder, setLoading, setError } =
  orderSlice.actions;
export default orderSlice.reducer;
