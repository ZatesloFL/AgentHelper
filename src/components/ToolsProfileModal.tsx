import React, { useState, useEffect } from 'react';
import {
  ToolsProfileDoc,
  UserToolEntry,
  authFetch,
} from '../lib/firebase.js';
import {
  X,
  Check,
  ShieldAlert,
  Wrench,
  Briefcase,
  User as UserIcon,
  Smartphone,
  Info,
} from 'lucide-react';

export interface CatalogToolItem {
  id: string;
  name: string;
  support: 'connector' | 'device' | 'custom' | 'browser' | 'reported' | 'unknown';
  evidence: string;
  note?: string;
}

export interface CatalogCategory {
  id: string;
  label: string;
  tools: CatalogToolItem[];
}

export interface ToolsCatalogData {
  lastChecked: string;
  supportLevels: Record<string, string>;
  categories: CatalogCategory[];
}

interface ToolsProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: ToolsProfileDoc | null;
  catalog: ToolsCatalogData | null;
  onSave: (
    updated: {
      devices: string[];
      tools: UserToolEntry[];
      other: string;
    },
    shareAnonymously: boolean
  ) => Promise<void>;
}

const DEVICE_OPTIONS = ['Website', 'iPhone', 'Android', 'Mac app', 'WhatsApp'] as const;

function getPlainSupportShortLabel(support: CatalogToolItem['support']): string {
  switch (support) {
    case 'connector':
      return 'Built-in connection';
    case 'device':
      return 'Works through Mac app or phone';
    case 'custom':
      return 'Custom connection possible';
    case 'browser':
      return 'Browser login only (broader access)';
    case 'reported':
      return 'Reported by third parties (unconfirmed)';
    case 'unknown':
    default:
      return 'Not confirmed';
  }
}

function getSupportBadgeStyles(support: CatalogToolItem['support']): string {
  switch (support) {
    case 'connector':
      return 'bg-[#14532D]/10 text-[#14532D] border-[#14532D]/25';
    case 'device':
      return 'bg-[#14532D]/10 text-[#14532D] border-[#14532D]/25';
    case 'custom':
      return 'bg-amber-100/80 text-amber-900 border-amber-300';
    case 'browser':
      return 'bg-[#9A3412]/10 text-[#9A3412] border-[#9A3412]/25';
    case 'reported':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    case 'unknown':
    default:
      return 'bg-[#F4F0E8] text-[#57534E] border-[#E6DFD3]';
  }
}

export const ToolsProfileModal: React.FC<ToolsProfileModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  catalog: propCatalog,
  onSave,
}) => {
  const [catalog, setCatalog] = useState<ToolsCatalogData | null>(propCatalog);
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<Record<string, UserToolEntry>>({});
  const [otherTools, setOtherTools] = useState<string>('');
  const [shareAnonymously, setShareAnonymously] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (propCatalog) {
      setCatalog(propCatalog);
    }
  }, [propCatalog]);

  useEffect(() => {
    if (!isOpen) return;
    setSaveFeedback(null);
    // Checkbox off by default every time panel opens per spec
    setShareAnonymously(false);

    setDevices(Array.isArray(initialProfile?.devices) ? [...initialProfile!.devices] : []);
    const map: Record<string, UserToolEntry> = {};
    if (Array.isArray(initialProfile?.tools)) {
      for (const t of initialProfile!.tools) {
        if (t && t.id) {
          map[t.id] = {
            id: t.id,
            name: t.name || t.id,
            category: t.category || 'other',
            account: t.account === 'work' ? 'work' : 'personal',
            sensitive: Boolean(t.sensitive),
          };
        }
      }
    }
    setSelectedTools(map);
    setOtherTools(initialProfile?.other || '');

    if (!catalog) {
      authFetch('/api/tools-catalog')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && Array.isArray(data.categories)) {
            setCatalog(data);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, initialProfile, catalog]);

  if (!isOpen) return null;

  const toggleDevice = (dev: string) => {
    setDevices(prev =>
      prev.includes(dev) ? prev.filter(d => d !== dev) : [...prev, dev]
    );
  };

  const toggleToolChip = (tool: CatalogToolItem, categoryId: string) => {
    setSelectedTools(prev => {
      const next = { ...prev };
      if (next[tool.id]) {
        delete next[tool.id];
      } else {
        const defaultSensitive = categoryId === 'money' || categoryId === 'health';
        next[tool.id] = {
          id: tool.id,
          name: tool.name,
          category: categoryId,
          account: 'personal',
          sensitive: defaultSensitive,
        };
      }
      return next;
    });
  };

  const updateToolAccount = (toolId: string, account: 'personal' | 'work') => {
    setSelectedTools(prev => {
      const current = prev[toolId];
      if (!current) return prev;
      return {
        ...prev,
        [toolId]: {
          ...current,
          account,
        },
      };
    });
  };

  const toggleToolSensitive = (toolId: string) => {
    setSelectedTools(prev => {
      const current = prev[toolId];
      if (!current) return prev;
      return {
        ...prev,
        [toolId]: {
          ...current,
          sensitive: !current.sensitive,
        },
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      const toolsList = Object.values(selectedTools);
      await onSave(
        {
          devices,
          tools: toolsList,
          other: otherTools.trim().slice(0, 300),
        },
        shareAnonymously
      );
      onClose();
    } catch (err: any) {
      setSaveFeedback(
        err?.message || "Couldn't save your tools profile right now. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const categories = catalog?.categories || [];
  const supportLevels = catalog?.supportLevels || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/40 backdrop-blur-xs p-4">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#E6DFD3] flex items-start justify-between gap-4 bg-[#F4F0E8]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#78716C]">
              <Wrench className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>Your Tools Profile</span>
            </div>
            <h2 className="text-2xl font-editorial font-medium text-[#1C1917]">
              Your tools
            </h2>
            <p className="text-sm text-[#292524] leading-relaxed">
              Tell me what you use so I can suggest what's safe to connect. I never connect anything myself.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors shrink-0"
            aria-label="Close Your tools"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Device Picker (Multi-select) */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#78716C]" />
                <h3 className="text-sm font-semibold text-[#1C1917]">
                  Which devices do you use Muse on?
                </h3>
                <span className="text-[11px] text-[#78716C]">(Select all that apply)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DEVICE_OPTIONS.map(dev => {
                  const isSelected = devices.includes(dev);
                  return (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => toggleDevice(dev)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917]'
                          : 'bg-white text-[#1C1917] border-[#E6DFD3] hover:bg-[#F4F0E8]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FBF9F5]" />}
                      <span>{dev}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Tool Categories from knowledge/tools-catalog.json */}
            <div className="space-y-5 border-t border-[#E6DFD3] pt-5">
              {categories.length === 0 ? (
                <p className="text-xs text-[#78716C] italic">Loading tools catalog…</p>
              ) : (
                categories.map(cat => (
                  <section key={cat.id} className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#57534E]">
                      {cat.label}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {cat.tools.map(tool => {
                        const selectedEntry = selectedTools[tool.id];
                        const isSelected = Boolean(selectedEntry);

                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => toggleToolChip(tool, cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917]'
                                : 'bg-white text-[#1C1917] border-[#E6DFD3] hover:bg-[#F4F0E8]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-[#FBF9F5]" />}
                            <span>{tool.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Expanded details & toggles for selected chips in this category */}
                    {cat.tools.some(t => Boolean(selectedTools[t.id])) && (
                      <div className="space-y-2.5 pt-1">
                        {cat.tools
                          .filter(t => Boolean(selectedTools[t.id]))
                          .map(tool => {
                            const entry = selectedTools[tool.id];
                            const plainSupport =
                              supportLevels[tool.support] ||
                              'Not confirmed either way [UNKNOWN].';
                            const cleanPlainSupport = plainSupport
                              .replace(/\s*\[[^\]]+\]\.?/g, '')
                              .trim();

                            return (
                              <div
                                key={tool.id}
                                className="p-3.5 bg-white border border-[#E6DFD3] rounded-xl text-xs space-y-2.5 shadow-2xs"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-semibold text-[#1C1917] text-sm">
                                    {tool.name}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded border text-[11px] font-medium ${getSupportBadgeStyles(
                                      tool.support
                                    )}`}
                                  >
                                    {getPlainSupportShortLabel(tool.support)}
                                  </span>
                                </div>

                                <p className="text-[11px] text-[#57534E] leading-relaxed">
                                  {cleanPlainSupport}
                                  {tool.note ? ` — ${tool.note}` : ''}
                                </p>

                                {/* Two small toggles: Work / Personal and Has sensitive info */}
                                <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#F4F0E8]">
                                  {/* Toggle 1: Work / Personal */}
                                  <div className="inline-flex items-center rounded-lg bg-[#F4F0E8] p-0.5 border border-[#E6DFD3]">
                                    <button
                                      type="button"
                                      onClick={() => updateToolAccount(tool.id, 'personal')}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors inline-flex items-center gap-1 ${
                                        entry.account === 'personal'
                                          ? 'bg-white text-[#1C1917] shadow-2xs'
                                          : 'text-[#57534E] hover:text-[#1C1917]'
                                      }`}
                                    >
                                      <UserIcon className="w-3 h-3" />
                                      <span>Personal</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateToolAccount(tool.id, 'work')}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors inline-flex items-center gap-1 ${
                                        entry.account === 'work'
                                          ? 'bg-white text-[#9A3412] shadow-2xs'
                                          : 'text-[#57534E] hover:text-[#1C1917]'
                                      }`}
                                    >
                                      <Briefcase className="w-3 h-3" />
                                      <span>Work</span>
                                    </button>
                                  </div>

                                  {/* Toggle 2: Has sensitive info (money, health, clients) */}
                                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[11px] text-[#292524] bg-[#FBF9F5] px-2.5 py-1 rounded-lg border border-[#E6DFD3] hover:bg-[#F4F0E8] transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={entry.sensitive}
                                      onChange={() => toggleToolSensitive(tool.id)}
                                      className="rounded border-[#D6CEBE] text-[#9A3412] focus:ring-[#9A3412]"
                                    />
                                    <ShieldAlert className="w-3.5 h-3.5 text-[#9A3412]" />
                                    <span>Has sensitive info (money, health, clients)</span>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </section>
                ))
              )}
            </div>

            {/* 3. Other tools free-text box */}
            <section className="space-y-2 border-t border-[#E6DFD3] pt-5">
              <label className="block text-sm font-semibold text-[#1C1917]">
                Other tools
              </label>
              <p className="text-[11px] text-[#78716C]">
                Any other apps or services you use (just tool names — never enter account names, emails, or passwords).
              </p>
              <input
                type="text"
                maxLength={300}
                value={otherTools}
                onChange={e => setOtherTools(e.target.value)}
                placeholder="e.g. Fastmail, Basecamp, YNAB..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#E6DFD3] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9A3412] text-[#1C1917]"
              />
            </section>

            {/* 4. Optional anonymous sharing with Nic */}
            <section className="border-t border-[#E6DFD3] pt-4">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#292524] bg-[#F4F0E8] p-3.5 rounded-xl border border-[#E6DFD3]">
                <input
                  type="checkbox"
                  checked={shareAnonymously}
                  onChange={e => setShareAnonymously(e.target.checked)}
                  className="mt-0.5 rounded border-[#D6CEBE] text-[#1C1917] focus:ring-[#9A3412]"
                />
                <div className="space-y-0.5">
                  <span className="font-medium text-[#1C1917] block">
                    Share my tool list anonymously with Nic to help decide which guides to build next.
                  </span>
                  <span className="text-[11px] text-[#78716C] block">
                    Sends only tool names and device types with an anonymous ID — never your name or email.
                  </span>
                </div>
              </label>
            </section>

            {saveFeedback && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{saveFeedback}</span>
              </div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="p-4 border-t border-[#E6DFD3] bg-[#F4F0E8] flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#78716C]">
              {Object.keys(selectedTools).length} tool
              {Object.keys(selectedTools).length === 1 ? '' : 's'} selected
              {devices.length > 0 ? ` · ${devices.join(', ')}` : ''}
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#1C1917] hover:bg-[#292524] disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving…' : 'Save'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
