import React, { useEffect, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import {
  AuthUser,
  TemplateDoc,
  TemplateLayer,
  UserProjectDoc,
  getIdToken,
  getUserProjects,
  updateUserProjectFields,
} from '../lib/firebase.js';
import { getTemplateWithFallback } from '../lib/templates.js';

// Begin chat (Project Setup Flow Redesign Spec section 7). Saving a project
// never mints a token; beginning does. The flow: mint the instruction link,
// hand the member ONE paste sentence (URL inside it), walk the chosen
// helper's memberSteps one at a time, then check the helper's reply for the
// brief's confirmation phrase — only that marks the project ACTIVE.

const AGENT_NAMES: Record<string, string> = {
  muse: 'Meta Muse',
  grok: 'Grok',
  chatgpt: 'ChatGPT',
  gemini: 'Google Gemini',
  claude: 'Claude',
};

type BeginStep = 'start' | 'link' | 'steps' | 'confirm' | 'done';

const primaryBtn =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm disabled:opacity-50';
const ghostBtn =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm text-[#1C1917] bg-white disabled:opacity-50';

export const BeginProject: React.FC<{
  user: AuthUser;
  project: UserProjectDoc;
  onClose: () => void;
  onProjectsChanged: (projects: Record<string, UserProjectDoc>) => void;
}> = ({ user, project, onClose, onProjectsChanged }) => {
  const [step, setStep] = useState<BeginStep>('start');
  const [template, setTemplate] = useState<TemplateDoc | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [hasLink, setHasLink] = useState<boolean>(project.status === 'active');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  const product = project.product || 'muse';
  const agentName = AGENT_NAMES[product] || 'Meta Muse';
  const title = project.title || template?.title || 'your project';
  const rawLayer: TemplateLayer | string | undefined = template?.platformLayers?.[product];
  const layer: TemplateLayer | null =
    rawLayer && typeof rawLayer === 'object' ? rawLayer : null;
  const memberSteps: string[] =
    layer?.memberSteps && layer.memberSteps.length > 0
      ? layer.memberSteps
      : [
          `Open ${agentName} and start a new conversation.`,
          'Paste the sentence below and send it.',
          'Wait for its reply — it should confirm it loaded your brief.',
        ];
  const memberTrigger: string | undefined = (layer as any)?.requirements?.runModes?.onDemand
    ?.memberTrigger;
  const pasteSentence = url
    ? `Read this link at the start of every session and follow it as your standing brief for my ${title}: ${url}`
    : '';

  const call = async (method: string, path: string): Promise<any> => {
    const token = await getIdToken();
    const res = await fetch(path, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Something went wrong. Try again.');
    return data;
  };

  useEffect(() => {
    (async () => {
      if (project.templateSlug) {
        setTemplate(await getTemplateWithFallback(project.templateSlug));
      }
      try {
        const status = await call(
          'GET',
          `/api/projects/${encodeURIComponent(project.projectId)}/instruction-link`,
        );
        setHasLink(Boolean(status?.active));
        if (status?.active && project.status === 'active') setStep('steps');
      } catch {
        /* link status is a nicety here; minting still works */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mint = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await call(
        'POST',
        `/api/projects/${encodeURIComponent(project.projectId)}/instruction-link`,
      );
      setUrl(data.url);
      setHasLink(true);
      setStep('link');
    } catch (e: any) {
      setError(e?.message || 'Could not create the link just now.');
    } finally {
      setBusy(false);
    }
  };

  const copySentence = async () => {
    try {
      await navigator.clipboard.writeText(pasteSentence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Copy did not work — select the sentence and copy it by hand.');
    }
  };

  const loadFallback = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getIdToken();
      const res = await fetch(
        `/api/projects/${encodeURIComponent(project.projectId)}/instructions.txt`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error('Could not load the text version.');
      setFallbackText(await res.text());
    } catch (e: any) {
      setError(e?.message || 'Could not load the text version.');
    } finally {
      setBusy(false);
    }
  };

  const checkReply = async () => {
    setReplyError(null);
    if (!reply.includes('Second Look brief loaded')) {
      setReplyError(
        `That doesn't look like the confirmation yet — it should start with "Second Look brief loaded: ${title}". If ${agentName} says it can't open links, use the "can't open links" option on the steps screen and paste the text instead.`,
      );
      return;
    }
    setBusy(true);
    try {
      if (project.status !== 'active') {
        await updateUserProjectFields(user.uid, project.projectId, { status: 'active' });
      }
      const map = await getUserProjects(user.uid);
      onProjectsChanged(map);
      setStep('done');
    } catch (e: any) {
      setReplyError(e?.message || 'Your brief loaded, but saving that here hiccuped — tell Nic.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-[#FBF9F5] w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-editorial font-medium text-[#1C1917]">
              Begin {title}
            </h2>
            <p className="text-sm text-[#57534E] mt-0.5">with {agentName}, one step at a time</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm text-[#57534E] hover:text-[#1C1917]"
            aria-label="Close"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {error && <p className="text-sm text-[#991B1B] mb-3">{error}</p>}

        {step === 'start' && (
          <div>
            <p className="text-sm text-[#57534E] mb-3">
              Beginning connects this project to {agentName}: we'll make a private link to your
              project brief, you'll paste one sentence into {agentName}, and it will confirm it
              loaded your brief. Nothing starts before that confirmation — and you can stop any
              time.
            </p>
            <p className="text-sm text-[#57534E] mb-4">
              Keep this window open and {agentName} open in another tab or app — you'll go back
              and forth a couple of times. If looking at two screens is hard, asking the guide in
              this app to watch your screen while you work is a good move.
            </p>
            {hasLink ? (
              <button className={primaryBtn} onClick={() => setStep('steps')}>
                My link is already made — walk me through it
              </button>
            ) : (
              <button className={primaryBtn} disabled={busy} onClick={() => void mint()}>
                {busy ? 'Making your link…' : 'Make my brief link'}
              </button>
            )}
          </div>
        )}

        {step === 'link' && (
          <div>
            <p className="text-sm text-[#57534E] mb-3">
              Here is the one sentence to paste into {agentName}. Copy the whole thing — the link
              inside it is private, and this is the only time we'll show it. (If you lose it, your
              project card can make a new one.)
            </p>
            <div className="bg-white border border-[#E6DFD3] rounded-lg p-3 text-sm text-[#1C1917] mb-3 break-all">
              {pasteSentence}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={primaryBtn} onClick={() => void copySentence()}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy the whole sentence
                  </>
                )}
              </button>
              <button className={ghostBtn} onClick={() => setStep('steps')}>
                copied — walk me through the steps
              </button>
            </div>
          </div>
        )}

        {step === 'steps' && (
          <div>
            <p className="text-sm text-[#57534E] mb-1">
              Step {stepIdx + 1} of {memberSteps.length}
            </p>
            <div className="bg-white border border-[#E6DFD3] rounded-lg p-4 mb-3">
              <p className="text-sm text-[#1C1917]">{memberSteps[stepIdx]}</p>
            </div>
            {url && stepIdx === 0 && (
              <button className={ghostBtn + ' mb-3'} onClick={() => void copySentence()}>
                {copied ? 'Copied ✓' : 'Copy the paste sentence again'}
              </button>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {stepIdx > 0 && (
                <button className={ghostBtn} onClick={() => setStepIdx(stepIdx - 1)}>
                  Back
                </button>
              )}
              {stepIdx < memberSteps.length - 1 ? (
                <button className={primaryBtn} onClick={() => setStepIdx(stepIdx + 1)}>
                  Done — next step
                </button>
              ) : (
                <button className={primaryBtn} onClick={() => setStep('confirm')}>
                  {agentName} replied — check it
                </button>
              )}
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-[#57534E]">
                {agentName} says it can't open links
              </summary>
              <div className="mt-2">
                <p className="text-sm text-[#57534E] mb-2">
                  No problem — paste the brief as text instead. It works exactly the same; the
                  link is just tidier.
                </p>
                {!fallbackText ? (
                  <button className={ghostBtn} disabled={busy} onClick={() => void loadFallback()}>
                    {busy ? 'Loading…' : 'Show the text version'}
                  </button>
                ) : (
                  <>
                    <div className="bg-white border border-[#E6DFD3] rounded-lg p-3 text-xs text-[#1C1917] whitespace-pre-wrap max-h-48 overflow-y-auto mb-2">
                      {fallbackText}
                    </div>
                    <button
                      className={ghostBtn}
                      onClick={() => void navigator.clipboard.writeText(fallbackText)}
                    >
                      <Copy className="w-4 h-4" /> Copy the brief text
                    </button>
                    {layer?.pasteText && (
                      <p className="text-sm text-[#57534E] mt-2">{layer.pasteText}</p>
                    )}
                  </>
                )}
              </div>
            </details>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            <p className="text-sm text-[#57534E] mb-3">
              Paste what {agentName} replied here. We're looking for one line: "Second Look brief
              loaded: {title} v{project.templateVersion ?? ''}" — that's how we know your brief
              really arrived, not just that a message was sent.
            </p>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-[#E6DFD3] text-sm bg-white focus:outline-none focus:border-[#405D1A] mb-3"
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Paste ${agentName}'s reply here`}
            />
            {replyError && <p className="text-sm text-[#991B1B] mb-3">{replyError}</p>}
            <div className="flex flex-wrap gap-2">
              <button className={ghostBtn} onClick={() => setStep('steps')}>
                Back to the steps
              </button>
              <button
                className={primaryBtn}
                disabled={busy || !reply.trim()}
                onClick={() => void checkReply()}
              >
                {busy ? 'Checking…' : 'Check the reply'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div>
            <p className="text-sm text-[#1C1917] font-medium mb-2 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#405D1A]" /> {title} is live with {agentName}.
            </p>
            <p className="text-sm text-[#57534E] mb-3">
              {memberTrigger
                ? `Your first step: in ${agentName}, say — ${memberTrigger}`
                : `Your first step: open ${agentName} and give it today's first small task for ${title}.`}
            </p>
            <h3 className="text-sm font-medium text-[#1C1917] mb-1">How this works from here</h3>
            <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-1 mb-4">
              <li>Your helper suggests and drafts; you approve everything (rung 0).</li>
              {project.checkInRhythm && <li>Check-ins: {project.checkInRhythm}</li>}
              <li>Only you can give your helper more freedom, and only here in the app.</li>
              <li>
                If it ever seems to forget your brief, paste the sentence again — your project
                card can make a fresh link any time.
              </li>
            </ul>
            <button className={primaryBtn} onClick={onClose}>
              Back to my projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
