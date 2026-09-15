import { getSettings } from '../service/settings.api.js';
import { readError } from '../../../shared/api/request.js';

/* Store settings are only needed locally by the pages that show them. */
export const useSettings = () => {
  const handleGetSettings = async () => {
    try {
      const data = await getSettings();
      return { success: true, settings: data.settings };
    } catch (error) {
      return { success: false, error: readError(error, 'Failed to fetch settings') };
    }
  };

  return { handleGetSettings };
};
