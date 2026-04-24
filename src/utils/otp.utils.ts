import { createHmac } from "crypto";
import twilio from "twilio";

export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID as string;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN as string;
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER as string;
export const SMS_SECRET_TOKEN = process.env.SMS_SECRET_TOKEN as string;

// Twilio Client
export const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Generate 4–6 digit OTP
const generateOtpCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Generate OTP and hash
 */
export async function generateOtpAndTokenHash(
  phoneNumber: string
): Promise<{ otp: string; xMagicToken: string }> {
  const otp = generateOtpCode();
  const ttl = 2 * 60 * 1000; // 2 minutes
  const expiresIn = Date.now() + ttl;

  const data = `${phoneNumber}.${otp}.${expiresIn}`;
  const crytoHash256 = createHmac("sha256", SMS_SECRET_TOKEN)
    .update(data)
    .digest("hex");

  const xMagicToken = `${crytoHash256}.${expiresIn}`;

  return { otp, xMagicToken };
}

/**
 * Send OTP via Twilio SMS
 */
export async function sendOtpSms(phoneNumber: string, otp: string) {
  return twilioClient.messages.create({
    from: TWILIO_PHONE_NUMBER,
    to: phoneNumber,
    body: `Your OTP code is ${otp}. It is valid for 2 minutes.`,
  });
}
