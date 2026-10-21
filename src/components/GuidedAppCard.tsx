import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, HelpCircle, ArrowRight, Check } from 'lucide-react';

export interface GuidedAppStepItem {
  number: number;
  title: string;
  detail: string;
  completed?: boolean;
  coachPrompt?: string;
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
          <span className="text-xs font-mono tabular-nums text-[#78716C]">
            {completedCount} of {totalSteps} done
          </span>
          <div className="w-24 bg-[#E6DFD3] h-2 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#14532D] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepped Checklist */}
      <div className="space-y-2">
        {steps.map((step) => {
          const isDone = !!step.completed;
          const isCurrent = activeStep === step.number;

          return (
            <div
              key={step.number}
              className={`p-3 rounded-lg border transition-all text-xs ${
                isDone
                  ? 'bg-[#EAE4D7]/50 border-[#D6CEBE] text-[#57534E]'
                  : isCurrent
                  ? 'bg-white border-[#9A3412] ring-1 ring-[#9A3412]/30 shadow-xs'
                  : 'bg-[#FBF9F5]/70 border-[#E6DFD3] hover:border-[#D6CEBE]'
              }`}
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
                    <Circle className={`w-4 h-4 ${isCurrent ? 'text-[#9A3412]' : 'text-[#A8A29E]'}`} />
                  )}
                </button>

                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setActiveStep(step.number);
                    if (onSelectStep) onSelectStep(step.number);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-medium ${isDone ? 'line-through text-[#78716C]' : isCurrent ? 'text-[#1C1917] font-semibold' : 'text-[#1C1917]'}`}>
                      {step.number}. {step.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDone ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#14532D]/10 text-[#14532D]">
                          Done
                        </span>
                      ) : isCurrent ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#9A3412]/10 text-[#9A3412] font-mono">
                          Current Focus
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A8A29E] font-mono">
                          Step {step.number}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[#57534E] text-[11px] mt-1 leading-relaxed">
                    {step.detail}
                  </p>

                  {/* Contextual Action for Current Step if not done */}
                  {isCurrent && !isDone && onAskAboutStep && (
                    <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-[11px]">
                      <span className="text-[#78716C] italic">
                        Guide will walk through this step with you
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAboutStep(step.number, step.title);
                        }}
                        className="px-2 py-1 bg-[#F4F0E8] hover:bg-[#EAE4D7] border border-[#E6DFD3] rounded text-[#1C1917] font-medium flex items-center gap-1"
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
          <span>All routine steps completed and verified!</span>
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
