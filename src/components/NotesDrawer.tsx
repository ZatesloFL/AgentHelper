import React, { useState, useEffect } from 'react';
import {
  SessionNote,
  ProgressSummaryDoc,
  StoredConversation,
} from '../lib/firebase.js';
import {
  Trash2,
  X,
  FileText,
  Edit3,
  Check,
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: SessionNote[];
  onDeleteNote: (noteId: string) => void;
  product: string;
  productName?: string;
  availableProducts?: Array<{ id: string; name: string }>;
  progressSummary: ProgressSummaryDoc | null;
  onSaveProgressSummary: (newSummaryText: string) => Promise<void>;
  onDeleteProgressSummary: () => Promise<void>;
  pastConversations: StoredConversation[];
  onDeleteConversation: (conversationId: string) => Promise<void>;
  onDeleteAllHistory: () => Promise<void>;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  notes,
  onDeleteNote,
  product,
  productName,
  availableProducts = [],
  progressSummary,
  onSaveProgressSummary,
  onDeleteProgressSummary,
  pastConversations,
  onDeleteConversation,
  onDeleteAllHistory,
}) => {
  const [isEditingSummary, setIsEditingSummary] = useState<boolean>(false);
  const [summaryDraft, setSummaryDraft] = useState<string>('');
  const [isSavingSummary, setIsSavingSummary] = useState<boolean>(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState<boolean>(false);
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);

  useEffect(() => {
    setSummaryDraft(progressSummary?.summary || '');
  }, [progressSummary]);

  if (!isOpen) return null;

  const getProductLabel = (prodId: string) => {
    const found = availableProducts.find(p => p.id === prodId);
    if (found) return found.name;
    if (prodId === product && productName) return productName;
    if (prodId === 'muse') return 'Meta Muse';
    if (prodId === 'grok') return 'Grok';
    if (prodId === 'gemini-builder') return 'Gemini Gems';
    return prodId;
  };

  const getFirstSummaryLine = (conv: StoredConversation): string => {
    const rawSummary =
      (conv.summary && conv.summary.trim()) ||
      (conv.product === product && progressSummary?.summary ? progressSummary.summary.trim() : '');

    if (rawSummary) {
      const firstLine = rawSummary.split(/\r?\n/)[0].trim();
      return firstLine.length > 110 ? `${firstLine.slice(0, 107)}...` : firstLine;
    }

    const firstUserMsg = conv.messages.find(m => m.role === 'user' && m.text.trim());
    const fallbackMsg = firstUserMsg || conv.messages.find(m => m.text.trim());
    if (fallbackMsg) {
      const firstLine = fallbackMsg.text.split(/\r?\n/)[0].trim();
      return firstLine.length > 110 ? `${firstLine.slice(0, 107)}...` : firstLine;
    }

    return 'Conversation saved';
  };

  const selectedConversation = pastConversations.find(c => c.id === selectedConversationId) || null;

  const handleSaveSummaryClick = async () => {
    setIsSavingSummary(true);
    try {
      await onSaveProgressSummary(summaryDraft.trim().slice(0, 1200));
      setIsEditingSummary(false);
    } finally {
      setIsSavingSummary(false);
    }
  };

  const handleDeleteSummaryClick = async () => {
    await onDeleteProgressSummary();
    setIsEditingSummary(false);
    setSummaryDraft('');
  };

  const handleConfirmDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await onDeleteAllHistory();
      setSelectedConversationId(null);
      setConfirmDeleteAll(false);
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1C1917]/40 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] w-full max-w-lg h-full shadow-2xl border-l border-[#E6DFD3] flex flex-col p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#78716C]">
              Your Memory & History
            </span>
            <h3 className="text-2xl font-editorial font-medium text-[#1C1917]">
              {selectedConversation ? 'Past Conversation' : 'Notes & Progress'}
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              {selectedConversation
                ? `${getProductLabel(selectedConversation.product)} · ${new Date(
                    selectedConversation.updatedAt
                  ).toLocaleDateString()}`
                : `Saved to your account for ${productName || product}. View, edit, or delete anytime.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only Past Conversation View */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col overflow-hidden space-y-3">
            <div className="flex items-center justify-between bg-[#F4F0E8] border border-[#E6DFD3] px-3.5 py-2 rounded-lg text-xs">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="flex items-center gap-1.5 text-[#1C1917] hover:text-[#9A3412] font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to history</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-[#78716C]">Read-only</span>
                <button
                  onClick={async () => {
                    const idToDelete = selectedConversation.id;
                    setSelectedConversationId(null);
                    await onDeleteConversation(idToDelete);
                  }}
                  className="flex items-center gap-1 text-[#9A3412] hover:text-red-700 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {selectedConversation.summary && (
              <div className="p-3 bg-white border border-[#E6DFD3] rounded-lg text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] block">
                  Conversation Summary
                </span>
                <p className="text-[#292524] leading-relaxed whitespace-pre-wrap">
                  {selectedConversation.summary}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedConversation.messages.length === 0 ? (
                <p className="text-xs text-[#78716C] italic text-center py-8">
                  No messages in this conversation.
                </p>
              ) : (
                selectedConversation.messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-3 rounded-lg text-xs border ${
                      m.role === 'user'
                        ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917] ml-6'
                        : m.role === 'system'
                        ? 'bg-[#F4F0E8] text-[#78716C] border-[#E6DFD3] font-mono text-[11px]'
                        : 'bg-white text-[#1C1917] border-[#E6DFD3] mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-mono">
                      <span>
                        {m.role === 'guide' ? 'Calm Guide' : m.role === 'system' ? 'System' : 'You'}{' '}
                        {m.source ? `(${m.source})` : ''}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    {m.appCard && (
                      <div className="mt-2 pt-2 border-t border-[#E6DFD3] text-[11px] space-y-1">
                        <div className="font-semibold">
                          Routine: {m.appCard.title}
                        </div>
                        <div className="text-[#78716C]">
                          {m.appCard.steps.filter(s => s.completed).length}/
                          {m.appCard.steps.length} steps completed
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Main Drawer View: 1. Where you left off, 2. Past conversations, 3. Session notes */
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Section 1: Where you left off */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#1C1917]">
                    Where you left off
                  </h4>
                  <p className="text-[11px] text-[#78716C]">
                    Progress summary for {productName || product}
                  </p>
                </div>

                {progressSummary && !isEditingSummary && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => {
                        setSummaryDraft(progressSummary.summary || '');
                        setIsEditingSummary(true);
                      }}
                      className="px-2.5 py-1 bg-white border border-[#E6DFD3] hover:bg-stone-50 rounded text-[#1C1917] inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDeleteSummaryClick}
                      className="px-2.5 py-1 bg-white border border-[#E6DFD3] hover:bg-red-50 rounded text-[#9A3412] inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {isEditingSummary ? (
                <div className="p-3.5 bg-white border border-[#E6DFD3] rounded-xl space-y-2.5 text-xs">
                  <textarea
                    rows={5}
                    maxLength={1200}
                    value={summaryDraft}
                    onChange={(e) => setSummaryDraft(e.target.value)}
                    placeholder="Write or adjust your progress summary..."
                    className="w-full p-2.5 bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#9A3412] leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#78716C]">
                      {summaryDraft.length}/1200 chars
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingSummary(false)}
                        className="px-3 py-1.5 text-xs text-[#57534E] hover:text-[#1C1917]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSummaryClick}
                        disabled={isSavingSummary}
                        className="px-3 py-1.5 bg-[#1C1917] text-white rounded-lg text-xs font-medium inline-flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSavingSummary ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : progressSummary && progressSummary.summary ? (
                <div className="p-4 bg-white border border-[#E6DFD3] rounded-xl text-xs space-y-3">
                  <p className="text-[#1C1917] leading-relaxed whitespace-pre-wrap">
                    {progressSummary.summary}
                  </p>

                  {progressSummary.suggestedNextStep && (
                    <div className="pt-2 border-t border-[#F4F0E8] text-[11px]">
                      <span className="font-semibold text-[#1C1917]">Suggested next step: </span>
                      <span className="text-[#57534E]">{progressSummary.suggestedNextStep}</span>
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-[#78716C] text-right">
                    Updated {new Date(progressSummary.updatedAt).toLocaleDateString()} ·{' '}
                    {new Date(progressSummary.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white border border-[#E6DFD3] rounded-xl text-xs text-[#78716C] space-y-2">
                  <p>
                    No summary saved yet for {productName || product}. The guide updates this automatically as you complete routines, chat, or click "End session".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSummaryDraft('');
                      setIsEditingSummary(true);
                    }}
                    className="text-[11px] text-[#9A3412] hover:underline font-medium"
                  >
                    + Write a summary manually
                  </button>
                </div>
              )}
            </section>

            {/* Section 2: Past conversations */}
            <section className="space-y-2.5 border-t border-[#E6DFD3] pt-4">
              <div>
                <h4 className="text-sm font-semibold text-[#1C1917]">
                  Past conversations
                </h4>
                <p className="text-[11px] text-[#78716C]">
                  Click any conversation to view it read-only, or delete it.
                </p>
              </div>

              {pastConversations.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#78716C] bg-white border border-[#E6DFD3] rounded-xl space-y-1">
                  <MessageSquare className="w-6 h-6 text-[#D6CEBE] mx-auto" />
                  <p>No saved conversations yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pastConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-3 bg-white border border-[#E6DFD3] hover:border-[#D6CEBE] rounded-xl text-xs flex items-start justify-between gap-3 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedConversationId(conv.id)}
                        className="flex-1 text-left space-y-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#78716C]">
                          <span>
                            {new Date(conv.updatedAt).toLocaleDateString()} ·{' '}
                            {new Date(conv.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-[#1C1917]">
                            {getProductLabel(conv.product)}
                          </span>
                        </div>
                        <p className="text-[#292524] truncate">
                          {getFirstSummaryLine(conv)}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteConversation(conv.id)}
                        className="p-1.5 text-[#9A3412] hover:text-red-700 shrink-0"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 3: Session Notes */}
            <section className="space-y-2.5 border-t border-[#E6DFD3] pt-4">
              <div>
                <h4 className="text-sm font-semibold text-[#1C1917]">
                  Session notes ({notes.length})
                </h4>
                <p className="text-[11px] text-[#78716C]">
                  Short factual reminders saved for {productName || product}.
                </p>
              </div>

              {notes.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#78716C] bg-white border border-[#E6DFD3] rounded-xl space-y-1">
                  <FileText className="w-6 h-6 text-[#D6CEBE] mx-auto" />
                  <p>No session notes saved yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 bg-white border border-[#E6DFD3] rounded-lg text-xs space-y-2 relative group hover:border-[#D6CEBE] transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#78716C] border-b border-[#F4F0E8] pb-1.5">
                        <span className="font-mono">
                          {new Date(note.createdAt).toLocaleDateString()} ·{' '}
                          {new Date(note.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="text-[#9A3412] hover:text-red-700 p-1"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[#292524] leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Footer: Delete all my history with confirmation */}
        <div className="border-t border-[#E6DFD3] pt-3 space-y-2.5 text-xs">
          {confirmDeleteAll ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2.5 text-red-950">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Are you sure you want to delete all your past conversations, progress summaries, and session notes? This cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAll(false)}
                  disabled={isDeletingAll}
                  className="px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-medium text-[#1C1917]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAll}
                  disabled={isDeletingAll}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-medium"
                >
                  {isDeletingAll ? 'Deleting...' : 'Yes, delete all my history'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#78716C]">
                You are in control of your saved memory.
              </span>
              <button
                type="button"
                onClick={() => setConfirmDeleteAll(true)}
                className="text-xs font-medium text-[#9A3412] hover:text-red-700 underline inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete all my history</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
