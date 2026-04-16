require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const fromNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Send an SMS message via Twilio.
 * @param {string} to   - E.164 phone number e.g. +15551234567
 * @param {string} body - Message text
 */
async function sendSMS(to, body) {
  const message = await client.messages.create({ body, from: fromNumber, to });
  console.log(`[SMS] Sent to ${to} — SID: ${message.sid}`);
  return message;
}

/**
 * Build a TwiML response string for incoming webhook replies.
 * @param {string} message - The text to reply with
 */
function buildTwiML(message) {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();
  twiml.message(message);
  return twiml.toString();
}

/**
 * Validate that a webhook request genuinely came from Twilio.
 * Should only be used in production where HTTPS is enforced.
 */
function validateTwilioSignature(authToken, signature, url, params) {
  return twilio.validateRequest(authToken, signature, url, params);
}

/**
 * Send the combined compliance + onboarding welcome message to a new member.
 * Merges what was previously two separate SMS sends into one to save segments.
 */
async function sendWelcomeSMS(phone, name) {
  const body =
    `Hi ${name}! You're signed up for Daily Gratitude - one morning prompt each day. ` +
    `When would you like it? Reply 1=8am, 2=9am, 3=7am or any time like "10am". ` +
    `Reply STOP to unsubscribe. Msg & data rates may apply.`;
  return sendSMS(phone, body);
}

module.exports = { sendSMS, sendWelcomeSMS, buildTwiML, validateTwilioSignature };
