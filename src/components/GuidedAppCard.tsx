import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, HelpCircle, MapPin, Calendar } from 'lucide-react';
import { StepEvidence } from '../lib/firebase.js';

export interface GuidedAppStepItem {
  number: number;
  title: string;
  detail: string;
  completed?: boolean;
  coachPrompt?: string;
  coach?: string;
  why?: string;
  where?: string;
  done_when?: string;
  verify?: 'user' | 'screen' | 'either';
  if_stuck?: string;
  safety?: string;
  area?: string;
  rating?: string;
  evidence?: StepEvidence;
  note?: string;
  at?: string;
}

export interface GuidedAppCardProps {
  appId: string;
  title: string;
  goal: string;
  activeStep?: number;
  steps: GuidedAppStepItem[];
  onStepToggle?: (stepNumber: number, isDone: boolean) => void;
  onSelectStep?: (stepNumber: number) => void;
  onAskAboutStep?: (stepNumber: number, stepTitle: string) => void;
  onComplete?: () => void;
  onOpenCalendarReminder?: () => void;
}

function getEvidenceBadgeLabel(evidence?: StepEvidence): string {
  if (evidence === 'screen') return 'Seen on screen';
  if (evidence === 'user') return 'You confirmed';
  return 'You marked this done';
}

export const GuidedAppCard: React.FC<GuidedAppCardProps> = ({
  appId,
  title,
  goal,
  activeStep: propActiveStep = 1,
  steps,
  onStepToggle,
  onSelectStep,
  onAskAboutStep,
  onComplete,
  onOpenCalendarReminder,
}) => {
  const [activeStep, setActiveStep] = useState<number>(propActiveStep);

  useEffect(() => {
    if (propActiveStep) {
      setActiveStep(propActiveStep);
    }
  }, [propActiveStep]);

  const handleToggle = (stepNumber: number, currentDone: boolean) => {
    if (onStepToggle) {
      onStepToggle(stepNumber, !currentDone);
    }
  };

  const totalSteps = steps.length;
  const completedCount = steps.filter(s => !!s.completed).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const displayStepNum =
    totalSteps > 0 ? Math.min(Math.max(activeStep || 1, 1), totalSteps) : 1;

  return (
    <div className="my-3 border border-[#E6DFD3] bg-[#F7F4EE] rounded-xl p-4 sm:p-5 text-[#1C1917] max-w-xl shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E6DFD3] pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] block">
            Guided Routine Roadmap
          </span>
          <h4 className="text-lg font-serif font-semibold text-[#1C1917] mt-0.5">
            {title}
          </h4>
          {goal && <p className="text-xs text-[#57534E] mt-1 leading-relaxed">{goal}</p>}
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-mono tabular-nums text-[#1C1917] font-medium block">
            Step {displayStepNum} of {totalSteps}
          </span>
          <span className="text-[10px] font-mono tabular-nums text-[#78716C] block mt-0.5">
            {completedCount} of {totalSteps} done
          </span>
          <div className="w-28 bg-[#E6DFD3] h-2 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#14532D] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepped Checklist */}
      <div className="space-y-1.5">
        {steps.map((step) => {
          const isDone = !!step.completed;
          const isCurrent = activeStep === step.number;
          const coachText = step.coach || step.coachPrompt || '';
          const whyText = step.why || step.detail || '';
          const whereText = step.where || '';
          const badgeLabel = getEvidenceBadgeLabel(step.evidence);

          // Collapsed Completed Step (when not active)
          if (isDone && !isCurrent) {
            return (
              <div
                key={step.number}
                onClick={() => {
                  setActiveStep(step.number);
                  if (onSelectStep) onSelectStep(step.number);
                }}
                className="px-3 py-2 rounded-lg border bg-[#EAE4D7]/50 border-[#D6CEBE] text-[#57534E] text-xs flex items-center justify-between gap-2 cursor-pointer hover:border-[#BDB29E] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(step.number, isDone);
                    }}
                    className="text-[#14532D] hover:text-[#1C1917] transition-colors shrink-0"
                    aria-label={`Unmark step ${step.number} as completed`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                  </button>
                  <span className="font-medium line-through text-[#78716C] truncate">
                    {step.number}. {step.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#14532D]/10 text-[#14532D] shrink-0">
                  {badgeLabel}
                </span>
              </div>
            );
          }

          // Collapsed Upcoming Step (when not active and not done)
          if (!isCurrent && !isDone) {
            return (
              <div
                key={step.number}
                onClick={() => {
                  setActiveStep(step.number);
                  if (onSelectStep) onSelectStep(step.number);
                }}
                className="px-3 py-2 rounded-lg border bg-[#FBF9F5]/70 border-[#E6DFD3] hover:border-[#D6CEBE] text-[#1C1917] text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(step.number, isDone);
                    }}
                    className="text-[#A8A29E] hover:text-[#14532D] transition-colors shrink-0"
                    aria-label={`Mark step ${step.number} as completed`}
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-[#57534E] truncate">
                    {step.number}. {step.title}
                  </span>
                </div>
              </div>
            );
          }

          // Expanded Current Step
          return (
            <div
              key={step.number}
              className="p-3.5 rounded-lg border bg-white border-[#9A3412] ring-1 ring-[#9A3412]/25 shadow-xs text-xs transition-all"
            >
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => handleToggle(step.number, isDone)}
                  className="mt-0.5 text-[#1C1917] hover:text-[#14532D] transition-colors shrink-0"
                  aria-label={`Mark step ${step.number} as completed`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#9A3412]" />
                  )}
                </button>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#1C1917] text-xs">
                      {step.number}. {step.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDone ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#14532D]/10 text-[#14532D]">
                          {badgeLabel}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#9A3412]/10 text-[#9A3412] font-mono">
                          Current step
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Where breadcrumb */}
                  {whereText && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#F4F0E8] border border-[#E6DFD3] text-[11px] font-mono text-[#57534E]">
                      <MapPin className="w-3 h-3 text-[#9A3412] shrink-0" />
                      <span>
                        <strong className="font-sans font-semibold text-[#1C1917]">Where:</strong>{' '}
                        {whereText}
                      </span>
                    </div>
                  )}

                  {/* Coach question */}
                  {coachText && (
                    <p className="text-[#1C1917] text-xs leading-relaxed bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg p-2.5">
                      "{coachText}"
                    </p>
                  )}

                  {/* Why this matters */}
                  {whyText && (
                    <p className="text-[#57534E] text-[11px] leading-relaxed">
                      <span className="font-semibold text-[#1C1917]">Why this matters:</span>{' '}
                      {whyText}
                    </p>
                  )}

                  {/* Recorded note if confirmed */}
                  {isDone && step.note && (
                    <p className="text-[#14532D] text-[11px] font-mono bg-[#14532D]/5 border border-[#14532D]/15 rounded px-2 py-1">
                      Note: {step.note}
                    </p>
                  )}

                  {/* Offer calendar reminder on Getting Started step 11 */}
                  {appId === 'getting-started' && step.number === 11 && onOpenCalendarReminder && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCalendarReminder();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6DFD3] bg-[#FBF9F5] hover:bg-[#F4F0E8] text-[#1C1917] text-xs font-medium transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#9A3412]" />
                        <span>Add weekly check to my calendar</span>
                      </button>
                    </div>
                  )}

                  {/* Ask about this step button */}
                  {onAskAboutStep && (
                    <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-[11px]">
                      <span className="text-[#78716C] italic">
                        {step.verify === 'screen'
                          ? 'Best verified by sharing your screen'
                          : 'Guide will walk through this step with you'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAboutStep(step.number, step.title);
                        }}
                        className="px-2.5 py-1 bg-[#F4F0E8] hover:bg-[#EAE4D7] border border-[#E6DFD3] rounded text-[#1C1917] font-medium flex items-center gap-1 transition-colors"
                      >
                        <HelpCircle className="w-3 h-3 text-[#9A3412]" />
                        <span>Ask about this step</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {progressPercent === 100 && (
        <div className="bg-[#14532D]/10 border border-[#14532D]/20 rounded-lg p-3 text-xs text-[#14532D] flex items-center justify-between">
          <span>All routine steps completed!</span>
          {onComplete && (
            <button
              onClick={onComplete}
              className="px-2.5 py-1 bg-[#14532D] text-white rounded text-[11px] font-medium"
            >
              Finish Routine
            </button>
          )}
        </div>
      )}
    </div>
  );
};

