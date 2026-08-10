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
    path: '/cart',
    element: (
      <Protected role="user">
        <Cart />
      </Protected>
    ),
  },
  {
    path: '/wishlist',
    element: <Wishlist />,
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
]);

export default router;
