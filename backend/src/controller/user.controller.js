import userModel, { hashToken } from '../model/user.model.js';
import { uploadFile } from '../services/storage.services.js';
import { sendSms } from '../services/sms.services.js';

// Only these address fields are ever copied from the request body.
const pickAddress = ({
  fullName,
  phone,
  line1,
  line2,
  city,
  state,
  postalCode,
  country,
}) => ({ fullName, phone, line1, line2, city, state, postalCode, country });

const respondWithUser = (res, user, message, status = 200) =>
  res.status(status).json({ success: true, message, user });

const serverError = (res, label, error, message) => {
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message });
};

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = req.user;

    if (name?.firstName !== undefined) user.name.firstName = name.firstName;
    if (name?.lastName !== undefined) user.name.lastName = name.lastName;

    if (phone !== undefined && phone !== user.phone) {
      const taken = await userModel.exists({ phone, _id: { $ne: user._id } });
      if (taken) {
        return res.status(409).json({
          success: false,
          message: 'This phone number is already in use',
        });
      }
      user.phone = phone;
      user.mobileVerification = false;
    }

    await user.save();
    return respondWithUser(res, user, 'Profile updated');
  } catch (error) {
    return serverError(res, 'updateProfile', error, 'Failed to update profile');
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user._id);

    // Google-only accounts have no password yet and may set one directly.
    if (user.password && !(await user.comparePasswords(currentPassword || ''))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    return serverError(res, 'changePassword', error, 'Failed to update password');
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Choose an image to upload',
      });
    }

    const { fileUrl } = await uploadFile({
      buffer: req.file.buffer,
      fileName: req.file.originalname,
      foulder: 'stitch/avatars',
    });
    req.user.profilePic = fileUrl;
    await req.user.save();
    return respondWithUser(res, req.user, 'Profile photo updated');
  } catch (error) {
    return serverError(res, 'uploadAvatar', error, 'Failed to upload photo');
  }
};

/* ------------------------------------------------------------------ */
/* Address book                                                        */
/* ------------------------------------------------------------------ */

// Exactly one address stays default while any exist.
const setDefaultAddress = (user, addressId) => {
  user.addresses.forEach((address) => {
    address.isDefault = String(address._id) === String(addressId);
  });
};

export const addAddress = async (req, res) => {
  try {
    const user = req.user;
    user.addresses.push(pickAddress(req.body));
    const added = user.addresses[user.addresses.length - 1];
    if (req.body.isDefault || user.addresses.length === 1) {
      setDefaultAddress(user, added._id);
    }

    await user.save();
    return respondWithUser(res, user, 'Address added', 201);
  } catch (error) {
    return serverError(res, 'addAddress', error, 'Failed to add address');
  }
};

export const updateAddress = async (req, res) => {
  try {
    const user = req.user;
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: 'Address not found' });
    }

    address.set(pickAddress(req.body));
    if (req.body.isDefault) setDefaultAddress(user, address._id);

    await user.save();
    return respondWithUser(res, user, 'Address updated');
  } catch (error) {
    return serverError(res, 'updateAddress', error, 'Failed to update address');
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = req.user;
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: 'Address not found' });
    }

    user.addresses.pull(address._id);
    if (address.isDefault && user.addresses.length > 0) {
      setDefaultAddress(user, user.addresses[0]._id);
    }

    await user.save();
    return respondWithUser(res, user, 'Address removed');
  } catch (error) {
    return serverError(res, 'deleteAddress', error, 'Failed to remove address');
  }
};

/* ------------------------------------------------------------------ */
/* Phone verification                                                  */
/* ------------------------------------------------------------------ */

export const sendPhoneOtp = async (req, res) => {
  try {
    const user = req.user;
    if (!user.phone) {
      return res.status(400).json({
        success: false,
        message: 'Add a phone number to your profile first',
      });
    }
    if (user.mobileVerification) {
      return res.status(400).json({
        success: false,
        message: 'Your phone number is already verified',
      });
    }

    const otp = user.createToken('mobileOtp');
    await user.save();
    await sendSms({
      to: user.phone,
      body: `Your STITCH verification code is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent',
    });
  } catch (error) {
    return serverError(res, 'sendPhoneOtp', error, 'Failed to send code');
  }
};

export const verifyPhoneOtp = async (req, res) => {
  try {
    const user = await userModel
      .findOne({
        _id: req.user._id,
        mobileOtpToken: hashToken(req.body.otp),
        mobileOtpExpires: { $gt: Date.now() },
      })
      .select('-password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The code is invalid or has expired',
      });
    }

    user.mobileVerification = true;
    user.mobileOtpToken = undefined;
    user.mobileOtpExpires = undefined;
    await user.save();
    return respondWithUser(res, user, 'Phone number verified');
  } catch (error) {
    return serverError(res, 'verifyPhoneOtp', error, 'Failed to verify code');
  }
};
