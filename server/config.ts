import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  geminiApiKey: string;
  appUrl: string;
  liveModel: string;
  textModel: string;
  textModelFallback: string;
  bookingUrl: string;
  sheetWebhookUrl: string;
  sheetWebhookSecret: string;
  sheetUrl: string;
  ownerEmail: string;
  ownerName: string;
  ownerTimezone: string;
  adminEmails: string[];
  port: number;
}

const defaultBookingUrl = process.env.BOOKING_URL || 'https://cal.com/zateslo/grab-some-human-time-with-nic';

const parsedAdminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

export const config: AppConfig = {
  geminiApiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  liveModel: (process.env.LIVE_MODEL || 'gemini-3.8-live').trim(),
  textModel: (process.env.TEXT_MODEL || 'gemini-3.8-flash').trim(),
  textModelFallback: (process.env.TEXT_MODEL_FALLBACK || '').trim(),
  bookingUrl: defaultBookingUrl,
  sheetWebhookUrl: (process.env.SHEET_WEBHOOK_URL || '').trim(),
  sheetWebhookSecret: (process.env.SHEET_WEBHOOK_SECRET || '').trim(),
  sheetUrl: (process.env.SHEET_URL || '').trim(),
  ownerEmail: process.env.OWNER_EMAIL || 'nic@zateslo.com',
  ownerName: process.env.OWNER_NAME || 'Nic',
  ownerTimezone: process.env.OWNER_TIMEZONE || 'America/New_York',
  adminEmails: parsedAdminEmails,
  port: parseInt(process.env.PORT || '3000', 10),
};
