import { useEffect, useState } from 'react';
import { Bell, Check, Copy, Link2, Link2Off, RefreshCw } from 'lucide-react';
import { getIdToken } from '../lib/firebase.js';

// Track 4 MVP skeleton, part 1: template-update notice.
// Shown on a project card when the project's template has a newer version
// than the one the member's project is pinned to. Deliberately shallow:
// "Use the new version" re-pins the project (the member's saved contract
// text is NOT silently rewritten — applying changed layer text is the
// later build-out), "Not now" dismisses the notice for that version only.
export function TemplateUpdateNotice({
  currentVersion,
  latestVersion,
  onUseNew,
  onDismiss,
}: {
  currentVersion?: number;
  latestVersion: number;
  onUseNew: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#D9C98A] bg-[#FBF6E3] px-3 py-2.5 space-y-1.5">
      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#57534E]">
        <Bell className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#9A7B1C]" />
        <span>
          <strong className="text-[#1C1917]">A newer version of this template is available</strong>{' '}
          (version {latestVersion}
          {typeof currentVersion === 'number' ? `; your project uses version ${currentVersion}` : ''}).
          Your saved setup stays exactly as it is either way — switching just moves your project to
          the new version, and we'll walk through anything that changed together.
        </span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUseNew}
          className="px-2.5 py-1.5 rounded-lg bg-[#405D1A] hover:bg-[#365013] text-white text-[11px] font-semibold transition-colors"
        >
          Use version {latestVersion}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] bg-white hover:bg-[#F4F0E8] text-[11px] font-medium text-[#1C1917] transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

type LinkStatus = { active: boolean; createdAt?: string | null; fetchCount?: number; lastFetchedAt?: string | null };

// Track 4 MVP skeleton, part 2: the assistant instruction link.
// The server stores only a hash of the token, so the working URL is shown
// exactly once — right after Create/Reset. After that the card shows the
// link is on (plus fetch count), and Reset is how you get a new one.
function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function InstructionLinkCard({
  projectId,
  onHelpFinish,
}: {
  projectId: string;
  /** Opens the Begin chat when a brief has gone unread for 48+ hours. */
  onHelpFinish?: () => void;
}) {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const call = async (method: string): Promise<any> => {
    const token = await getIdToken();
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/instruction-link`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Something went wrong. Try again.');
    return data;
  };

  const load = async () => {
    try {
      const data = await call('GET');
      setStatus(data);
    } catch {
      setStatus({ active: false });
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const createOrReset = async () => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const data = await call('POST');
      setUrl(data.url);
      setStatus({ active: true, createdAt: data.createdAt, fetchCount: 0, lastFetchedAt: null });
      setNote('Here is your link — copy it now. For your safety we can\u2019t show it again; if you lose it, choose Reset to make a new one (the old one stops working).');
    } catch (e: any) {
      setError(e?.message || 'Could not create the link.');
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    setError(null);
    try {
      await call('DELETE');
      setUrl(null);
      setStatus({ active: false });
      setNote('Link turned off. Anything already using it will stop working.');
    } catch (e: any) {
      setError(e?.message || 'Could not turn the link off.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, which: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Copy didn\u2019t work in this browser — select the text and copy it by hand.');
    }
  };

  const copyInstructions = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/instructions.txt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load the instructions.');
      await copy(await res.text(), 'text');
    } catch (e: any) {
      setError(e?.message || 'Could not load the instructions.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#E6DFD3] bg-[#FAF8F3] px-3 py-2.5 space-y-1.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1C1917]">
        <Link2 className="w-3.5 h-3.5 text-[#405D1A]" />
        Assistant link
      </p>
      <p className="text-[11px] leading-relaxed text-[#57534E]">
        Give this private link to your AI assistant and it can read this project&apos;s setup — your
        goal and guardrails, nothing else from your account. Only give it to your own assistant.
      </p>

      {status === null ? (
        <p className="text-[11px] text-[#78716C]">Checking…</p>
      ) : url ? (
        <div className="space-y-1.5">
          <p className="break-all rounded-md bg-white border border-[#E6DFD3] px-2 py-1.5 text-[11px] font-mono text-[#1C1917]">
            {url}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copy(url, 'url')}
              className="px-2.5 py-1.5 rounded-lg bg-[#405D1A] hover:bg-[#365013] text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              {copied === 'url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied === 'url' ? 'Copied' : 'Copy link'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void turnOff()}
              className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] bg-white hover:bg-[#F4F0E8] text-[11px] font-medium text-[#1C1917] transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Link2Off className="w-3 h-3" /> Turn off
            </button>
          </div>
        </div>
      ) : status.active ? (
        <div className="space-y-1.5">
          <p className="text-[11px] text-[#57534E]">
            <strong className="text-[#1C1917]">On.</strong>{' '}
            {status.fetchCount
              ? `Brief last read ${timeAgo(status.lastFetchedAt) || 'recently'} (${status.fetchCount} read${status.fetchCount === 1 ? '' : 's'} total).`
              : 'Your assistant hasn\u2019t read it yet.'}{' '}
            We can&apos;t show the link again — Reset makes a new one and stops the old one working.
          </p>
          {!status.fetchCount &&
            status.createdAt &&
            Date.now() - new Date(status.createdAt).getTime() > 48 * 3600 * 1000 && (
              <div className="rounded-md border border-[#D9C98A] bg-[#FBF6E3] px-2 py-1.5">
                <p className="text-[11px] leading-relaxed text-[#57534E]">
                  <strong className="text-[#1C1917]">Your helper hasn't read its brief yet.</strong>{' '}
                  The link has been waiting more than two days — the Begin steps walk you through
                  pasting it, it takes about two minutes.
                </p>
                {onHelpFinish && (
                  <button
                    type="button"
                    onClick={onHelpFinish}
                    className="mt-1 px-2.5 py-1.5 rounded-lg bg-[#405D1A] hover:bg-[#365013] text-white text-[11px] font-semibold transition-colors"
                  >
                    Help me finish
                  </button>
                )}
              </div>
            )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void createOrReset()}
              className="px-2.5 py-1.5 rounded-lg bg-[#405D1A] hover:bg-[#365013] text-white text-[11px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset link
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void turnOff()}
              className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] bg-white hover:bg-[#F4F0E8] text-[11px] font-medium text-[#1C1917] transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Link2Off className="w-3 h-3" /> Turn off
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void createOrReset()}
          className="px-2.5 py-1.5 rounded-lg bg-[#405D1A] hover:bg-[#365013] text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
        >
          Create my link
        </button>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => void copyInstructions()}
        className="text-[11px] font-medium text-[#405D1A] hover:underline disabled:opacity-50 flex items-center gap-1"
      >
        {copied === 'text' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied === 'text' ? 'Copied' : 'Or copy the instructions as text instead'}
      </button>

      {note && <p className="text-[11px] leading-relaxed text-[#57534E]">{note}</p>}
      {error && <p className="text-[11px] leading-relaxed text-[#9A3412]">{error}</p>}
    </div>
  );
}
