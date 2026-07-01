import { Link, useNavigate } from 'react-router';
import { FiEye } from 'react-icons/fi';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../hook/useAuth';

const labelCls =
  'mb-2 block font-display text-xs font-bold uppercase tracking-[0.1em] text-muted';
const inputCls =
  'h-[52px] w-full rounded-[4px] border border-line bg-field px-4 text-paper outline-none transition-colors placeholder:text-faint focus:border-accent';
const socialBtnCls =
  'flex h-12 items-center justify-center gap-2 rounded-[4px] border border-line font-display text-xs font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-field';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { handleRegister } = useAuth();
  const { loading, errors } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const result = await handleRegister({
      email: formData.email,
      password: formData.password,
      name: {
        firstName: formData.firstName,
        lastName: formData.lastName,
      },
      phone: formData.phone,
      role: 'user',
    });

    if (result && result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <main className="flex min-h-screen">
        {/* Left — form */}
        <section className="flex w-full flex-col items-center justify-center bg-ink px-6 py-16 md:w-3/5 md:px-12">
          <div className="w-full max-w-[440px]">
            {/* Wordmark + heading */}
            <div className="mb-8 space-y-6">
              <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted">
                STITCH / AUTH / V1.0
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-paper">
                  Create Account
                </h1>
                <p className="mt-2 text-muted">
                  Join the drop. Members get early access.
                </p>
              </div>
            </div>

            {/* Error alerts */}
            {(localError || errors) && (
              <div className="mb-6 rounded-[4px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {localError || errors}
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* First / Last name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-first" className={labelCls}>
                    First Name
                  </label>
                  <input
                    id="reg-first"
                    type="text"
                    placeholder="Kento"
                    className={inputCls}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reg-last" className={labelCls}>
                    Last Name
                  </label>
                  <input
                    id="reg-last"
                    type="text"
                    placeholder="Yamazaki"
                    className={inputCls}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className={labelCls}>
                  Identity / Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="operator@stitch.jp"
                  className={inputCls}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone number */}
              <div>
                <label htmlFor="reg-phone" className={labelCls}>
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="9059584882"
                  className={inputCls}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className={labelCls}>
                  Access Key / Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className={`${inputCls} pr-12`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Show password"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-muted transition-colors hover:text-paper"
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="reg-confirm" className={labelCls}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className={`${inputCls} pr-12`}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Show confirm password"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-muted transition-colors hover:text-paper"
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 select-none">
                  <input type="checkbox" required className="stitch-checkbox mt-0.5" />
                  <span className="text-sm leading-snug text-muted">
                    I agree to the{' '}
                    <a
                      href="#"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 select-none">
                  <input type="checkbox" className="stitch-checkbox mt-0.5" />
                  <span className="text-sm leading-snug text-muted">
                    Subscribe to drop alerts &amp; newsletter.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 h-[52px] w-full rounded-[4px] bg-accent font-display text-sm font-bold uppercase tracking-[0.15em] text-ink transition hover:brightness-110 active:scale-[0.99] disabled:opacity-55"
              >
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-line" />
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-faint">
                or sign up with
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className={socialBtnCls}>
                <FaGoogle className="h-4 w-4" />
                Google
              </button>
              <button type="button" className={socialBtnCls}>
                <FaApple className="h-4 w-4" />
                Apple
              </button>
            </div>

            {/* Footer link */}
            <p className="mt-6 text-center text-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        {/* Right — sticky editorial image */}
        <section className="sticky top-0 hidden h-screen w-2/5 overflow-hidden md:block">
          <img
            src="/images/auth-model.jpg"
            alt="STITCH techwear model"
            className="h-full w-full object-cover object-top brightness-75 grayscale"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink/50 to-transparent" />
          <div className="absolute top-12 right-12 left-12 flex flex-col items-start">
            <div className="font-display text-5xl font-bold leading-none tracking-tight text-white">
              STITCH
            </div>
            <div className="mt-3 border-t border-white/20 pt-3 font-display text-[11px] font-bold uppercase tracking-[0.4em] text-white/80">
              Made in Japan
            </div>
          </div>
          <div className="absolute right-12 bottom-12 left-12">
            <div className="font-display text-[10px] uppercase tracking-[0.2em] text-white/40">
              System Coordinates / 35.6762&deg; N, 139.6503&deg; E
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;
