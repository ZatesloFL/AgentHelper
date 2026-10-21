import ical from 'node-ical';
import { config } from './config.js';

interface BusySlot {
  start: Date;
  end: Date;
}

export interface ProposedSlot {
  startIso: string;
  endIso: string;
  displayFormatted: string; // Formatted in user's timezone
  ownerFormatted: string;   // Formatted in owner's timezone
}

let cachedBusySlots: BusySlot[] = [];
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetches and parses the private CALENDAR_ICS_URL strictly on the server.
 * Never stores or transmits event titles or attendees.
 */
export async function getBusySlots(): Promise<BusySlot[]> {
  const now = Date.now();
  if (now - lastCacheTime < CACHE_TTL_MS && cachedBusySlots.length > 0) {
    return cachedBusySlots;
  }

  const icsUrl = config.calendarIcsUrl;
  if (!icsUrl) {
    return [];
  }

  try {
    const webEvents = await ical.async.fromURL(icsUrl);
    const slots: BusySlot[] = [];
    const minDate = new Date();
    const maxDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    for (const key of Object.keys(webEvents)) {
      const ev: any = webEvents[key];
      if (!ev) continue;
      if (ev.type === 'VEVENT') {
        if (ev.rrule) {
          try {
            const occurrences = ev.rrule.between(minDate, maxDate);
            const duration = ev.end ? ev.end.getTime() - ev.start.getTime() : 30 * 60 * 1000;
            for (const occ of occurrences) {
              slots.push({
                start: occ,
                end: new Date(occ.getTime() + duration),
              });
            }
          } catch {
            if (ev.start && ev.end) {
              slots.push({ start: new Date(ev.start), end: new Date(ev.end) });
            }
          }
        } else if (ev.start && ev.end) {
          slots.push({
            start: new Date(ev.start),
            end: new Date(ev.end),
          });
        }
      }
    }

    cachedBusySlots = slots;
    lastCacheTime = now;
    return slots;
  } catch (err) {
    console.error('Failed to parse CALENDAR_ICS_URL:', err);
    return cachedBusySlots;
  }
}

/**
 * Queries Cal.com API v2 for real-time slots.
 * Endpoint: GET https://api.cal.com/v2/slots?username=...&eventTypeSlug=...
 * Header: cal-api-version: 2024-09-04
 */
async function fetchCalComSlots(
  userTimezone: string = 'America/New_York'
): Promise<ProposedSlot[]> {
  const username = config.calUsername;
  const eventSlug = config.calEventSlug;

  if (!username || !eventSlug) {
    return [];
  }

  const now = new Date();
  const minTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // at least 24h out
  const maxTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days out

  const startDateStr = minTime.toISOString().split('T')[0];
  const endDateStr = maxTime.toISOString().split('T')[0];

  const url = `https://api.cal.com/v2/slots?username=${encodeURIComponent(username)}&eventTypeSlug=${encodeURIComponent(eventSlug)}&start=${startDateStr}&end=${endDateStr}&format=range&timeZone=${encodeURIComponent(userTimezone)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'cal-api-version': '2024-09-04',
      },
    });

    if (!res.ok) {
      console.warn(`Cal.com API returned status ${res.status}`);
      return [];
    }

    const json: any = await res.json();
    const data = json.data;
    if (!data || typeof data !== 'object') {
      return [];
    }

    // data is structured as { "YYYY-MM-DD": [ { start: "...", end: "..." }, ... ] }
    const validSlots: { start: Date; end: Date }[] = [];

    // Iterate through dates in chronological order
    const dateKeys = Object.keys(data).sort();
    for (const dateKey of dateKeys) {
      const daySlots = data[dateKey];
      if (Array.isArray(daySlots)) {
        for (const slot of daySlots) {
          if (slot.start && slot.end) {
            const startD = new Date(slot.start);
            const endD = new Date(slot.end);
            if (startD >= minTime) {
              validSlots.push({ start: startD, end: endD });
            }
          }
        }
      }
    }

    if (validSlots.length === 0) {
      return [];
    }

    // Pick up to 3 well-distributed slots (e.g. across different days or morning/afternoon)
    const selected: { start: Date; end: Date }[] = [];
    const usedDays = new Set<string>();

    // First pass: pick 1 slot per day for variety
    for (const slot of validSlots) {
      const dayKey = slot.start.toDateString();
      if (!usedDays.has(dayKey)) {
        selected.push(slot);
        usedDays.add(dayKey);
        if (selected.length >= 3) break;
      }
    }

    // If still need slots, fill from remaining
    if (selected.length < 3) {
      for (const slot of validSlots) {
        if (!selected.includes(slot)) {
          selected.push(slot);
          if (selected.length >= 3) break;
        }
      }
    }

    // Format proposed slots
    return selected.map(slot => {
      let userDisplay = '';
      try {
        userDisplay = new Intl.DateTimeFormat('en-US', {
          timeZone: userTimezone,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        }).format(slot.start);
      } catch {
        userDisplay = slot.start.toUTCString();
      }

      let ownerDisplay = '';
      try {
        ownerDisplay = new Intl.DateTimeFormat('en-US', {
          timeZone: config.ownerTimezone,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        }).format(slot.start);
      } catch {
        ownerDisplay = slot.start.toISOString();
      }

      return {
        startIso: slot.start.toISOString(),
        endIso: slot.end.toISOString(),
        displayFormatted: userDisplay,
        ownerFormatted: ownerDisplay,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch slots from Cal.com API:', err);
    return [];
  }
}

/**
 * Fallback slot calculation using ICS feed or working hours
 */
async function proposeFallbackTimes(
  durationMinutes: number = 30,
  userTimezone: string = 'America/New_York'
): Promise<ProposedSlot[]> {
  const busySlots = await getBusySlots();
  const proposed: ProposedSlot[] = [];

  const now = new Date();
  const minTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h out
  const maxTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days out

  const candidate = new Date(minTime);
  candidate.setMinutes(0, 0, 0);

  while (candidate < maxTime && proposed.length < 3) {
    const dayOfWeek = candidate.getDay(); // 1-5 Mon-Fri
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      for (let hour = 10; hour < 16 && proposed.length < 3; hour++) {
        const slotStart = new Date(candidate);
        slotStart.setHours(hour, 0, 0, 0);

        if (slotStart < minTime) continue;

        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

        const hasConflict = busySlots.some(busy => {
          return slotStart < busy.end && slotEnd > busy.start;
        });

        if (!hasConflict) {
          let userDisplay = '';
          try {
            userDisplay = new Intl.DateTimeFormat('en-US', {
              timeZone: userTimezone,
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short',
            }).format(slotStart);
          } catch {
            userDisplay = slotStart.toUTCString();
          }

          let ownerDisplay = '';
          try {
            ownerDisplay = new Intl.DateTimeFormat('en-US', {
              timeZone: config.ownerTimezone,
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short',
            }).format(slotStart);
          } catch {
            ownerDisplay = slotStart.toISOString();
          }

          proposed.push({
            startIso: slotStart.toISOString(),
            endIso: slotEnd.toISOString(),
            displayFormatted: userDisplay,
            ownerFormatted: ownerDisplay,
          });

          hour += 1;
        }
      }
    }

    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(10, 0, 0, 0);
  }

  return proposed;
}

/**
 * Proposes up to 3 slots for human handoff consultation with Nic.
 * Prioritizes real-time Cal.com API v2, falling back smoothly to ICS/working hours.
 */
export async function proposeTimes(
  durationMinutes: number = 30,
  userTimezone: string = 'America/New_York'
): Promise<ProposedSlot[]> {
  // 1. Try real-time Cal.com v2 slots API
  const calComSlots = await fetchCalComSlots(userTimezone);
  if (calComSlots.length > 0) {
    return calComSlots;
  }

  // 2. Fallback to ICS / default working hours calculation
  return proposeFallbackTimes(durationMinutes, userTimezone);
}
