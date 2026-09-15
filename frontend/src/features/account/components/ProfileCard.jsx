import { useRef, useState } from 'react';
import { FiCamera, FiCheck } from 'react-icons/fi';
import { useAccount } from '../hook/useAccount.js';
import { useAuth } from '../../auth/hook/useAuth.js';
import {
  cardCls,
  cardTitleCls,
  labelCls,
  inputCls,
  primaryBtnCls,
  ghostBtnCls,
  feedbackCls,
} from './styles.js';

const VerifiedBadge = ({ verified }) => (
  <span
    className={`inline-flex items-center gap-1 border px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider ${
      verified
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
        : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    }`}
  >
    {verified && <FiCheck className="h-3 w-3" />}
    {verified ? 'Verified' : 'Unverified'}
  </span>
);

const ProfileCard = ({ user }) => {
  const {
    handleUpdateProfile,
    handleUploadAvatar,
    handleSendPhoneOtp,
    handleVerifyPhoneOtp,
  } = useAccount();
  const { handleResendVerification } = useAuth();
  const [form, setForm] = useState({
    firstName: user.name?.firstName || '',
    lastName: user.name?.lastName || '',
    phone: user.phone || '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  const show = (result) =>
    setFeedback(
      result.success
        ? { type: 'success', message: result.message }
        : { type: 'error', message: result.error },
    );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    show(
      await handleUpdateProfile({
        name: { firstName: form.firstName, lastName: form.lastName },
        ...(form.phone ? { phone: form.phone } : {}),
      }),
    );
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) show(await handleUploadAvatar(file));
  };

  const handleSendOtp = async () => {
    const result = await handleSendPhoneOtp();
    show(result);
    if (result.success) setOtpSent(true);
  };

  const handleConfirmOtp = async () => {
    const result = await handleVerifyPhoneOtp(otp);
    show(result);
    if (result.success) {
      setOtpSent(false);
      setOtp('');
    }
  };

  // The saved number is the one that gets verified.
  const canVerifyPhone =
    user.phone && !user.mobileVerification && form.phone === user.phone;
  const initials = `${user.name?.firstName?.[0] || ''}${user.name?.lastName?.[0] || ''}`;

  return (
    <section className={cardCls}>
      <h2 className={cardTitleCls}>Profile</h2>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden bg-panel">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.name?.firstName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-accent font-display text-2xl font-bold uppercase text-ink">
              {initials}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`${ghostBtnCls} flex items-center gap-2`}
        >
          <FiCamera className="h-4 w-4" />
          Change Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleAvatarChange}
        />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={`${labelCls} mb-0`}>Email</span>
            <VerifiedBadge verified={user.emailVerification} />
          </div>
          <input className={inputCls} value={user.email} disabled />
          {!user.emailVerification && (
            <button
              type="button"
              onClick={async () => show(await handleResendVerification())}
              className="mt-2 font-display text-[11px] uppercase tracking-wide text-accent underline-offset-4 hover:underline"
            >
              Resend verification email
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-first" className={labelCls}>
              First Name
            </label>
            <input
              id="profile-first"
              name="firstName"
              required
              className={inputCls}
              value={form.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="profile-last" className={labelCls}>
              Last Name
            </label>
            <input
              id="profile-last"
              name="lastName"
              className={inputCls}
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label htmlFor="profile-phone" className={`${labelCls} mb-0`}>
              Phone Number
            </label>
            {user.phone && <VerifiedBadge verified={user.mobileVerification} />}
          </div>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            minLength={10}
            className={inputCls}
            value={form.phone}
            onChange={handleChange}
          />
          {canVerifyPhone && !otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              className="mt-2 font-display text-[11px] uppercase tracking-wide text-accent underline-offset-4 hover:underline"
            >
              Send verification code
            </button>
          )}
          {canVerifyPhone && otpSent && (
            <div className="mt-3 flex gap-2">
              <input
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                className={inputCls}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                type="button"
                onClick={handleConfirmOtp}
                className={ghostBtnCls}
              >
                Verify
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button type="submit" disabled={saving} className={primaryBtnCls}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {feedback && (
            <p className={feedbackCls[feedback.type]}>{feedback.message}</p>
          )}
        </div>
      </form>
    </section>
  );
};

export default ProfileCard;
