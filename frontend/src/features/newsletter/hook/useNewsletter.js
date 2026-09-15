import { subscribe } from '../service/newsletter.api.js';
import { readError } from '../../../shared/api/request.js';

export const useNewsletter = () => {
  const handleSubscribe = async (email) => {
    try {
      const data = await subscribe(email);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: readError(error, 'Failed to subscribe') };
    }
  };

  return { handleSubscribe };
};
