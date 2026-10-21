import { Type, FunctionDeclaration } from '@google/genai';
import { config } from './config.js';
import { getGuidedApps } from './knowledge.js';

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
    description: 'Launches a step-by-step guided app workflow for the user (e.g. safety-first-pass, first-task, weekly-review).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: {
          type: Type.STRING,
          description: 'The identifier of the app to start: safety-first-pass, first-task, or weekly-review.',
        },
      },
      required: ['app_id'],
    },
  },
  {
    name: 'update_routine_progress',
    description: 'Updates the progress of an active guided routine checklist card in the UI as the user completes steps.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: {
          type: Type.STRING,
          description: 'The routine identifier (e.g. safety-first-pass, first-task, weekly-review).',
        },
        completed_step: {
          type: Type.INTEGER,
          description: 'The step number that was just completed (e.g. 1, 2, 3...).',
        },
        next_step: {
          type: Type.INTEGER,
          description: 'The next step number to focus on (e.g. 2, 3...), or null if the routine is fully completed.',
        },
      },
      required: ['app_id', 'completed_step'],
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

    case 'update_routine_progress': {
      const appId = typeof safeArgs.app_id === 'string' ? safeArgs.app_id : '';
      const completedStep = Number(safeArgs.completed_step);
      const nextStep =
        safeArgs.next_step !== undefined && safeArgs.next_step !== null
          ? Number(safeArgs.next_step)
          : null;
      return {
        updated: true,
        app_id: appId,
        completed_step: completedStep,
        next_step: nextStep,
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
