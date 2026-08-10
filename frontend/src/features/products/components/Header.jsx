import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { FiShoppingBag, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../cart/hook/useCart.js';

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
  const location = useLocation();
  const { handleGetCart } = useCart();
  const { items } = useSelector((state) => state.cart);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Keep the bag badge in sync with the server cart on load.
  useEffect(() => {
    handleGetCart();
  }, []);

  const isLinkActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
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
          <Link
            to="/login"
            className={`${labelCaps} hidden text-muted transition-colors hover:text-accent sm:block`}
          >
            Login
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className={`transition-colors ${
              isLinkActive('/wishlist')
                ? 'text-accent'
                : 'text-paper hover:text-accent'
            }`}
          >
            <FiHeart className="h-5 w-5" />
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
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={`${labelCaps} pt-2 text-sm text-muted transition-colors hover:text-accent`}
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
