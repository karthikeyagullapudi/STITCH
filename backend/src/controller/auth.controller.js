import { Config } from '../config/config.js';
import userModel, { hashToken } from '../model/user.model.js';
import newsletterModel from '../model/newsletter.model.js';
import { sendEmail } from '../services/email.services.js';
import jwt from 'jsonwebtoken';

const DAY = 24 * 60 * 60 * 1000;

// In production the API and storefront live on different domains, so the
// cookie must be HTTPS-only and allowed cross-site.
const isProduction = Config.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};

// One message for every credential failure so login can't be used to find
// out which emails have accounts.
const INVALID_LOGIN =
  'Invalid email or password. If you signed up with Google, continue with Google.';

// "Remember me" keeps the session for 30 days instead of 1.
const setTokenCookie = (res, user, remember = false) => {
  const maxAge = (remember ? 30 : 1) * DAY;
  const token = jwt.sign({ id: user._id }, Config.JWT_SECRET, {
    expiresIn: maxAge / 1000,
  });
  res.cookie('token', token, { ...cookieOptions, maxAge });
};

// The token only travels in the httpOnly cookie, never in the JSON body.
const sendTokenResponse = async (user, res, message, remember) => {
  setTokenCookie(res, user, remember);
  // Same shape as GET /me so the client has addresses, verification, etc.
  const { password, ...safeUser } = user.toObject();

  return res.status(200).json({
    success: true,
    message,
    user: safeUser,
  });
};

const sendVerificationEmail = async (user) => {
  const token = user.createToken('emailVerification');
  await user.save();
  await sendEmail({
    to: user.email,
    subject: 'Verify your STITCH email',
    html: `<p>Hi ${user.name.firstName},</p>
      <p>Confirm your email address to finish setting up your account:</p>
      <p><a href="${Config.CLIENT_URL}/verify-email/${token}">Verify email</a></p>
      <p>This link expires in 24 hours.</p>`,
  });
};

export const userRegister = async (req, res) => {
  try {
    const { email, password, name, role, phone, newsletter } = req.body;
    const userExists = await userModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Whitelist fields so clients can't set approval/verification flags.
    const user = await userModel.create({ email, password, name, role, phone });
    if (newsletter) await newsletterModel.subscribe(email);

    // Registration succeeds even if the email fails; it can be resent later.
    sendVerificationEmail(user).catch((error) =>
      console.error('Verification email error:', error),
    );

    const createdUser = await userModel.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: createdUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password, role = 'user', remember } = req.body;

    const user = await userModel.findOne({ email });
    // Google-only accounts have no password to compare against.
    if (!user?.password || !(await user.comparePasswords(password))) {
      return res.status(401).json({ success: false, message: INVALID_LOGIN });
    }

    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message:
          role === 'admin'
            ? 'This account is not an admin account. Please use the user login.'
            : 'This is an admin account. Please use the admin login.',
      });
    }

    if (user.role === 'admin' && !user.adminApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your admin account is pending approval.',
      });
    }

    return sendTokenResponse(
      user,
      res,
      'User logged in successfully',
      remember === true || remember === 'true',
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const userLogout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const googleAuthCallBack = async (req, res) => {
  try {
    const { id, displayName, emails, photos } = req.user;
    const email = emails?.[0]?.value;
    const profilePic = photos?.[0]?.value;

    if (!email) {
      return res.redirect(
        `${Config.CLIENT_URL}/login?error=google_auth_failed`,
      );
    }

    let user = await userModel.findOne({ email: email });
    if (!user) {
      user = await userModel.create({
        email: email,
        googleId: id,
        name: { firstName: displayName },
        profilePic,
        // Google has already verified this address.
        emailVerification: true,
      });
    } else if (!user.googleId || !user.emailVerification) {
      user.googleId = user.googleId || id;
      user.emailVerification = true;
      await user.save();
    }

    if (!user.status) {
      return res.redirect(`${Config.CLIENT_URL}/login?error=account_blocked`);
    }

    setTokenCookie(res, user);
    res.redirect(`${Config.CLIENT_URL}/`);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.redirect(`${Config.CLIENT_URL}/login?error=google_auth_failed`);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      const token = user.createToken('resetPassword');
      await user.save();
      await sendEmail({
        to: user.email,
        subject: 'Reset your STITCH password',
        html: `<p>Hi ${user.name.firstName},</p>
          <p>Use the link below to choose a new password:</p>
          <p><a href="${Config.CLIENT_URL}/reset-password/${token}">Reset password</a></p>
          <p>This link expires in 1 hour. If you didn't ask for this, ignore this email.</p>`,
      });
    }

    // Same response either way so this doesn't reveal which emails exist.
    return res.status(200).json({
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reset link',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const user = await userModel.findOne({
      resetPasswordToken: hashToken(req.params.token),
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated. You can now sign in.',
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const user = await userModel.findOne({
      emailVerificationToken: hashToken(req.params.token),
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This verification link is invalid or has expired',
      });
    }

    user.emailVerification = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Your email is verified',
    });
  } catch (error) {
    console.error('verifyEmail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify email',
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    if (req.user.emailVerification) {
      return res.status(400).json({
        success: false,
        message: 'Your email is already verified',
      });
    }

    await sendVerificationEmail(req.user);
    return res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('resendVerificationEmail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
    });
  }
};
