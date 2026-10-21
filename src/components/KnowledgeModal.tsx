import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface KnowledgeTagCounts {
  SEEN: number;
  DOC: number;
  SAID: number;
  WEB: number;
  INFERRED: number;
  UNKNOWN: number;
  NIC: number;
}

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  knowledge: {
    product: string;
    title: string;
    filePath?: string;
    lastChecked: string;
    daysOld: number;
    isStale: boolean;
    tagCounts?: KnowledgeTagCounts;
    content: string;
    playbookTitle?: string;
    playbookFilePath?: string;
    playbookLastChecked?: string;
    playbookContent?: string;
  } | null;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  isOpen,
  onClose,
  productName,
  knowledge,
}) => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'playbook'>('knowledge');

  if (!isOpen || !knowledge) return null;

  const tc: KnowledgeTagCounts = knowledge.tagCounts || {
    SEEN: 0,
    DOC: 0,
    SAID: 0,
    WEB: 0,
    INFERRED: 0,
    UNKNOWN: 0,
    NIC: 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl max-w-3xl w-full p-6 shadow-2xl text-[#1C1917] space-y-4 max-h-[88vh] flex flex-col">
        <div className="flex items-start justify-between border-b border-[#E6DFD3] pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#78716C]">
                Knowledge Pack & Playbook · {productName || knowledge.product}
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
              {activeTab === 'knowledge'
                ? knowledge.title
                : knowledge.playbookTitle || "Nic's Playbook (tagged [NIC])"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tag counts & short legend */}
        <div className="p-3 bg-[#F4F0E8] border border-[#E6DFD3] rounded-lg text-xs space-y-2 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-[#1C1917]">Last checked:</span>{' '}
              <span className="font-mono">{knowledge.lastChecked}</span> ({knowledge.daysOld} days ago)
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#57534E] font-mono">
              <span><strong>[SEEN]</strong> {tc.SEEN}</span>
              <span>·</span>
              <span><strong>[DOC]</strong> {tc.DOC}</span>
              <span>·</span>
              <span><strong>[SAID]</strong> {tc.SAID}</span>
              <span>·</span>
              <span><strong>[WEB]</strong> {tc.WEB}</span>
              <span>·</span>
              <span><strong>[INFERRED]</strong> {tc.INFERRED}</span>
              <span>·</span>
              <span><strong>[UNKNOWN]</strong> {tc.UNKNOWN}</span>
              <span>·</span>
              <span><strong>[NIC]</strong> {tc.NIC}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E6DFD3] text-[11px] text-[#57534E] grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
            <div><strong>[SEEN]</strong> seen on a real screen</div>
            <div><strong>[DOC]</strong> Muse's own documentation</div>
            <div><strong>[SAID]</strong> the Muse agent said it</div>
            <div><strong>[WEB]</strong> third-party reporting</div>
            <div><strong>[INFERRED]</strong> a guess (confirm on screen)</div>
            <div><strong>[UNKNOWN]</strong> not yet observed</div>
            <div className="sm:col-span-2"><strong>[NIC]</strong> Nic's recommendation ("Nic recommends…")</div>
          </div>
        </div>

        {/* File selector tabs so both files are accessible */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-[#1C1917] text-white border-[#1C1917]'
                : 'bg-white text-[#57534E] border-[#E6DFD3] hover:bg-[#F4F0E8]'
            }`}
          >
            {knowledge.title} ({knowledge.filePath || `knowledge/${knowledge.product}.md`})
          </button>
          {knowledge.playbookContent && (
            <button
              type="button"
              onClick={() => setActiveTab('playbook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeTab === 'playbook'
                  ? 'bg-[#1C1917] text-white border-[#1C1917]'
                  : 'bg-white text-[#57534E] border-[#E6DFD3] hover:bg-[#F4F0E8]'
              }`}
            >
              Nic's Playbook [NIC] ({knowledge.playbookFilePath || 'knowledge/muse-playbook.md'})
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 text-xs leading-relaxed text-[#292524] whitespace-pre-wrap font-sans">
          {activeTab === 'knowledge' ? knowledge.content : knowledge.playbookContent}
        </div>

        <div className="border-t border-[#E6DFD3] pt-3 text-[11px] text-[#78716C] flex items-center justify-between shrink-0">
          <span>
            Sources: {knowledge.filePath || `knowledge/${knowledge.product}.md`} &amp;{' '}
            {knowledge.playbookFilePath || 'knowledge/muse-playbook.md'}
          </span>
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

