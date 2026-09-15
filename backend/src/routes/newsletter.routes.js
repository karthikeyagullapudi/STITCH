import { Router } from 'express';
import { subscribeNewsletter } from '../controller/newsletter.controller.js';
import { subscribeValidator } from '../validator/newsletter.validator.js';

const newsletterRouter = Router();

newsletterRouter.post('/subscribe', subscribeValidator, subscribeNewsletter);

export default newsletterRouter;
