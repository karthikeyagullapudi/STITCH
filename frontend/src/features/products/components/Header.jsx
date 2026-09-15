import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import {
  FiShoppingBag,
  FiHeart,
  FiMenu,
  FiX,
  FiUser,
  FiSearch,
} from 'react-icons/fi';
import { useCart } from '../../cart/hook/useCart.js';
import { useWishlist } from '../../wishlist/hook/useWishlist.js';
import { useAuth } from '../../auth/hook/useAuth.js';

const navLinks = [
  { name: 'New', path: '/' },
  { name: 'Men', path: '/collections/mens' },
  { name: 'Women', path: '/collections/women' },
  { name: 'Accessories', path: '/collections/accessories' },
];

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { handleGetCart } = useCart();
  const { handleGetWishlist } = useWishlist();
  const { handleLogout } = useAuth();
  const user = useSelector((state) => state.auth.user);
  const { items } = useSelector((state) => state.cart);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Keep the bag and wishlist badges in sync with the server for signed-in
  // users. The wishlist also has to be loaded for the hearts on product cards
  // to know which products are already saved.
  useEffect(() => {
    if (!user) return;
    handleGetCart();
    handleGetWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const isLinkActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const onSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchOpen(false);
    navigate(`/collections/all?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const onLogout = async () => {
    setMobileMenuOpen(false);
    await handleLogout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-line bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
        {/* Left branding & desktop navigation */}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="font-display text-xl font-bold uppercase tracking-tight text-paper"
          >
            STITCH
          </Link>
          <nav className="hidden gap-8 md:flex">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${labelCaps} transition-colors ${
                    active
                      ? 'border-b-2 border-accent pb-1 text-accent'
                      : 'text-muted hover:text-accent'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right user actions */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-paper transition-colors hover:text-accent"
          >
            <FiSearch className="h-5 w-5" />
          </button>
          {user?.role === 'admin' && (
            <Link
              to="/admin/products"
              className={`${labelCaps} hidden text-muted transition-colors hover:text-accent sm:block`}
            >
              Admin
            </Link>
          )}
          {user ? (
            <Link
              to="/account"
              aria-label="Account"
              className={`hidden transition-colors sm:block ${
                isLinkActive('/account')
                  ? 'text-accent'
                  : 'text-paper hover:text-accent'
              }`}
            >
              <FiUser className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className={`${labelCaps} hidden text-muted transition-colors hover:text-accent sm:block`}
            >
              Login
            </Link>
          )}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className={`relative transition-colors ${
              isLinkActive('/wishlist')
                ? 'text-accent'
                : 'text-paper hover:text-accent'
            }`}
          >
            <FiHeart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative text-paper transition-transform active:scale-95"
          >
            <FiShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-paper transition-colors hover:text-accent md:hidden"
          >
            {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <form
          onSubmit={onSearch}
          className="border-t border-line bg-surface/95 px-6 py-3 backdrop-blur-md"
        >
          <input
            autoFocus
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="mx-auto block w-full max-w-[1440px] bg-transparent font-display text-sm uppercase tracking-wide text-paper outline-none placeholder:text-faint"
          />
        </form>
      )}

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-line bg-surface/95 px-6 py-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${labelCaps} text-sm transition-colors ${
                    active ? 'text-accent' : 'text-paper hover:text-accent'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${labelCaps} pt-2 text-sm text-muted transition-colors hover:text-accent`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${labelCaps} pt-2 text-sm text-muted transition-colors hover:text-accent`}
                >
                  Account
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${labelCaps} text-sm text-muted transition-colors hover:text-accent`}
                >
                  Orders
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className={`${labelCaps} text-left text-sm text-muted transition-colors hover:text-red-400`}
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`${labelCaps} pt-2 text-sm text-muted transition-colors hover:text-accent`}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
