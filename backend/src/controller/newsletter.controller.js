import newsletterModel from '../model/newsletter.model.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    await newsletterModel.subscribe(req.body.email);
    return res.status(200).json({
      success: true,
      message: 'You are subscribed to drop alerts',
    });
  } catch (error) {
    console.error('subscribeNewsletter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe',
    });
  }
};
