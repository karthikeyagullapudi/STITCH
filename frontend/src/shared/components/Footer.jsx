import { Link } from 'react-router';

const links = [
  { label: 'Shipping', to: '/pages/shipping' },
  { label: 'Returns', to: '/pages/returns' },
  { label: 'Contact', to: '/pages/contact' },
  { label: 'Privacy', to: '/pages/privacy' },
  { label: 'Terms', to: '/pages/terms' },
];

const Footer = () => (
  <footer className="mt-16 w-full border-t border-line bg-surface">
    <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
      <div className="flex flex-col items-center gap-2 md:items-start">
        <Link
          to="/"
          className="font-display text-2xl font-bold uppercase tracking-tight text-paper"
        >
          STITCH
        </Link>
        <span className="font-display text-[11px] uppercase tracking-wide text-muted">
          © {new Date().getFullYear()} STITCH Technical Apparel. All rights
          reserved.
        </span>
        {/* Required attribution for product photos sourced via the Pexels API. */}
        <a
          href="https://www.pexels.com"
          target="_blank"
          rel="noreferrer"
          className="font-display text-[11px] uppercase tracking-wide text-faint transition-colors hover:text-accent"
        >
          Photos provided by Pexels
        </a>
      </div>
      <nav className="flex flex-wrap justify-center gap-8">
        {links.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            className="font-display text-[11px] uppercase tracking-wide text-muted transition-colors hover:text-accent"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);

export default Footer;
