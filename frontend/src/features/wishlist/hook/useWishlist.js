import { useDispatch, useSelector } from 'react-redux';
import {
  getWishlist,
  addToWishlist,
  removeWishlistItem,
  moveToCart,
} from '../service/wishlist.api.js';
import {
  setWishlist,
  setLoading,
  setError,
  startPending,
  stopPending,
} from '../state/wishlist.slice.js';

const readError = (error, fallback) =>
  error?.message || error?.errors?.map((e) => e.msg).join(', ') || fallback;

// Saved items come back populated, so `item.product` is an object; fall back to
// the raw id for any item that was not populated.
const itemProductId = (item) =>
  String(item?.product?._id || item?.product || '');

export const useWishlist = () => {
  const dispatch = useDispatch();
  const { items, pending } = useSelector((state) => state.wishlist);

  const findByProduct = (productId) =>
    items.find((item) => itemProductId(item) === String(productId)) || null;

  const isSaved = (productId) => Boolean(findByProduct(productId));

  const isPending = (productId) => pending.includes(String(productId));

  const handleGetWishlist = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await getWishlist();
      dispatch(setWishlist(data?.wishlist));
      return data?.wishlist;
    } catch {
      // A failed load (e.g. logged-out) just means nothing saved — stay quiet.
      dispatch(setWishlist({ items: [] }));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddToWishlist = async (payload) => {
    const productId = String(payload?.productId || '');
    try {
      dispatch(startPending(productId));
      dispatch(setError(null));
      const data = await addToWishlist(payload);
      dispatch(setWishlist(data?.wishlist));
      return { success: true, wishlist: data?.wishlist };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to save to wishlist');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(stopPending(productId));
    }
  };

  const handleRemoveWishlistItem = async (itemId, productId = '') => {
    try {
      dispatch(startPending(String(productId)));
      dispatch(setError(null));
      const data = await removeWishlistItem(itemId);
      dispatch(setWishlist(data?.wishlist));
      return { success: true, wishlist: data?.wishlist };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to remove item');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(stopPending(String(productId)));
    }
  };

  /* Save if absent, unsave if present. The saved item's id is resolved from
     state, so the heart never needs a round-trip just to learn it. */
  const handleToggleWishlist = async (payload) => {
    const productId = String(payload?.productId || '');
    if (!productId) return { success: false, error: 'Missing product id' };

    const saved = findByProduct(productId);
    if (saved) {
      const result = await handleRemoveWishlistItem(saved._id, productId);
      return { ...result, saved: false };
    }
    const result = await handleAddToWishlist(payload);
    return { ...result, saved: result.success };
  };

  const handleMoveToCart = async (itemId, quantity = 1) => {
    try {
      dispatch(setError(null));
      const data = await moveToCart(itemId, quantity);
      dispatch(setWishlist(data?.wishlist));
      return { success: true, wishlist: data?.wishlist };
    } catch (error) {
      const errorMsg = readError(error, 'Failed to move item to bag');
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    }
  };

  return {
    items,
    isSaved,
    isPending,
    findByProduct,
    handleGetWishlist,
    handleAddToWishlist,
    handleRemoveWishlistItem,
    handleToggleWishlist,
    handleMoveToCart,
  };
};
