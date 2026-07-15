import { createBrowserRouter } from 'react-router';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import AllProducts from '../features/products/pages/AllProducts.jsx';
import CreateProduct from '../features/products/pages/CreateProduct.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <h1>Hello World</h1>,
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
    path: '/admin/products',
    element: <AllProducts />,
  },
  {
    path: '/admin/products/new',
    element: <CreateProduct />,
  },
]);

export default router;
