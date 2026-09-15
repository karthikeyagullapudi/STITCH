import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/* Reused as the shipping-address snapshot on orders. */
export const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, default: 'India', trim: true },
  isDefault: { type: Boolean, default: false },
});

// Only hashes of one-time tokens and OTPs are ever stored.
export const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

const TOKEN_TTL = {
  resetPassword: 60 * 60 * 1000,
  emailVerification: 24 * 60 * 60 * 1000,
  mobileOtp: 10 * 60 * 1000,
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      required: false,
    },
    name: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: false,
      },
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    adminApproved: {
      type: Boolean,
      default: false,
      required: function () {
        return this.role === 'admin';
      },
    },
    emailVerification: {
      type: Boolean,
      default: false,
    },
    mobileVerification: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    mobileOtpToken: { type: String, select: false },
    mobileOtpExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePasswords = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Issues a one-time token ('resetPassword' | 'emailVerification' | 'mobileOtp')
// and stores its hash + expiry. Returns the raw value to send to the user.
userSchema.methods.createToken = function (type) {
  const token =
    type === 'mobileOtp'
      ? String(crypto.randomInt(100000, 1000000))
      : crypto.randomBytes(32).toString('hex');
  this[`${type}Token`] = hashToken(token);
  this[`${type}Expires`] = Date.now() + TOKEN_TTL[type];
  return token;
};

const userModel = mongoose.model('users', userSchema);
export default userModel;
