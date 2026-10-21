import React from 'react';
import { Calendar, ShieldCheck, Send, AlertTriangle } from 'lucide-react';
import {
  AUDIT_AREAS,
  AuditArea,
  AuditRating,
  StoredScorecardCard,
} from '../lib/firebase';

interface ScorecardCardProps {
  scorecard: StoredScorecardCard;
  onOpenCalendarReminder: () => void;
  onSendReportToNic: (scorecard: StoredScorecardCard) => void;
}

const AREA_LABELS: Record<AuditArea, string> = {
  connections: 'Connections',
  approvals: 'Approvals & boundaries',
  scheduled: 'Scheduled tasks',
  memory: 'Memory',
  activity: 'Activity log',
  privacy: 'Privacy & training',
  money: 'Money & sensitive info',
};

const RATING_STYLES: Record<
  AuditRating,
  { dotClass: string; badgeText: string; badgeClass: string }
> = {
  green: {
    dotClass: 'bg-[#14532D]',
    badgeText: 'Green',
    badgeClass: 'text-[#14532D] bg-[#14532D]/10 border-[#14532D]/20',
  },
  amber: {
    dotClass: 'bg-[#B45309]',
    badgeText: 'Amber',
    badgeClass: 'text-[#B45309] bg-[#B45309]/10 border-[#B45309]/25',
  },
  red: {
    dotClass: 'bg-[#991B1B]',
    badgeText: 'Red',
    badgeClass: 'text-[#991B1B] bg-[#991B1B]/10 border-[#991B1B]/25',
  },
};

function computeChangeMarker(
  current: AuditRating,
  previous?: AuditRating
): { label: 'better' | 'same' | 'worse'; className: string } | null {
  if (!previous) return null;
  const rank: Record<AuditRating, number> = {
    green: 3,
    amber: 2,
    red: 1,
  };
  const diff = rank[current] - rank[previous];
  if (diff > 0) {
    return {
      label: 'better',
      className: 'text-[#14532D] bg-[#14532D]/10 border-[#14532D]/20',
    };
  }
  if (diff < 0) {
    return {
      label: 'worse',
      className: 'text-[#991B1B] bg-[#991B1B]/10 border-[#991B1B]/25',
    };
  }
  return {
    label: 'same',
    className: 'text-stone-600 bg-[#F4F0E8] border-[#E6DFD3]',
  };
}

export const ScorecardCard: React.FC<ScorecardCardProps> = ({
  scorecard,
  onOpenCalendarReminder,
  onSendReportToNic,
}) => {
  const results = scorecard.results || {};
  const previousResults = scorecard.previousResults || undefined;

  // Keep only the areas covered in this check-up run, ordered by AUDIT_AREAS
  const coveredAreas = AUDIT_AREAS.filter(area => Boolean(results[area]));
  const hasRedArea = coveredAreas.some(area => results[area]?.rating === 'red');
  const fixList = Array.isArray(scorecard.fixList)
    ? scorecard.fixList.filter(item => typeof item === 'string' && item.trim()).slice(0, 3)
    : [];

  const formattedDate = (() => {
    try {
      return new Date(scorecard.completedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return scorecard.completedAt;
    }
  })();

  return (
    <div className="mt-3 rounded-xl border border-[#E6DFD3] bg-[#FBF9F5] shadow-xs overflow-hidden text-left">
      <div className="px-4 py-3 bg-[#F4F0E8] border-b border-[#E6DFD3] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#14532D] shrink-0" />
          <div>
            <h4 className="font-serif text-sm font-medium text-stone-900">
              {scorecard.title || 'Check-up Scorecard'}
            </h4>
            <p className="text-[11px] text-stone-500">Completed {formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {coveredAreas.map(area => {
            const item = results[area];
            if (!item) return null;
            const style = RATING_STYLES[item.rating] || RATING_STYLES.amber;
            return (
              <span
                key={area}
                title={`${AREA_LABELS[area]}: ${style.badgeText}`}
                className={`w-2.5 h-2.5 rounded-full ${style.dotClass}`}
              />
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {coveredAreas.length > 0 ? (
          <div className="divide-y divide-[#E6DFD3]/80 border border-[#E6DFD3] rounded-lg bg-white">
            {coveredAreas.map(area => {
              const entry = results[area]!;
              const prevEntry = previousResults?.[area];
              const style = RATING_STYLES[entry.rating] || RATING_STYLES.amber;
              const change = computeChangeMarker(entry.rating, prevEntry?.rating);

              return (
                <div
                  key={area}
                  className="px-3.5 py-2.5 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${style.dotClass}`}
                      aria-label={style.badgeText}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-stone-900">
                        {AREA_LABELS[area] || area}
                      </div>
                      <p className="text-stone-600 leading-relaxed mt-0.5">
                        {entry.reason || 'Checked during this session.'}
                      </p>
                    </div>
                  </div>

                  {change && (
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded border text-[11px] font-medium capitalize ${change.className}`}
                      title={`Compared with your last check-up (${prevEntry?.rating})`}
                    >
                      {change.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-stone-600">
            Check-up completed. No individual area ratings were recorded for this run.
          </p>
        )}

        {fixList.length > 0 && (
          <div className="rounded-lg bg-[#F4F0E8]/70 border border-[#E6DFD3] p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800">
              <AlertTriangle className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>Fix list</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-stone-700 leading-relaxed">
              {fixList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenCalendarReminder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E6DFD3] bg-white hover:bg-[#F4F0E8] text-stone-800 text-xs font-medium transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#9A3412]" />
            <span>Add weekly check to my calendar</span>
          </button>

          {hasRedArea && (
            <button
              type="button"
              onClick={() => onSendReportToNic(scorecard)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-medium transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send a report to Nic</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
