import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware.js';
import {
  getSettings,
  updateSettings,
} from '../controller/settings.controller.js';
import { updateSettingsValidator } from '../validator/settings.validator.js';

const settingsRouter = Router();

// Public — the storefront shows shipping thresholds.
settingsRouter.get('/', getSettings);
settingsRouter.patch('/', authAdmin, updateSettingsValidator, updateSettings);

export default settingsRouter;
