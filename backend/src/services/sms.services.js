import twilio from 'twilio';
import { Config } from '../config/config.js';

// Without Twilio credentials (local development) messages are printed instead.
const client = Config.TWILIO_ACCOUNT_SID
  ? twilio(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
  : null;

export const sendSms = async ({ to, body }) => {
  // Numbers are stored without a country code; the store operates in India.
  const phone = to.startsWith('+') ? to : `+91${to}`;
  if (!client) {
    console.log(`\n[sms] To: ${phone}\n${body}\n`);
    return;
  }
  await client.messages.create({
    from: Config.TWILIO_PHONE_NUMBER,
    to: phone,
    body,
  });
};
