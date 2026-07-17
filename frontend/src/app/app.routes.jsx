import { createBrowserRouter } from 'react-router';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import AllAdminProducts from '../features/products/pages/AllAdminProducts.jsx';
import CreateProduct from '../features/products/pages/CreateProduct.jsx';
import LandingPage from '../features/products/pages/LandingPage.jsx';
import Cart from '../features/products/pages/Cart.jsx';
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
    element: <Cart />,
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
          <Protected>
            <CreateProduct />
          </Protected>
        ),
      },
    ],
  },
]);

export default router;
