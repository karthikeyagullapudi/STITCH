import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware.js';
import {
  getDashboard,
  getAnalytics,
  getCustomers,
  updateCustomerStatus,
  getAdmins,
  updateAdminApproval,
} from '../controller/admin.controller.js';
import {
  analyticsValidator,
  customerStatusValidator,
  adminApprovalValidator,
} from '../validator/admin.validator.js';

const adminRouter = Router();

adminRouter.get('/dashboard', authAdmin, getDashboard);
adminRouter.get('/analytics', authAdmin, analyticsValidator, getAnalytics);
adminRouter.get('/customers', authAdmin, getCustomers);
adminRouter.patch(
  '/customers/:userId/status',
  authAdmin,
  customerStatusValidator,
  updateCustomerStatus,
);
adminRouter.get('/admins', authAdmin, getAdmins);
adminRouter.patch(
  '/admins/:userId/approval',
  authAdmin,
  adminApprovalValidator,
  updateAdminApproval,
);

export default adminRouter;
