import { getSettings, updateSettings } from '../service/settings.api.js';
import { readError } from '../../../shared/api/request.js';

/* Store settings are only needed locally by the pages that show them. */
export const useSettings = () => {
  const run = async (call, fallback) => {
    try {
      const data = await call();
      return { success: true, message: data.message, settings: data.settings };
    } catch (error) {
      return { success: false, error: readError(error, fallback) };
    }
  };

  return {
    handleGetSettings: () => run(getSettings, 'Failed to fetch settings'),
    handleUpdateSettings: (payload) =>
      run(() => updateSettings(payload), 'Failed to update settings'),
  };
};
