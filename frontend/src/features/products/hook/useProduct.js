import { useDispatch } from 'react-redux';
import {
  createProducts,
  getAdminProducts,
  getsAllProducts,
  getProductBySlug,
} from '../service/product.api.js';
import {
  setAdminProducts,
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

  return {
    handleCreateProduct,
    handleGetAdminProducts,
    handleGetAllProducts,
    handleGetProductBySlug,
  };
};
