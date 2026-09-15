import couponModel from '../model/coupon.model.js';

// Copies only coupon fields that were actually sent.
const pickCoupon = ({
  code,
  type,
  value,
  minOrderAmount,
  maxDiscount,
  expiresAt,
  usageLimit,
  active,
}) =>
  Object.fromEntries(
    Object.entries({
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      expiresAt,
      usageLimit,
      active,
    }).filter(([, fieldValue]) => fieldValue !== undefined),
  );

const handleCouponError = (res, label, error, message) => {
  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A coupon with this code already exists',
    });
  }
  if (error?.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors)
        .map((e) => e.message)
        .join(', '),
    });
  }
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message });
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      message: 'Coupons fetched successfully',
      coupons,
    });
  } catch (error) {
    return handleCouponError(res, 'getCoupons', error, 'Failed to fetch coupons');
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.create(pickCoupon(req.body));
    return res.status(201).json({
      success: true,
      message: 'Coupon created',
      coupon,
    });
  } catch (error) {
    return handleCouponError(res, 'createCoupon', error, 'Failed to create coupon');
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.findById(req.params.couponId);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found' });
    }

    coupon.set(pickCoupon(req.body));
    await coupon.save();
    return res.status(200).json({
      success: true,
      message: 'Coupon updated',
      coupon,
    });
  } catch (error) {
    return handleCouponError(res, 'updateCoupon', error, 'Failed to update coupon');
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.findByIdAndDelete(req.params.couponId);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found' });
    }
    return res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    return handleCouponError(res, 'deleteCoupon', error, 'Failed to delete coupon');
  }
};
