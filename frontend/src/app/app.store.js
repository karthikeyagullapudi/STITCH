import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/state/auth.slice.js';
import productReducer from '../features/products/state/products.slice.js';
import cartReducer from '../features/cart/state/cart.slice.js';
import wishlistReducer from '../features/wishlist/state/wishlist.slice.js';
import orderReducer from '../features/orders/state/order.slice.js';
import couponReducer from '../features/coupons/state/coupon.slice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    coupon: couponReducer,
  },
});

export default store;
