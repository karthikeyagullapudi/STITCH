import { createSlice } from '@reduxjs/toolkit';

// Replaces the matching record in a list by _id.
const replaceById = (list, record) =>
  list.map((item) => (item._id === record._id ? { ...item, ...record } : item));

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    customers: [],
    customersMeta: { total: 0, page: 1, pages: 1 },
    admins: [],
    loading: false,
    errors: null,
  },
  reducers: {
    setCustomers: (state, action) => {
      const { customers = [], total = 0, page = 1, pages = 1 } =
        action.payload || {};
      state.customers = customers;
      state.customersMeta = { total, page, pages };
    },
    updateCustomer: (state, action) => {
      state.customers = replaceById(state.customers, action.payload);
    },
    setAdmins: (state, action) => {
      state.admins = action.payload || [];
    },
    updateAdmin: (state, action) => {
      state.admins = replaceById(state.admins, action.payload);
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
  setCustomers,
  updateCustomer,
  setAdmins,
  updateAdmin,
  setLoading,
  setError,
} = adminSlice.actions;
export default adminSlice.reducer;
