import React from 'react';
import { X } from 'lucide-react';
import { ReportForNicCard } from './ReportForNicCard.js';

interface CalendarEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: string;
  productName?: string;
  transcript: Array<{ role: string; text: string }>;
  routineProgress?: string;
  routineState?: any;
  progressSummary?: string;
  progressSummaryPayload?: any;
  bookingUrl: string;
  sheetWebhookConfigured: boolean;
  onBeforeSendReport?: () => Promise<string | void>;
  onReportSent?: (referenceId: string) => void;
}

export const CalendarEscalationModal: React.FC<CalendarEscalationModalProps> = ({
  isOpen,
  onClose,
  product,
  productName = 'Meta Muse',
  transcript,
  routineProgress = '',
  routineState = null,
  progressSummary = '',
  progressSummaryPayload = null,
  bookingUrl,
  sheetWebhookConfigured,
  onBeforeSendReport,
  onReportSent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl max-w-lg w-full p-6 shadow-xl text-[#1C1917] space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#E6DFD3] pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#78716C] block">
              Human Review
            </span>
            <h3 className="text-2xl font-editorial font-medium text-[#1C1917] mt-0.5">
              Talk with Nic
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#57534E] leading-relaxed">
          Have a look at the note below, change anything you like, and press Send if it looks right. You can also book a time directly.
        </p>

        <ReportForNicCard
          autoDraft={true}
          product={product}
          productName={productName}
          transcript={transcript}
          routineProgress={routineProgress}
          routineState={routineState}
          progressSummary={progressSummary}
          progressSummaryPayload={progressSummaryPayload}
          bookingUrl={bookingUrl}
          sheetWebhookConfigured={sheetWebhookConfigured}
          onBeforeSendReport={onBeforeSendReport}
          onSent={(refId) => {
            if (onReportSent) onReportSent(refId);
          }}
        />
      </div>
    </div>
  );
};
