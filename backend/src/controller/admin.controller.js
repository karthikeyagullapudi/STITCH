import orderModel from '../model/order.model.js';
import userModel from '../model/user.model.js';
import productModel from '../model/product.model.js';
import { getPagination, escapeRegex } from '../utils/query.js';

const DAY = 24 * 60 * 60 * 1000;
const LOW_STOCK_THRESHOLD = 5;
// Daily analytics buckets follow the store's local day.
const STORE_TIMEZONE = 'Asia/Kolkata';

// Revenue only counts orders that are still paid (refunds are excluded).
const PAID = { 'payment.status': 'paid' };
const PLACED = { 'payment.status': { $in: ['paid', 'refunded'] } };

const storeDay = (date) =>
  date.toLocaleDateString('en-CA', { timeZone: STORE_TIMEZONE });

const serverError = (res, label, error, message) => {
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message });
};

export const getDashboard = async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * DAY);
    const [sales, customers, activeProducts, recentOrders, lowStock] =
      await Promise.all([
        orderModel.aggregate([
          { $match: { ...PAID, createdAt: { $gte: since } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: '$pricing.total' },
              orders: { $sum: 1 },
            },
          },
        ]),
        userModel.countDocuments({ role: 'user' }),
        productModel.countDocuments({ status: 'active' }),
        orderModel
          .find(PLACED)
          .populate('user', 'name email')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        productModel
          .find({
            status: 'active',
            trackQuantity: true,
            stock: { $lte: LOW_STOCK_THRESHOLD },
          })
          .select('title stock images')
          .sort({ stock: 1 })
          .limit(5)
          .lean(),
      ]);

    return res.status(200).json({
      success: true,
      message: 'Dashboard fetched successfully',
      stats: {
        revenue: sales[0]?.revenue || 0,
        orders: sales[0]?.orders || 0,
        customers,
        activeProducts,
      },
      recentOrders,
      lowStock,
    });
  } catch (error) {
    return serverError(res, 'getDashboard', error, 'Failed to fetch dashboard');
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    // Midnight (store time) at the start of the range.
    const since = new Date(
      new Date(`${storeDay(new Date())}T00:00:00+05:30`).getTime() -
        (days - 1) * DAY,
    );
    const paidInRange = { ...PAID, createdAt: { $gte: since } };

    const [daily, byStatus, topProducts] = await Promise.all([
      orderModel.aggregate([
        { $match: paidInRange },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: STORE_TIMEZONE,
              },
            },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
          },
        },
      ]),
      orderModel.aggregate([
        { $match: { ...PLACED, createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      orderModel.aggregate([
        { $match: paidInRange },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            title: { $first: '$items.title' },
            quantity: { $sum: '$items.quantity' },
            revenue: {
              $sum: { $multiply: ['$items.quantity', '$items.price.amount'] },
            },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // One entry per day, including days without sales.
    const salesByDay = new Map(daily.map((day) => [day._id, day]));
    const revenueByDay = Array.from({ length: days }, (_, index) => {
      const date = storeDay(new Date(since.getTime() + index * DAY));
      return {
        date,
        revenue: salesByDay.get(date)?.revenue || 0,
        orders: salesByDay.get(date)?.orders || 0,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Analytics fetched successfully',
      days,
      revenueByDay,
      ordersByStatus: byStatus.map(({ _id, count }) => ({ status: _id, count })),
      topProducts,
    });
  } catch (error) {
    return serverError(res, 'getAnalytics', error, 'Failed to fetch analytics');
  }
};

export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = { role: 'user' };
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { email: pattern },
        { phone: pattern },
        { 'name.firstName': pattern },
        { 'name.lastName': pattern },
      ];
    }

    const [customers, total] = await Promise.all([
      userModel
        .find(filter)
        .select('name email phone status emailVerification profilePic createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      userModel.countDocuments(filter),
    ]);

    const spend = await orderModel.aggregate([
      {
        $match: { ...PAID, user: { $in: customers.map((c) => c._id) } },
      },
      {
        $group: {
          _id: '$user',
          orders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
        },
      },
    ]);
    const spendByUser = new Map(spend.map((row) => [String(row._id), row]));

    return res.status(200).json({
      success: true,
      message: 'Customers fetched successfully',
      customers: customers.map((customer) => ({
        ...customer,
        orders: spendByUser.get(String(customer._id))?.orders || 0,
        totalSpent: spendByUser.get(String(customer._id))?.totalSpent || 0,
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError(res, 'getCustomers', error, 'Failed to fetch customers');
  }
};

// Blocks or unblocks a customer account.
export const updateCustomerStatus = async (req, res) => {
  try {
    const customer = await userModel
      .findOneAndUpdate(
        { _id: req.params.userId, role: 'user' },
        { $set: { status: req.body.status } },
        { returnDocument: 'after' },
      )
      .select('name email phone status emailVerification profilePic createdAt');
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: 'Customer not found' });
    }
    return res.status(200).json({
      success: true,
      message: customer.status ? 'Customer unblocked' : 'Customer blocked',
      customer,
    });
  } catch (error) {
    return serverError(res, 'updateCustomerStatus', error, 'Failed to update customer');
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await userModel
      .find({ role: 'admin' })
      .select('name email adminApproved createdAt')
      .sort({ adminApproved: 1, createdAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      message: 'Admins fetched successfully',
      admins,
    });
  } catch (error) {
    return serverError(res, 'getAdmins', error, 'Failed to fetch admins');
  }
};

export const updateAdminApproval = async (req, res) => {
  try {
    if (String(req.params.userId) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You can't change your own approval",
      });
    }

    const admin = await userModel
      .findOneAndUpdate(
        { _id: req.params.userId, role: 'admin' },
        { $set: { adminApproved: req.body.approved } },
        { returnDocument: 'after' },
      )
      .select('name email adminApproved createdAt');
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    }
    return res.status(200).json({
      success: true,
      message: admin.adminApproved ? 'Admin approved' : 'Admin access revoked',
      admin,
    });
  } catch (error) {
    return serverError(res, 'updateAdminApproval', error, 'Failed to update admin');
  }
};
