import { Link } from 'react-router';
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiChevronDown,
} from 'react-icons/fi';

/**
 * Shared admin chrome for STITCH dashboard pages.
 * - <AdminSidebar active="Products" /> : fixed 240px nav rail
 * - <AdminLayout active="Products"> ...page... </AdminLayout> : sidebar + scrollable content region
 * Purely presentational — nav items are placeholder links; wire real routing/handlers as needed.
 */

const navItems = [
  { label: 'Dashboard', icon: FiGrid, to: '#' },
  { label: 'Products', icon: FiBox, to: '/admin/products' },
  { label: 'Create', icon: FiBox, to: '/admin/products/new' },
  { label: 'Orders', icon: FiShoppingBag, to: '#' },
  { label: 'Customers', icon: FiUsers, to: '#' },
  { label: 'Analytics', icon: FiBarChart2, to: '#' },
  { label: 'Settings', icon: FiSettings, to: '#' },
];

export function AdminSidebar({ active = 'Products' }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-line bg-panel">
      {/* Logo */}
      <div className="flex h-20 items-center gap-2 px-6">
        <span className="font-display text-2xl font-extrabold tracking-tight text-paper">
          STITCH
        </span>
        <span className="rounded-[3px] border border-line px-1.5 py-0.5 font-display text-[10px] font-bold tracking-[0.2em] text-accent">
          ADMIN
        </span>
      </div>

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
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3 bg-field/60 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-accent font-display text-[11px] font-bold text-ink">
            KY
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xs font-semibold text-paper">
              Kento Y.
            </span>
            <span className="text-[10px] text-muted">Admin Level 4</span>
          </div>
          <FiChevronDown className="ml-auto h-4 w-4 text-muted" />
        </div>
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
