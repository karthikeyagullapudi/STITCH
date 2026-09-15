import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import {
  FiGrid,
  FiBox,
  FiPlusSquare,
  FiShoppingBag,
  FiTag,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '../../auth/hook/useAuth.js';

/**
 * Shared admin chrome for STITCH dashboard pages.
 * - <AdminSidebar active="Products" /> : fixed 240px nav rail
 * - <AdminLayout active="Products"> ...page... </AdminLayout> : sidebar + scrollable content region
 */

const navItems = [
  { label: 'Dashboard', icon: FiGrid, to: '/admin' },
  { label: 'Products', icon: FiBox, to: '/admin/products' },
  { label: 'Create', icon: FiPlusSquare, to: '/admin/products/new' },
  { label: 'Orders', icon: FiShoppingBag, to: '/admin/orders' },
  { label: 'Coupons', icon: FiTag, to: '/admin/coupons' },
  { label: 'Customers', icon: FiUsers, to: '/admin/customers' },
  { label: 'Analytics', icon: FiBarChart2, to: '/admin/analytics' },
  { label: 'Settings', icon: FiSettings, to: '/admin/settings' },
];

const menuItemCls =
  'block w-full px-3 py-2 text-left font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:bg-field hover:text-paper';

export function AdminSidebar({ active = 'Products' }) {
  const user = useSelector((state) => state.auth.user);
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = `${user?.name?.firstName?.[0] || ''}${user?.name?.lastName?.[0] || ''}`;

  const onLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-line bg-panel">
      {/* Logo */}
      <Link to="/admin" className="flex h-20 items-center gap-2 px-6">
        <span className="font-display text-2xl font-extrabold tracking-tight text-paper">
          STITCH
        </span>
        <span className="rounded-[3px] border border-line px-1.5 py-0.5 font-display text-[10px] font-bold tracking-[0.2em] text-accent">
          ADMIN
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map(({ label, icon: Icon, to }) => {
          const isActive = label === active;
          return (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                isActive
                  ? 'border-l-2 border-accent bg-accent/5 text-accent'
                  : 'border-l-2 border-transparent text-muted hover:text-paper'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User chip */}
      <div className="relative border-t border-line p-4">
        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 border border-line bg-panel py-1">
            <Link to="/" className={menuItemCls}>
              View Store
            </Link>
            <Link to="/account" className={menuItemCls}>
              Account
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className={`${menuItemCls} hover:text-red-400`}
            >
              Log Out
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          className="flex w-full items-center gap-3 bg-field/60 p-2 text-left"
        >
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt=""
              className="h-8 w-8 rounded-[3px] object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-accent font-display text-[11px] font-bold uppercase text-ink">
              {initials}
            </div>
          )}
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-xs font-semibold text-paper">
              {user?.name?.firstName} {user?.name?.lastName?.[0]}
              {user?.name?.lastName && '.'}
            </span>
            <span className="truncate text-[10px] text-muted">{user?.email}</span>
          </div>
          <FiChevronDown
            className={`ml-auto h-4 w-4 shrink-0 text-muted transition-transform ${
              menuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ active = 'Products', children }) {
  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <AdminSidebar active={active} />
      <div className="ml-60 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
