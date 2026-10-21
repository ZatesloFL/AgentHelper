import { Type, FunctionDeclaration } from '@google/genai';
import { config } from './config.js';
import {
  getGuidedApps,
  findCatalogTool,
  normalizeDeviceName,
  UserToolProfileItem,
  DEFAULT_LADDER_RUNGS,
} from './knowledge.js';

function isDoRestrictedPastRung2(doText: string): boolean {
  const lower = String(doText || '').toLowerCase();
  if (!lower) return false;
  return (
    /\b(purchase|purchases|buy|buying|pay|payment|payments|order|checkout)\b/.test(lower) ||
    /\b(public post|public posts|post publicly|publish publicly|social media post)\b/.test(lower) ||
    /\b(send to others|email others|message others|reply to others|forward to others|invite others)\b/.test(
      lower
    )
  );
}

/**
 * Function Declarations for Gemini Live and Text Chat
 */
export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'request_screenshare',
    description: 'Asks the user for permission to view their screen with a specific, plain one-line reason.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: 'A brief, friendly one-line reason why seeing the screen is helpful right now.',
        },
      },
      required: ['reason'],
    },
  },
  {
    name: 'stop_screenshare',
    description: 'Signals that the agent has seen what it needed and screen sharing can now end.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'launch_app',
    description:
      'Launches a step-by-step guided routine workflow for the user (getting-started, news-podcast, calendar-tasks, inbox-triage, first-task, safety-audit, weekly-review, something-went-wrong).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: {
          type: Type.STRING,
          description:
            'The identifier of the routine to start (e.g. getting-started, news-podcast, calendar-tasks, inbox-triage, first-task, safety-audit, weekly-review, something-went-wrong).',
        },
      },
      required: ['app_id'],
    },
  },
  {
    name: 'confirm_step',
    description:
      'Marks a step in the active guided routine as completed once its done_when condition is met, recording how it was verified ("screen" or "user") and a short note.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: {
          type: Type.STRING,
          description:
            'The routine identifier (e.g. getting-started, news-podcast, calendar-tasks, inbox-triage, first-task, safety-audit, weekly-review, something-went-wrong).',
        },
        step: {
          type: Type.INTEGER,
          description: 'The step number that was confirmed (e.g. 1, 2, 3...).',
        },
        evidence: {
          type: Type.STRING,
          description:
            'How the step was verified: "screen" (seen on the shared screen) or "user" (confirmed by the user).',
          enum: ['screen', 'user'],
        },
        note: {
          type: Type.STRING,
          description: 'A brief factual note of what was confirmed or chosen for this step.',
        },
      },
      required: ['app_id', 'step', 'evidence'],
    },
  },
  {
    name: 'update_routine_progress',
    description:
      'Alias for confirm_step that marks a routine step complete with evidence "user" and advances to the next step.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: {
          type: Type.STRING,
          description: 'The routine identifier.',
        },
        completed_step: {
          type: Type.INTEGER,
          description: 'The step number that was just completed (e.g. 1, 2, 3...).',
        },
        next_step: {
          type: Type.INTEGER,
          description:
            'The next step number to focus on (e.g. 2, 3...), or null if the routine is fully completed.',
        },
        note: {
          type: Type.STRING,
          description: 'Optional brief note of what was confirmed.',
        },
      },
      required: ['app_id', 'completed_step'],
    },
  },
  {
    name: 'update_tools_profile',
    description:
      'Updates the user\'s "Your tools" profile when they mention a tool or device they use in chat (e.g., "I use Outlook for work" or naming their device in Getting Started step 1).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        add: {
          type: Type.ARRAY,
          description:
            'Tools from the catalog to add or update in the user\'s profile (e.g. [{ id: "outlook", account: "work", sensitive: true }]).',
          items: {
            type: Type.OBJECT,
            properties: {
              id: {
                type: Type.STRING,
                description:
                  'Catalog tool id or name (e.g. "gmail", "outlook", "icloud-mail", "google-calendar", "outlook-calendar", "apple-calendar", "google-drive", "google-sheets", "onedrive", "dropbox", "local-files", "notion", "apple-reminders", "todoist", "asana", "trello", "clickup", "monday", "ms-todo", "granola", "apple-notes", "onenote", "evernote", "whatsapp", "messenger", "imessage", "android-sms", "slack", "teams", "facebook", "instagram", "threads", "plaid", "shopify", "amazon", "withings", "apple-health", "homekit", "spotify").',
              },
              account: {
                type: Type.STRING,
                description: 'Whether this tool is used for "personal" or "work". Defaults to "personal".',
                enum: ['personal', 'work'],
              },
              sensitive: {
                type: Type.BOOLEAN,
                description:
                  'True if this tool holds sensitive info (money, health, clients, or confidential work).',
              },
            },
            required: ['id'],
          },
        },
        remove: {
          type: Type.ARRAY,
          description: 'List of tool IDs to remove from the user\'s profile.',
          items: {
            type: Type.STRING,
          },
        },
        devices: {
          type: Type.ARRAY,
          description:
            'Devices the user uses Muse on: "Website", "iPhone", "Android", "Mac app", "WhatsApp".',
          items: {
            type: Type.STRING,
          },
        },
      },
    },
  },
  {
    name: 'save_task_contract',
    description:
      'Saves or updates a project task contract and its current autonomy ladder rung (0-3). Call at the end of a project routine (pre-filling fields from the routine\'s Contract section with {placeholders} replaced by what the user said) or after the user confirms changing settings in Muse to move a project up or down a rung.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_id: {
          type: Type.STRING,
          description:
            'The project routine ID (e.g. "news-podcast", "calendar-tasks", "inbox-triage", "first-task").',
        },
        goal: {
          type: Type.STRING,
          description: 'One-sentence task goal.',
        },
        do: {
          type: Type.STRING,
          description: 'Allowed actions for the task.',
        },
        do_not: {
          type: Type.STRING,
          description: 'Forbidden actions, stated plainly.',
        },
        ask_me_before: {
          type: Type.STRING,
          description: 'Actions that require asking the user first.',
        },
        report_back: {
          type: Type.STRING,
          description: 'When, where, and in what format the agent reports back.',
        },
        stop_if: {
          type: Type.STRING,
          description: 'Conditions that should halt the task and alert the user.',
        },
        rung: {
          type: Type.INTEGER,
          description: 'Current autonomy ladder rung from 0 to 3 (0 = Watch, 1 = Draft, 2 = Act with approval, 3 = Standing rule).',
        },
      },
      required: ['project_id', 'goal', 'do', 'do_not', 'ask_me_before', 'report_back', 'stop_if', 'rung'],
    },
  },
  {
    name: 'get_booking_link',
    description: 'Returns the direct scheduling link for confirmed bookings with Nic.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'escalate_to_owner',
    description:
      'Drafts a "Report for Nic" card in the transcript with pre-filled goal, tried, and blocker fields so the user can review, edit, and choose to send it to Nic or open his booking page. Does NOT send anything automatically.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        goal: {
          type: Type.STRING,
          description: 'What the user is trying to accomplish.',
        },
        tried: {
          type: Type.STRING,
          description: 'What steps or checks have already been tried.',
        },
        blocker: {
          type: Type.STRING,
          description: 'What is blocking progress or why human judgment from Nic is needed.',
        },
      },
      required: ['goal', 'tried', 'blocker'],
    },
  },
  {
    name: 'record_audit_result',
    description:
      'Records the check-up audit rating ("green", "amber", or "red") and plain-language reason for a specific safety area after completing a check-up step in safety-audit or weekly-review.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: {
          type: Type.STRING,
          description: 'The check-up routine ID ("safety-audit" or "weekly-review").',
        },
        area: {
          type: Type.STRING,
          description:
            'The audit area covered by the step: "connections", "approvals", "scheduled", "memory", "activity", "privacy", or "money".',
          enum: ['connections', 'approvals', 'scheduled', 'memory', 'activity', 'privacy', 'money'],
        },
        rating: {
          type: Type.STRING,
          description: 'The safety rating for this area based on the step rating guide.',
          enum: ['green', 'amber', 'red'],
        },
        reason: {
          type: Type.STRING,
          description: 'A short, plain-language reason explaining why this area is green, amber, or red.',
        },
      },
      required: ['app_id', 'area', 'rating', 'reason'],
    },
  },
  {
    name: 'report_knowledge_mismatch',
    description:
      'Reports a mismatch when the user\'s screen or menu differs from the guide\'s notes. Call this in addition to save_session_note whenever the screen disagrees with your notes.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          description: 'Short label for the feature, menu, or setting that differs (e.g. "Connectors menu path").',
        },
        notes_say: {
          type: Type.STRING,
          description: 'What the guide\'s product notes expected.',
        },
        screen_shows: {
          type: Type.STRING,
          description: 'What the user\'s screen actually shows.',
        },
        device: {
          type: Type.STRING,
          description: 'Which device or surface the user is on (e.g. "Website", "iPhone", "Android", "Mac app", "WhatsApp").',
        },
      },
      required: ['topic', 'notes_say', 'screen_shows'],
    },
  },
  {
    name: 'save_session_note',
    description:
      'Saves a brief text note (max 500 characters) attached to the current user and product for subsequent continuity.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        text: {
          type: Type.STRING,
          description:
            'Short factual note about preferences, decisions, or screen mismatches (max 500 characters).',
        },
      },
      required: ['text'],
    },
  },
];

/**
 * Shared server-side tool execution used by both text chat (server/models.ts)
 * and live voice WebSocket relay (server/live-proxy.ts).
 */
export function executeServerTool(
  name: string,
  args: Record<string, any> | undefined,
  product: string
): any {
  const safeArgs = args || {};

  switch (name) {
    case 'get_booking_link':
      return { bookingUrl: config.bookingUrl };

    case 'escalate_to_owner': {
      const goal = typeof safeArgs.goal === 'string' ? safeArgs.goal : '';
      const tried = typeof safeArgs.tried === 'string' ? safeArgs.tried : '';
      const blocker =
        typeof safeArgs.blocker === 'string'
          ? safeArgs.blocker
          : typeof safeArgs.summary === 'string'
          ? safeArgs.summary
          : '';
      return {
        drafted: true,
        goal,
        tried,
        blocker,
        bookingUrl: config.bookingUrl,
        instruction:
          'Tell the user plainly: "I\'ve drafted a short note for Nic below. Have a look, change anything you like, and press Send if it looks right. You can also book a time directly."',
      };
    }

    case 'launch_app': {
      const appId = typeof safeArgs.app_id === 'string' ? safeArgs.app_id : '';
      const apps = getGuidedApps(product);
      const matched = apps.find(a => a.id === appId);
      return matched || { id: appId, status: 'launched' };
    }

    case 'confirm_step':
    case 'update_routine_progress': {
      const appId = typeof safeArgs.app_id === 'string' ? safeArgs.app_id : '';
      const rawStep =
        safeArgs.step !== undefined && safeArgs.step !== null
          ? Number(safeArgs.step)
          : Number(safeArgs.completed_step);
      const step = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : 1;
      const evidence: 'screen' | 'user' =
        name === 'confirm_step' && safeArgs.evidence === 'screen' ? 'screen' : 'user';
      const note = typeof safeArgs.note === 'string' ? safeArgs.note.trim().slice(0, 300) : '';

      const apps = getGuidedApps(product);
      const matched = apps.find(a => a.id === appId);
      let nextStep: number | null = null;
      if (safeArgs.next_step !== undefined && safeArgs.next_step !== null) {
        nextStep = Number(safeArgs.next_step);
      } else if (matched && matched.steps.some(s => s.number === step + 1)) {
        nextStep = step + 1;
      }

      return {
        confirmed: true,
        updated: true,
        app_id: appId,
        step,
        completed_step: step,
        next_step: nextStep,
        evidence,
        note,
      };
    }

    case 'update_tools_profile': {
      const rawAdd = Array.isArray(safeArgs.add) ? safeArgs.add : [];
      const rawRemove = Array.isArray(safeArgs.remove) ? safeArgs.remove : [];
      const rawDevices = Array.isArray(safeArgs.devices) ? safeArgs.devices : [];

      const resolvedAdd: UserToolProfileItem[] = [];
      const unrecognisedNames: string[] = [];

      for (const item of rawAdd) {
        const rawId = typeof item === 'string' ? item : item?.id;
        if (!rawId || typeof rawId !== 'string') continue;

        const account: 'personal' | 'work' =
          item?.account === 'work' ? 'work' : 'personal';
        const matched = findCatalogTool(rawId);
        if (matched) {
          const defaultSensitive =
            matched.category.id === 'money' ||
            matched.category.id === 'health' ||
            account === 'work';
          const sensitive =
            typeof item?.sensitive === 'boolean' ? item.sensitive : defaultSensitive;
          resolvedAdd.push({
            id: matched.tool.id,
            name: matched.tool.name,
            category: matched.category.id,
            account,
            sensitive,
          });
        } else {
          unrecognisedNames.push(rawId.trim());
        }
      }

      const resolvedRemove: string[] = [];
      for (const rem of rawRemove) {
        if (typeof rem !== 'string' || !rem.trim()) continue;
        const matched = findCatalogTool(rem);
        resolvedRemove.push(matched ? matched.tool.id : rem.trim());
      }

      const resolvedDevices: string[] = [];
      for (const d of rawDevices) {
        const norm = normalizeDeviceName(d);
        if (norm && !resolvedDevices.includes(norm)) {
          resolvedDevices.push(norm);
        }
      }

      return {
        updated: true,
        add: resolvedAdd,
        remove: resolvedRemove,
        devices: resolvedDevices,
        otherAdded: unrecognisedNames,
      };
    }

    case 'save_task_contract': {
      const rawProjectId =
        typeof safeArgs.project_id === 'string' && safeArgs.project_id.trim()
          ? safeArgs.project_id.trim()
          : 'first-task';
      const apps = getGuidedApps(product);
      const matched = apps.find(
        a =>
          a.id === rawProjectId ||
          a.title.toLowerCase() === rawProjectId.toLowerCase()
      );
      const projectId = matched ? matched.id : rawProjectId;
      const title = matched?.title || rawProjectId;
      const defaultContract = matched?.contract || {};

      const goal = (
        typeof safeArgs.goal === 'string' && safeArgs.goal.trim()
          ? safeArgs.goal.trim()
          : defaultContract.goal || matched?.goal || ''
      ).slice(0, 1000);

      const doField = (
        typeof safeArgs.do === 'string' && safeArgs.do.trim()
          ? safeArgs.do.trim()
          : defaultContract.do || ''
      ).slice(0, 1500);

      const doNotField = (
        typeof safeArgs.do_not === 'string' && safeArgs.do_not.trim()
          ? safeArgs.do_not.trim()
          : defaultContract.do_not || ''
      ).slice(0, 1500);

      const askMeBeforeField = (
        typeof safeArgs.ask_me_before === 'string' && safeArgs.ask_me_before.trim()
          ? safeArgs.ask_me_before.trim()
          : defaultContract.ask_me_before || ''
      ).slice(0, 1000);

      const reportBackField = (
        typeof safeArgs.report_back === 'string' && safeArgs.report_back.trim()
          ? safeArgs.report_back.trim()
          : defaultContract.report_back || ''
      ).slice(0, 1000);

      const stopIfField = (
        typeof safeArgs.stop_if === 'string' && safeArgs.stop_if.trim()
          ? safeArgs.stop_if.trim()
          : defaultContract.stop_if || ''
      ).slice(0, 1000);

      const rawRung = Number(safeArgs.rung);
      let rung = Number.isFinite(rawRung) ? Math.max(0, Math.min(3, Math.round(rawRung))) : 0;
      let cappedAtRung2 = false;
      if (isDoRestrictedPastRung2(doField) && rung > 2) {
        rung = 2;
        cappedAtRung2 = true;
      }

      const ladder =
        matched?.ladder && matched.ladder.length > 0 ? matched.ladder : DEFAULT_LADDER_RUNGS;
      const rungEntry =
        ladder.find(r => r.rung === rung) ||
        DEFAULT_LADDER_RUNGS[rung] ||
        DEFAULT_LADDER_RUNGS[0];

      return {
        saved: true,
        project_id: projectId,
        title,
        contract: {
          goal,
          do: doField,
          do_not: doNotField,
          ask_me_before: askMeBeforeField,
          report_back: reportBackField,
          stop_if: stopIfField,
        },
        rung,
        rungName: rungEntry.name,
        rungText: rungEntry.text,
        ladder,
        cappedAtRung2,
        instruction: cappedAtRung2
          ? 'Note: Because this project includes purchases, public posts, or sending to others in its Do list, it cannot go past rung 2 (Act with approval). Explain why plainly to the user.'
          : undefined,
      };
    }

    case 'record_audit_result': {
      const appId =
        typeof safeArgs.app_id === 'string' && safeArgs.app_id.trim()
          ? safeArgs.app_id.trim()
          : 'safety-audit';
      const validAreas = new Set([
        'connections',
        'approvals',
        'scheduled',
        'memory',
        'activity',
        'privacy',
        'money',
      ]);
      const rawArea = typeof safeArgs.area === 'string' ? safeArgs.area.trim().toLowerCase() : '';
      const area = validAreas.has(rawArea) ? rawArea : 'connections';
      const rawRating =
        typeof safeArgs.rating === 'string' ? safeArgs.rating.trim().toLowerCase() : 'amber';
      const rating: 'green' | 'amber' | 'red' =
        rawRating === 'green' || rawRating === 'amber' || rawRating === 'red'
          ? rawRating
          : 'amber';
      const reason =
        typeof safeArgs.reason === 'string' && safeArgs.reason.trim()
          ? safeArgs.reason.trim().slice(0, 500)
          : '';

      return {
        recorded: true,
        app_id: appId,
        area,
        rating,
        reason,
      };
    }

    case 'report_knowledge_mismatch': {
      const topic =
        typeof safeArgs.topic === 'string' && safeArgs.topic.trim()
          ? safeArgs.topic.trim().slice(0, 300)
          : 'menu or setting';
      const notesSay =
        typeof safeArgs.notes_say === 'string' ? safeArgs.notes_say.trim().slice(0, 1000) : '';
      const screenShows =
        typeof safeArgs.screen_shows === 'string'
          ? safeArgs.screen_shows.trim().slice(0, 1000)
          : '';
      const device =
        normalizeDeviceName(safeArgs.device) ||
        (typeof safeArgs.device === 'string' && safeArgs.device.trim()
          ? safeArgs.device.trim().slice(0, 100)
          : 'Website');

      return {
        reported: true,
        topic,
        notes_say: notesSay,
        screen_shows: screenShows,
        device,
      };
    }

    case 'save_session_note': {
      const text = typeof safeArgs.text === 'string' ? safeArgs.text.trim().slice(0, 500) : '';
      return {
        saved: Boolean(text),
        text,
      };
    }

    case 'request_screenshare':
      return {
        requested: true,
        reason: typeof safeArgs.reason === 'string' ? safeArgs.reason : '',
      };

    case 'stop_screenshare':
      return { stopped: true };

    default:
      return { executed: false, tool: name };
  }
}
