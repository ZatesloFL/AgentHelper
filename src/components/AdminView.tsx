import React, { useState, useEffect } from 'react';
import { authFetch, AuthUser } from '../lib/firebase.js';
import {
  Lock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AdminData {
  health: {
    checkedAt: string;
    liveModel: string;
    textModel: string;
    textModelFallback?: string | null;
    liveModelOk: boolean;
    textModelOk: boolean;
    textModelFallbackOk?: boolean;
    liveAvailable: boolean;
    newerLiveModelSuggestion: string | null;
    warningMessage: string | null;
    thinkingLevels?: {
      chat: 'low' | 'high';
      summary: 'low' | 'high';
      reportDraft: 'low' | 'high';
    };
  };
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
    textModel: string;
    textModelFallback?: string | null;
    thinkingLevels?: {
      chat: 'low' | 'high';
      summary: 'low' | 'high';
      reportDraft: 'low' | 'high';
    };
    bookingUrl: string;
    sheetUrl: string;
    sheetWebhookUrlSet: boolean;
    ownerEmail: string;
    ownerName: string;
    ownerTimezone: string;
  };
}

interface AdminViewProps {
  user: AuthUser | null;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ user, onBack }) => {
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    setLoading(true);
    setIsForbidden(false);
    try {
      const res = await authFetch('/api/admin/data');
      if (res.status === 403 || res.status === 401) {
        setIsForbidden(true);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
      } else {
        setIsForbidden(true);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setIsForbidden(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  if (loading && !adminData && !isForbidden) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-4">
        <div className="text-xs text-[#78716C] font-mono">Checking owner access...</div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E6DFD3] rounded-xl max-w-sm w-full p-6 shadow-md text-[#1C1917] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F4F0E8] border border-[#E6DFD3] flex items-center justify-center text-[#1C1917]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-medium">Admin Console</h3>
            </div>
          </div>

          <p className="text-sm text-[#57534E] leading-relaxed">
            This page is for the site owner.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-[#78716C] hover:text-[#1C1917] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Guide</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const thinkingLevels = adminData?.health?.thinkingLevels ||
    adminData?.config?.thinkingLevels || {
      chat: 'low',
      summary: 'high',
      reportDraft: 'high',
    };

  const fallbackModel =
    adminData?.health?.textModelFallback ?? adminData?.config?.textModelFallback ?? null;

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
              Model Health, Thinking Levels, Handoff Reports & Knowledge Freshness
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchAdminData()}
          disabled={loading}
          className="px-3 py-1.5 bg-[#F4F0E8] border border-[#E6DFD3] rounded text-xs font-medium hover:bg-[#EAE4D7] flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Warning if SHEET_WEBHOOK_URL is not configured */}
        {adminData && !adminData.config.sheetWebhookUrlSet && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div>
              <strong className="font-semibold">SHEET_WEBHOOK_URL is not configured:</strong>{' '}
              The "Send report to Nic" button is currently hidden in the user UI and only the direct booking link is shown. Set <code>SHEET_WEBHOOK_URL</code> and <code>SHEET_WEBHOOK_SECRET</code> in your environment to enable sending handoff reports to Google Sheets.
            </div>
          </div>
        )}

        {/* Model Health Check & Thinking Levels Section */}
        {adminData?.health && (
          <div className="bg-white border border-[#E6DFD3] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1C1917] flex items-center gap-2">
                <span>Gemini Model Health & Thinking Configuration</span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#78716C]">LIVE_MODEL:</span>
                  <span className="font-semibold text-[#1C1917]">{adminData.health.liveModel}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {adminData.health.liveModelOk ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#14532D]" />
                      <span className="text-[#14532D]">Exact match in catalog</span>
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
                      <span className="text-[#14532D]">Exact match in catalog</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span className="text-[#9A3412]">Not found in catalog</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#78716C]">TEXT_MODEL_FALLBACK:</span>
                  <span className="font-semibold text-[#1C1917]">
                    {fallbackModel || 'None (not set)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {!fallbackModel ? (
                    <span className="text-[#78716C]">Optional (used on 429/503 after retry)</span>
                  ) : adminData.health.textModelFallbackOk ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#14532D]" />
                      <span className="text-[#14532D]">Exact match in catalog</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span className="text-[#9A3412]">Not found in catalog</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Automatic Thinking Levels per Text Task */}
            <div className="p-3.5 bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1C1917]">
                  Automatic Thinking Level per Text Task
                </span>
                <span className="text-[11px] text-[#78716C] font-mono">
                  Set in code · Never sent to live voice model
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 bg-white border border-[#E6DFD3] rounded flex items-center justify-between">
                  <div>
                    <span className="font-mono font-semibold text-[#1C1917] block">chat</span>
                    <span className="text-[10px] text-[#78716C]">POST /api/chat</span>
                  </div>
                  <span className="font-mono uppercase px-2 py-0.5 rounded bg-[#F4F0E8] border border-[#E6DFD3] text-[#1C1917] font-semibold">
                    {thinkingLevels.chat}
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-[#E6DFD3] rounded flex items-center justify-between">
                  <div>
                    <span className="font-mono font-semibold text-[#1C1917] block">summary</span>
                    <span className="text-[10px] text-[#78716C]">POST /api/summarize</span>
                  </div>
                  <span className="font-mono uppercase px-2 py-0.5 rounded bg-[#14532D]/10 border border-[#14532D]/20 text-[#14532D] font-semibold">
                    {thinkingLevels.summary}
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-[#E6DFD3] rounded flex items-center justify-between">
                  <div>
                    <span className="font-mono font-semibold text-[#1C1917] block">reportDraft</span>
                    <span className="text-[10px] text-[#78716C]">POST /api/report/draft</span>
                  </div>
                  <span className="font-mono uppercase px-2 py-0.5 rounded bg-[#14532D]/10 border border-[#14532D]/20 text-[#14532D] font-semibold">
                    {thinkingLevels.reportDraft}
                  </span>
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

        {/* Handoff Reports (Google Sheet) */}
        <div className="bg-white border border-[#E6DFD3] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#1C1917]">
              Handoff Reports
            </h2>
            <p className="text-xs text-[#78716C]">
              User-approved handoff reports are sent directly to your configured Google Sheet.
            </p>
          </div>

          {adminData?.config.sheetUrl ? (
            <a
              href={adminData.config.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-medium rounded-lg inline-flex items-center gap-2 transition-colors shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open handoff reports (Google Sheet)</span>
            </a>
          ) : (
            <span className="text-xs text-[#78716C] font-mono bg-[#FBF9F5] border border-[#E6DFD3] px-3 py-2 rounded-lg">
              Set SHEET_URL in environment to enable direct link
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
