import settingsModel from '../model/settings.model.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await settingsModel.getSettings();
    return res.status(200).json({
      success: true,
      message: 'Settings fetched successfully',
      settings,
    });
  } catch (error) {
    console.error('getSettings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { taxRate, shippingFee, freeShippingThreshold } = req.body;
    const settings = await settingsModel.getSettings();
    if (taxRate !== undefined) settings.taxRate = taxRate;
    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (freeShippingThreshold !== undefined) {
      settings.freeShippingThreshold = freeShippingThreshold;
    }

    await settings.save();
    return res.status(200).json({
      success: true,
      message: 'Settings updated',
      settings,
    });
  } catch (error) {
    console.error('updateSettings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
};
