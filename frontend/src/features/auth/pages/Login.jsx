import { Link, useNavigate } from 'react-router';
import { FiEye, FiUser, FiShield } from 'react-icons/fi';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../hook/useAuth';

const labelCls =
  'block font-display text-xs font-bold uppercase tracking-[0.1em] text-muted';
const inputCls =
  'h-[52px] w-full rounded-[4px] border border-line bg-field px-4 text-paper outline-none transition-colors placeholder:text-faint focus:border-accent';

const roleTabs = [
  { role: 'user', label: 'User', icon: FiUser },
  { role: 'admin', label: 'Admin', icon: FiShield },
];

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [loginAs, setLoginAs] = useState('user');
  const { handleLogin } = useAuth();
  const { loading, errors } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => {
      return {
        ...prev,
        [e.target.name]:
          e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleLogin({
      email: formData.email,
      password: formData.password,
      role: loginAs,
    });
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin/products' : '/');
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <main className="flex min-h-screen flex-col md:flex-row">
        {/* Left — editorial image */}
        <section className="relative h-[38vh] w-full overflow-hidden md:h-screen md:w-2/5">
          <img
            src="/images/auth-model.jpg"
            alt="STITCH techwear model"
            className="h-full w-full object-cover object-top brightness-75 grayscale"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute top-8 left-8 hidden md:block">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              STITCH
            </h1>
            <p className="mt-3 border-t border-white/20 pt-3 font-display text-[11px] font-semibold uppercase tracking-[0.4em] text-white/70">
              Made in Japan
            </p>
          </div>
        </section>

        {/* Right — form */}
        <section className="flex w-full items-center justify-center bg-ink px-6 py-20 md:w-3/5 md:px-12 md:py-10">
          <div className="w-full max-w-[440px]">
            {/* Heading */}
            <div className="mb-8 space-y-3">
              <span className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
                STITCH
              </span>
              <h2 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight">
                Welcome
                <br />
                Back
              </h2>
              <p className="pt-1 text-muted">
                {loginAs === 'admin'
                  ? 'Sign in to manage the STITCH catalogue.'
                  : 'Sign in to continue your drop.'}
              </p>
            </div>

            {/* User / Admin tabs */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-[4px] border border-line bg-field p-1">
              {roleTabs.map(({ role, label, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setLoginAs(role)}
                  className={`flex h-11 items-center justify-center gap-2 rounded-[2px] font-display text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
                    loginAs === role
                      ? 'bg-accent text-ink'
                      : 'text-muted hover:text-paper'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Error alert */}
            {errors && (
              <div className="mb-6 rounded-[4px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {errors}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="login-email" className={labelCls}>
                  Identity / Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="user@stitch-tech.jp"
                  className={inputCls}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className={labelCls}>
                  Access Key / Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className={`${inputCls} pr-12`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    aria-label="Show password"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-muted transition-colors hover:text-paper"
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="stitch-checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span className="font-display text-xs font-bold uppercase tracking-[0.1em] text-muted">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="font-display text-xs font-bold uppercase tracking-[0.1em] text-accent underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-[52px] w-full rounded-[4px] bg-accent font-display text-sm font-bold uppercase tracking-[0.15em] text-ink transition hover:brightness-110 active:scale-[0.99] disabled:opacity-55"
              >
                {loading
                  ? 'Signing in...'
                  : loginAs === 'admin'
                    ? 'Sign in as Admin'
                    : 'Sign in'}
              </button>
            </form>

            {/* Social — user login only, Google sign-in always creates a user account */}
            {loginAs === 'user' && (
              <>
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-line" />
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-faint">
                    or continue with
                  </span>
                  <div className="h-px flex-1 bg-line" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      handleGoogleSignIn();
                    }}
                    className="flex h-12 items-center justify-center gap-2 rounded-[4px] border border-line font-display text-xs font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-field"
                  >
                    <FaGoogle className="h-4 w-4" />
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex h-12 items-center justify-center gap-2 rounded-[4px] border border-line font-display text-xs font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-field"
                  >
                    <FaApple className="h-4 w-4" />
                    Apple
                  </button>
                </div>
              </>
            )}

            {/* Footer link */}
            <p className="mt-8 text-center text-muted">
              Don&apos;t have an account?
              <Link
                to="/register"
                className="ml-2 font-display text-xs font-bold uppercase tracking-[0.1em] text-accent underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
