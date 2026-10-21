import React, { useState } from 'react';
import { Calendar, Clock, Download, X, Check } from 'lucide-react';

interface CalendarReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK: Array<{ value: number; code: string; label: string }> = [
  { value: 0, code: 'SU', label: 'Sunday' },
  { value: 1, code: 'MO', label: 'Monday' },
  { value: 2, code: 'TU', label: 'Tuesday' },
  { value: 3, code: 'WE', label: 'Wednesday' },
  { value: 4, code: 'TH', label: 'Thursday' },
  { value: 5, code: 'FR', label: 'Friday' },
  { value: 6, code: 'SA', label: 'Saturday' },
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatLocalDateTimeForIcs(d: Date): string {
  return (
    `${d.getFullYear()}` +
    `${pad2(d.getMonth() + 1)}` +
    `${pad2(d.getDate())}` +
    `T` +
    `${pad2(d.getHours())}` +
    `${pad2(d.getMinutes())}` +
    `${pad2(d.getSeconds())}`
  );
}

function formatUtcDateTimeForIcs(d: Date): string {
  return (
    `${d.getUTCFullYear()}` +
    `${pad2(d.getUTCMonth() + 1)}` +
    `${pad2(d.getUTCDate())}` +
    `T` +
    `${pad2(d.getUTCHours())}` +
    `${pad2(d.getUTCMinutes())}` +
    `${pad2(d.getUTCSeconds())}` +
    `Z`
  );
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export const CalendarReminderModal: React.FC<CalendarReminderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<number>(5); // Default Friday
  const [timeOfDay, setTimeOfDay] = useState<string>('09:30');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const userTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';

  const handleDownloadIcs = () => {
    const [rawHour, rawMinute] = timeOfDay.split(':').map(n => parseInt(n, 10));
    const hour = Number.isFinite(rawHour) ? rawHour : 9;
    const minute = Number.isFinite(rawMinute) ? rawMinute : 30;

    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0,
      0
    );

    const currentDay = start.getDay();
    let daysUntil = (dayOfWeek - currentDay + 7) % 7;
    if (daysUntil === 0 && start.getTime() <= now.getTime()) {
      daysUntil = 7;
    }
    start.setDate(start.getDate() + daysUntil);

    const end = new Date(start.getTime() + 15 * 60 * 1000); // 15-minute event
    const dayEntry =
      DAYS_OF_WEEK.find(d => d.value === dayOfWeek) || DAYS_OF_WEEK[5];

    const appUrl =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://muse.ai';

    const description = `10-minute weekly check-up for your Muse AI setup (Activity log, Approvals, Scheduled tasks, and Memory).\n\nOpen your guide: ${appUrl}`;
    const uid = `muse-weekly-check-${Date.now()}@calmguide.local`;
    const dtStamp = formatUtcDateTimeForIcs(now);
    const dtStartLocal = formatLocalDateTimeForIcs(start);
    const dtEndLocal = formatLocalDateTimeForIcs(end);

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Calm Guide//Muse Weekly Check//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-TIMEZONE:${userTimezone}`,
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;TZID=${userTimezone}:${dtStartLocal}`,
      `DTEND;TZID=${userTimezone}:${dtEndLocal}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${dayEntry.code}`,
      'SUMMARY:Muse weekly check (10 min)',
      `DESCRIPTION:${escapeIcsText(description)}`,
      `URL:${appUrl}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT10M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Muse weekly check (10 min)',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'muse-weekly-check.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-[1px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-reminder-title"
    >
      <div className="w-full max-w-md bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 bg-[#F4F0E8] border-b border-[#E6DFD3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#9A3412]" />
            <h3
              id="calendar-reminder-title"
              className="font-serif text-base font-medium text-stone-900"
            >
              Add weekly check to your calendar
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-[#E6DFD3]/60 transition-colors"
            aria-label="Close calendar reminder picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            Pick a regular day and time for a 10-minute weekly check-up. We&apos;ll download a
            calendar file (<code className="text-xs bg-[#F4F0E8] px-1.5 py-0.5 rounded">.ics</code>)
            that works with Apple Calendar, Google Calendar, and Outlook.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="weekly-check-day"
                className="block text-xs font-medium text-stone-700 mb-1.5"
              >
                Day of week
              </label>
              <select
                id="weekly-check-day"
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E6DFD3] rounded-lg text-stone-900 focus:outline-none focus:border-[#9A3412]"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.code} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="weekly-check-time"
                className="block text-xs font-medium text-stone-700 mb-1.5"
              >
                Time
              </label>
              <div className="relative">
                <input
                  id="weekly-check-time"
                  type="time"
                  value={timeOfDay}
                  onChange={e => setTimeOfDay(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E6DFD3] rounded-lg text-stone-900 focus:outline-none focus:border-[#9A3412]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-[#F4F0E8]/70 border border-[#E6DFD3] px-3.5 py-2.5 text-xs text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-800 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>Muse weekly check (10 min)</span>
            </div>
            <p>
              Repeats weekly · 15-minute slot · 10-minute alert · Time zone:{' '}
              <span className="font-medium text-stone-800">{userTimezone}</span>
            </p>
          </div>

          <div className="pt-1 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-[#E6DFD3] bg-white hover:bg-[#F4F0E8] text-xs font-medium text-stone-700 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-medium transition-colors shadow-xs"
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Downloaded .ics file</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download calendar file (.ics)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
