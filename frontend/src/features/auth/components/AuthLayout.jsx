import { Link } from 'react-router';

export const labelCls =
  'block font-display text-xs font-bold uppercase tracking-[0.1em] text-muted';
export const inputCls =
  'h-[52px] w-full rounded-[4px] border border-line bg-field px-4 text-paper outline-none transition-colors placeholder:text-faint focus:border-accent';
export const submitCls =
  'h-[52px] w-full rounded-[4px] bg-accent font-display text-sm font-bold uppercase tracking-[0.15em] text-ink transition hover:brightness-110 active:scale-[0.99] disabled:opacity-55';
export const successCls =
  'mb-6 rounded-[4px] border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400';
export const errorCls =
  'mb-6 rounded-[4px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400';
export const linkCls =
  'ml-2 font-display text-xs font-bold uppercase tracking-[0.1em] text-accent underline-offset-4 hover:underline';

/* Editorial split layout for the smaller auth screens (matches Login). */
const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-ink font-body text-paper">
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="relative h-[30vh] w-full overflow-hidden md:h-screen md:w-2/5">
        <img
          src="/images/auth-model.jpg"
          alt="STITCH techwear model"
          className="h-full w-full object-cover object-top brightness-75 grayscale"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/10 to-transparent" />
        <Link
          to="/"
          className="absolute top-8 left-8 font-display text-3xl font-bold tracking-tight text-white"
        >
          STITCH
        </Link>
      </section>

      <section className="flex w-full items-center justify-center bg-ink px-6 py-16 md:w-3/5 md:px-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 space-y-3">
            <h2 className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="text-muted">{subtitle}</p>}
          </div>
          {children}
        </div>
      </section>
    </main>
  </div>
);

export default AuthLayout;
