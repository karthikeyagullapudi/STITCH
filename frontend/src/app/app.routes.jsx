import { createBrowserRouter } from 'react-router';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import AllAdminProducts from '../features/products/pages/admin/AllAdminProducts.jsx';
import CreateProduct from '../features/products/pages/admin/CreateProduct.jsx';
import LandingPage from '../features/products/pages/user/LandingPage.jsx';
import Cart from '../features/cart/pages/Cart.jsx';
import Wishlist from '../features/wishlist/pages/Wishlist.jsx';
import MensCollection from '../features/products/pages/user/AllProducts.jsx';
import Product from '../features/products/pages/user/Product.jsx';
import Protected from '../features/auth/components/Protected.jsx';
import ForgotPassword from '../features/auth/pages/ForgotPassword.jsx';
import ResetPassword from '../features/auth/pages/ResetPassword.jsx';
import VerifyEmail from '../features/auth/pages/VerifyEmail.jsx';
import Account from '../features/account/pages/Account.jsx';
import InfoPage from '../shared/pages/InfoPage.jsx';
import NotFound from '../shared/pages/NotFound.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email/:token',
    element: <VerifyEmail />,
  },
  {
    path: '/account',
    element: (
      <Protected role="user">
        <Account />
      </Protected>
    ),
  },
  {
    path: '/pages/:slug',
    element: <InfoPage />,
  },
  {
    path: '/cart',
    element: (
      <Protected role="user">
        <Cart />
      </Protected>
    ),
  },
  {
    path: '/wishlist',
    element: (
      <Protected role="user">
        <Wishlist />
      </Protected>
    ),
  },
  {
    path: '/collections/mens',
    element: <MensCollection />,
  },
  {
    path: '/product/:productId',
    element: <Product />,
  },

  {
    path: '/admin',
    children: [
      {
        path: '/admin/products',
        element: (
          <Protected role="admin">
            <AllAdminProducts />
          </Protected>
        ),
      },
      {
        path: '/admin/products/new',
        element: (
          <Protected role="admin">
            <CreateProduct />
          </Protected>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
