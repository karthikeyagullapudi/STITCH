import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../hook/useWishlist.js';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

/* ------------------------------------------------------------------ */
/* Save-to-wishlist toggle.                                            */
/*                                                                     */
/* variant="icon" — floating heart for product cards.                  */
/* variant="full" — labelled button for the product detail page.       */
/*                                                                     */
/* Product cards navigate on click, so every handler here stops        */
/* propagation: tapping the heart must never open the product.         */
/* ------------------------------------------------------------------ */

const WishlistButton = ({
  productId,
  variantId = null,
  size,
  colorway,
  variant = 'icon',
  className = '',
}) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { isSaved, isPending, handleToggleWishlist } = useWishlist();

  const saved = isSaved(productId);
  const pending = isPending(productId);

  const onToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Saving is a per-user action — send guests to log in first, then bring
    // them back to where they were.
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (pending) return;

    await handleToggleWishlist({
      productId,
      variantId,
      size,
      colorway,
    });
  };

  const label = saved ? 'Remove from wishlist' : 'Save to wishlist';

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={saved}
        aria-label={label}
        className={`${labelCaps} flex h-14 w-full items-center justify-center gap-2 border tracking-[0.15em] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
          saved
            ? 'border-accent text-accent hover:bg-accent hover:text-ink'
            : 'border-line text-paper hover:border-accent hover:text-accent'
        } ${className}`}
      >
        <FiHeart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        {pending ? 'Saving...' : saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center bg-ink/70 backdrop-blur-sm transition-all hover:bg-ink/90 active:scale-90 disabled:opacity-50 ${
        saved ? 'text-accent' : 'text-paper hover:text-accent'
      } ${className}`}
    >
      <FiHeart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
};

export default WishlistButton;
