import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  geminiApiKey: string;
  appUrl: string;
  liveModel: string;
  liveModelDeep: string;
  textModel: string;
  calendarIcsUrl: string;
  bookingUrl: string;
  calUsername: string;
  calEventSlug: string;
  escalationWebhookUrl: string;
  ownerEmail: string;
  ownerName: string;
  ownerTimezone: string;
  workingHours: string;
  adminPasscode: string;
  port: number;
}

const defaultBookingUrl = process.env.BOOKING_URL || 'https://cal.com/zateslo/grab-some-human-time-with-nic';

// Parse username and slug from cal.com booking url if possible
function parseCalComUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('cal.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return { username: parts[0], slug: parts[1] };
      }
    }
  } catch {}
  return { username: 'zateslo', slug: 'grab-some-human-time-with-nic' };
}

const parsedCal = parseCalComUrl(defaultBookingUrl);

export const config: AppConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  liveModel: process.env.LIVE_MODEL || 'gemini-3.8-live',
  liveModelDeep: process.env.LIVE_MODEL_DEEP || 'gemini-3.8-live-extended-thinking',
  textModel: process.env.TEXT_MODEL || 'gemini-3-flash-preview',
  calendarIcsUrl: process.env.CALENDAR_ICS_URL || '',
  bookingUrl: defaultBookingUrl,
  calUsername: process.env.CAL_USERNAME || parsedCal.username,
  calEventSlug: process.env.CAL_EVENT_SLUG || parsedCal.slug,
  escalationWebhookUrl: process.env.ESCALATION_WEBHOOK_URL || '',
  ownerEmail: process.env.OWNER_EMAIL || 'nic@zateslo.com',
  ownerName: process.env.OWNER_NAME || 'Nic',
  ownerTimezone: process.env.OWNER_TIMEZONE || 'America/New_York',
  workingHours: process.env.WORKING_HOURS || 'Mon-Fri 10:00-16:00',
  adminPasscode: process.env.ADMIN_PASSCODE || 'muse2026',
  port: parseInt(process.env.PORT || '3000', 10),
};

