import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EscalationRecord {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  product: string;
  goal: string;
  tried: string;
  screenSeen: string;
  blocker: string;
  proposedTimes: Array<{ displayFormatted?: string }>;
  transcriptExcerpt: Array<{ role: string; text: string }>;
}

interface AdminData {
  health: {
    checkedAt: string;
    liveModel: string;
    textModel: string;
    liveModelOk: boolean;
    textModelOk: boolean;
    liveAvailable: boolean;
    newerLiveModelSuggestion: string | null;
    warningMessage: string | null;
  };
  escalations: EscalationRecord[];
  knowledgeFiles: Array<{
    product: string;
    title: string;
    lastChecked: string;
    daysOld: number;
    isStale: boolean;
    metaStatementsCount: number;
    reportedStatementsCount: number;
    unverifiedStatementsCount: number;
  }>;
  config: {
    liveModel: string;
    liveModelDeep: string;
    textModel: string;
    calendarIcsUrlSet: boolean;
    bookingUrl: string;
    escalationWebhookUrlSet: boolean;
    ownerEmail: string;
    ownerName: string;
    ownerTimezone: string;
    workingHours: string;
  };
}

interface AdminViewProps {
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [passcode, setPasscode] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedEscalationId, setExpandedEscalationId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      if (!res.ok) {
        setAuthError('Incorrect passcode.');
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      fetchAdminData(passcode);
    } catch (err: any) {
      setAuthError('Failed to verify passcode.');
      setLoading(false);
    }
  };

  const fetchAdminData = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        headers: { 'x-admin-passcode': code },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedEscalationId(prev => (prev === id ? null : id));
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E6DFD3] rounded-xl max-w-sm w-full p-6 shadow-md text-[#1C1917] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F4F0E8] border border-[#E6DFD3] flex items-center justify-center text-[#1C1917]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-medium">Admin Console</h3>
              <p className="text-xs text-[#78716C]">Passcode protected</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#57534E] mb-1">
                Enter Admin Passcode:
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode..."
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9A3412]"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
                {authError}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-[#78716C] hover:text-[#1C1917] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Guide</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#1C1917] text-white rounded-lg text-xs font-medium hover:bg-[#292524] transition-colors"
              >
                {loading ? 'Verifying...' : 'Unlock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917]">
      {/* Header */}
      <div className="border-b border-[#E6DFD3] bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors rounded hover:bg-[#F4F0E8]"
            title="Return to Guide"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-editorial text-2xl font-medium">Admin & Operations</h1>
            <p className="text-xs text-[#78716C]">
              Model Health, Escalation Dossiers & Knowledge Freshness
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchAdminData(passcode)}
          disabled={loading}
          className="px-3 py-1.5 bg-[#F4F0E8] border border-[#E6DFD3] rounded text-xs font-medium hover:bg-[#EAE4D7] flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Model Health Check Section */}
        {adminData?.health && (
          <div className="bg-white border border-[#E6DFD3] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1C1917] flex items-center gap-2">
                <span>Gemini Model Health Status</span>
                {adminData.health.liveAvailable ? (
                  <span className="text-xs font-normal text-[#14532D] bg-[#14532D]/10 px-2 py-0.5 rounded">
                    Active (Live + Text)
                  </span>
                ) : (
                  <span className="text-xs font-normal text-[#9A3412] bg-[#9A3412]/10 px-2 py-0.5 rounded">
                    Fallback (Text-Only Mode)
                  </span>
                )}
              </h2>
              <span className="text-[11px] text-[#78716C] font-mono">
                Checked: {new Date(adminData.health.checkedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#78716C]">LIVE_MODEL:</span>
                  <span className="font-semibold text-[#1C1917]">{adminData.health.liveModel}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {adminData.health.liveModelOk ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#14532D]" />
                      <span className="text-[#14532D]">Found and verified in model catalog</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span className="text-[#9A3412]">Missing from catalog · Voice disabled</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#78716C]">TEXT_MODEL:</span>
                  <span className="font-semibold text-[#1C1917]">{adminData.health.textModel}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {adminData.health.textModelOk ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#14532D]" />
                      <span className="text-[#14532D]">Ready for chat fallback and summaries</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span className="text-[#9A3412]">Not verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Health Warning */}
            {adminData.health.warningMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div>
                  <strong className="font-semibold">Model Warning:</strong>{' '}
                  {adminData.health.warningMessage}
                </div>
              </div>
            )}

            {/* Newer Model Suggestion */}
            {adminData.health.newerLiveModelSuggestion && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-blue-700" />
                <div>
                  <strong className="font-semibold">Newer Model Detected:</strong>{' '}
                  The catalog includes <code>{adminData.health.newerLiveModelSuggestion}</code>. To use it, update <code>LIVE_MODEL</code> in your configuration. Models are never switched automatically.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Knowledge Base Freshness */}
        <div className="bg-white border border-[#E6DFD3] rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="text-base font-semibold text-[#1C1917]">
            Knowledge Packs & Freshness Audits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {adminData?.knowledgeFiles.map((kf) => (
              <div
                key={kf.product}
                className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                  kf.isStale
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-[#FBF9F5] border-[#E6DFD3]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1C1917] capitalize">{kf.product}</span>
                  {kf.isStale ? (
                    <span className="text-[10px] text-[#9A3412] font-mono flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{kf.daysOld}d old (Stale)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#14532D] font-mono flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>{kf.daysOld}d old</span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#78716C] font-mono">
                  Checked: {kf.lastChecked}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#57534E] border-t border-[#E6DFD3] pt-2">
                  <span>[Meta]: {kf.metaStatementsCount}</span>
                  <span>·</span>
                  <span>[Reported]: {kf.reportedStatementsCount}</span>
                  <span>·</span>
                  <span>[Unverified]: {kf.unverifiedStatementsCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalations List (Newest First) */}
        <div className="bg-white border border-[#E6DFD3] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1C1917]">
              Escalation Logs ({adminData?.escalations.length || 0})
            </h2>
            <span className="text-xs text-[#78716C]">Newest first · Logged to data/escalations.jsonl</span>
          </div>

          {!adminData || adminData.escalations.length === 0 ? (
            <p className="text-xs text-[#78716C] italic py-4 text-center">
              No escalations recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {adminData.escalations.map((esc) => {
                const isExpanded = expandedEscalationId === esc.id;

                return (
                  <div
                    key={esc.id}
                    className="p-4 bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg text-xs space-y-2 hover:border-[#D6CEBE] transition-colors"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleExpand(esc.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#1C1917]">{esc.userName}</span>
                        <span className="text-[#78716C] font-mono text-[11px]">{esc.userEmail}</span>
                        <span className="px-1.5 py-0.5 bg-[#E6DFD3] text-[#1C1917] rounded text-[10px] uppercase font-mono">
                          {esc.product}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#78716C] font-mono">
                          {new Date(esc.timestamp).toLocaleString()}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#78716C]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#78716C]" />
                        )}
                      </div>
                    </div>

                    <div className="text-[#292524] text-xs">
                      <strong>Blocker:</strong> {esc.blocker}
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[#E6DFD3] space-y-2.5 text-[11px]">
                        <div>
                          <strong className="text-[#57534E]">User Goal:</strong> {esc.goal}
                        </div>
                        <div>
                          <strong className="text-[#57534E]">What was tried:</strong> {esc.tried}
                        </div>
                        <div>
                          <strong className="text-[#57534E]">Screen Observation (Text Only):</strong>{' '}
                          {esc.screenSeen}
                        </div>

                        {esc.proposedTimes && esc.proposedTimes.length > 0 && (
                          <div>
                            <strong className="text-[#57534E]">Proposed Slots:</strong>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {esc.proposedTimes.map((pt, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-white border border-[#E6DFD3] rounded font-mono text-[10px]"
                                >
                                  {pt.displayFormatted}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {esc.transcriptExcerpt && esc.transcriptExcerpt.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-[#57534E]">Transcript Excerpt (Last Turns):</strong>
                            <div className="mt-1 max-h-48 overflow-y-auto bg-white p-2.5 border border-[#E6DFD3] rounded space-y-1 text-[10px] font-mono">
                              {esc.transcriptExcerpt.map((t, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <span className="text-[#9A3412] font-semibold uppercase">{t.role}:</span>
                                  <span className="text-[#292524]">{t.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
