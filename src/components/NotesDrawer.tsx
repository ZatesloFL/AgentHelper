import React from 'react';
import { SessionNote } from '../lib/firebase.js';
import { Trash2, X, FileText } from 'lucide-react';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: SessionNote[];
  onDeleteNote: (noteId: string) => void;
  product: string;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  notes,
  onDeleteNote,
  product,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1C1917]/40 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] w-full max-w-md h-full shadow-2xl border-l border-[#E6DFD3] flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#78716C]">
              Stored Context
            </span>
            <h3 className="text-2xl font-editorial font-medium text-[#1C1917]">
              Session Notes
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Short reminders saved for {product.toUpperCase()} (max 500 chars).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {notes.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#78716C] space-y-2">
              <FileText className="w-8 h-8 text-[#D6CEBE] mx-auto" />
              <p>No notes saved yet.</p>
              <p className="text-[11px] text-[#A8A29E]">
                When the guide records verified settings or screen observations, they will appear here.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 bg-white border border-[#E6DFD3] rounded-lg text-xs space-y-2 relative group hover:border-[#D6CEBE] transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-[#78716C] border-b border-[#F4F0E8] pb-1.5">
                  <span className="font-mono">
                    {new Date(note.createdAt).toLocaleDateString()} · {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-[#9A3412] hover:text-red-700 p-1 opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[#292524] leading-relaxed whitespace-pre-wrap">
                  {note.text}
                </p>

                <div className="text-[10px] text-[#A8A29E] text-right font-mono">
                  {note.text.length}/500 chars
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-[#E6DFD3] pt-3 text-[11px] text-[#78716C]">
          You have full control over these notes. Deleting a note completely removes it from your account memory.
        </div>
      </div>
    </div>
  );
};
