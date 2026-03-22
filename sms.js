require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Send an SMS message via Twilio.
 * Uses a Messaging Service SID when TWILIO_MESSAGING_SERVICE_SID is set
 * (required for toll-free numbers); falls back to TWILIO_PHONE_NUMBER otherwise.
 * @param {string} to   - E.164 phone number e.g. +15551234567
 * @param {string} body - Message text
 */
async function sendSMS(to, body) {
  const params = messagingServiceSid
    ? { body, messagingServiceSid, to }
    : { body, from: fromNumber, to };
  const message = await client.messages.create(params);
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

module.exports = { sendSMS, buildTwiML, validateTwilioSignature };
