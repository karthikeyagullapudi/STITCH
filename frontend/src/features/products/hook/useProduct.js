import { useDispatch } from 'react-redux';
import {
  createProducts,
  getAdminProducts,
  getsAllProducts,
  getProductBySlug,
  getAdminProductById,
  updateProduct,
  deleteProduct,
} from '../service/product.api.js';
import {
  setAdminProducts,
  setAdminProductsMeta,
  setAllProducts,
  setProductsMeta,
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

  const handleGetAdminProducts = async (params) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getAdminProducts(params);
      dispatch(setAdminProducts(data?.products));
      dispatch(
        setAdminProductsMeta({
          total: data?.total,
          page: data?.page,
          pages: data?.pages,
          categories: data?.categories,
          stats: data?.stats,
        }),
      );
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

  const handleGetAllProducts = async (params) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getsAllProducts(params);
      dispatch(setAllProducts(data?.products));
      dispatch(
        setProductsMeta({
          total: data?.total,
          page: data?.page,
          pages: data?.pages,
          facets: data?.facets,
        }),
      );
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

  const handleGetProductBySlug = async (slug) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getProductBySlug(slug);
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

  // Page-level requests that report back instead of using the shared slice.
  const run = async (call, fallback) => {
    try {
      return { success: true, ...(await call()) };
    } catch (error) {
      return {
        success: false,
        error:
          error?.message ||
          error?.errors?.map((e) => e.msg).join(', ') ||
          fallback,
      };
    }
  };

  return {
    handleGetAdminProductById: (productId) =>
      run(() => getAdminProductById(productId), 'Failed to fetch product'),
    handleUpdateProduct: (productId, productData) =>
      run(() => updateProduct(productId, productData), 'Failed to update product'),
    handleDeleteProduct: (productId) =>
      run(() => deleteProduct(productId), 'Failed to delete product'),
    handleCreateProduct,
    handleGetAdminProducts,
    handleGetAllProducts,
    handleGetProductBySlug,
  };
};
