import React from 'react';
import { X, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledge: {
    product: string;
    title: string;
    lastChecked: string;
    daysOld: number;
    isStale: boolean;
    metaStatementsCount: number;
    reportedStatementsCount: number;
    unverifiedStatementsCount: number;
    content: string;
  } | null;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  isOpen,
  onClose,
  knowledge,
}) => {
  if (!isOpen || !knowledge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl max-w-2xl w-full p-6 shadow-2xl text-[#1C1917] space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between border-b border-[#E6DFD3] pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#78716C]">
                Knowledge Pack · {knowledge.product.toUpperCase()}
              </span>
              {knowledge.isStale ? (
                <span className="text-[11px] text-[#9A3412] font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Stale (&gt;14 days)</span>
                </span>
              ) : (
                <span className="text-[11px] text-[#14532D] font-mono flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Fresh</span>
                </span>
              )}
            </div>
            <h3 className="text-2xl font-editorial font-medium text-[#1C1917] mt-0.5">
              {knowledge.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source citation summary */}
        <div className="p-3 bg-[#F4F0E8] border border-[#E6DFD3] rounded-lg text-xs flex items-center justify-between shrink-0">
          <div>
            <span className="font-semibold text-[#1C1917]">Last checked:</span>{' '}
            <span className="font-mono">{knowledge.lastChecked}</span> ({knowledge.daysOld} days ago)
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#57534E]">
            <span><strong>[Meta]</strong> {knowledge.metaStatementsCount}</span>
            <span>·</span>
            <span><strong>[Reported]</strong> {knowledge.reportedStatementsCount}</span>
            <span>·</span>
            <span><strong>[Unverified]</strong> {knowledge.unverifiedStatementsCount}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 text-xs leading-relaxed text-[#292524] whitespace-pre-wrap font-sans">
          {knowledge.content}
        </div>

        <div className="border-t border-[#E6DFD3] pt-3 text-[11px] text-[#78716C] flex items-center justify-between shrink-0">
          <span>Source: knowledge/{knowledge.product}.md</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C1917] text-white rounded text-xs hover:bg-[#292524]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
