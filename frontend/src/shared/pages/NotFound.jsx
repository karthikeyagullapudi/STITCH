import { Link } from 'react-router';
import Header from '../../features/products/components/Header.jsx';
import Footer from '../components/Footer.jsx';

const NotFound = () => (
  <div className="flex min-h-screen flex-col bg-ink font-body text-paper">
    <Header />
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center gap-6 px-6 pt-28 text-center">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
        Error 404
      </p>
      <h1 className="font-display text-5xl font-bold uppercase tracking-tight md:text-7xl">
        Page Not Found
      </h1>
      <p className="max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        to="/"
        className="border border-paper px-10 py-4 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink"
      >
        Back to Home
      </Link>
    </main>
    <Footer />
  </div>
);

export default NotFound;
