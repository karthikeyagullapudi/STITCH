import { useDispatch } from 'react-redux';
import {
  createProducts,
  getAdminProducts,
  getsAllProducts,
  getProductById,
} from '../service/product.api.js';
import {
  setAdminProducts,
  setAllProducts,
  setLoading,
  setError,
} from '../state/products.slice.js';

export const useProduct = () => {
  const dispatch = useDispatch();

  const handleCreateProduct = async (productData) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await createProducts(productData);
      return { success: true, product: data.product };
    } catch (error) {
      const errorMsg =
        error?.message ||
        error?.errors?.map((e) => e.msg).join(', ') ||
        'Failed to create product';
      dispatch(setError(errorMsg));
      console.log(error);
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetAdminProducts = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getAdminProducts();
      dispatch(setAdminProducts(data?.products));
      return data?.products;
    } catch (error) {
      const errorMsg = error?.message || 'Failed to fetch products';
      dispatch(setError(errorMsg));
      console.log(error);
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetAllProducts = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getsAllProducts();
      dispatch(setAllProducts(data?.products));
      return data?.products;
    } catch (error) {
      const errorMsg = error?.message || 'Failed to fetch products';
      dispatch(setError(errorMsg));
      console.log(error);
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetProductById = async (productId) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getProductById(productId);
      return data;
    } catch (error) {
      const errorMsg = error?.message || 'Failed to fetch product';
      dispatch(setError(errorMsg));
      console.log(error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleCreateProduct,
    handleGetAdminProducts,
    handleGetAllProducts,
    handleGetProductById,
  };
};
