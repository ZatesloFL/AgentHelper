import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { config } from './server/config.js';
import {
  runModelHealthCheck,
  currentHealthStatus,
  handleTextChat,
  handleSummarize,
  handleReportDraft,
  getThinkingLevelsConfig,
} from './server/models.js';
import {
  getAllRegisteredProducts,
  getKnowledge,
  getGuidedApps,
  getToolsCatalog,
} from './server/knowledge.js';
import { getEnabledProducts, isKnownProduct } from './server/products.js';
import { requireUser, requireAdmin } from './server/auth.js';
import {
  rateLimitChat,
  rateLimitReport,
  recordReportSendSuccess,
  rateLimitSummarize,
  rateLimitReportDraft,
  rateLimitToolsShare,
  recordToolsShareSuccess,
  rateLimitCorrections,
  recordCorrectionSendSuccess,
} from './server/rate-limit.js';
import {
  dispatchHandoffReport,
  dispatchToolsShare,
  dispatchCorrection,
} from './server/escalations.js';
import { setupLiveWebSocket } from './server/live-proxy.js';
import {
  handleGetMembership,
  handleMembershipSync,
  handleNicTimeSync,
  handleAdminAdjust,
} from './server/membership.js';
import { handleImportTemplates } from './server/templates.js';
import {
  handleCreateInstructionLink,
  handleGetInstructionLink,
  handleRevokeInstructionLink,
  handleGetInstructionsText,
  handleServeInstructions,
} from './server/instructions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_SCREEN_FRAME_BASE64 = 2 * 1024 * 1024; // 2 MB base64

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: '4mb' }));

  // Run initial model health check
  runModelHealthCheck().catch(err => console.error('Initial health check failed:', err));

  // --- Public API Routes (no auth required) ---

  // Health & Model Status
  app.get('/api/health', (_req, res) => {
    res.json({
      ...currentHealthStatus,
      bookingUrl: config.bookingUrl,
      sheetWebhookConfigured: Boolean(config.sheetWebhookUrl),
    });
  });

  // Products (returns only enabled products from registry, using `name` as display label)
  app.get('/api/products', (_req, res) => {
    const enabled = getEnabledProducts();
    const detailed = enabled.map(p => {
      const k = getKnowledge(p.id);
      return {
        id: p.id,
        name: p.name,
        title: p.name,
        enabled: p.enabled,
        lastChecked: k.lastChecked,
        isStale: k.isStale,
      };
    });
    res.json(detailed);
  });

  // Track 4: public instruction link. The unguessable token is the only
  // credential; unknown/revoked tokens get a bare 404. Registered before
  // requireUser and before the SPA fallback on purpose.
  app.get('/i/:token', handleServeInstructions);

  // --- My Plan sync endpoints (SYNC_SECRET, not user auth) ---
  // These sit before requireUser so Supabase Edge Functions can forward
  // purchase/booking events without a Firebase ID token.
  app.post('/api/membership/sync', handleMembershipSync);
  app.post('/api/nic-time/sync', handleNicTimeSync);

  // --- Authenticated API Routes (requireUser applied to every other /api route) ---
  app.use('/api', requireUser);

  // My Plan (signed-in user reads their own membership copy + Nic-time ledger)
  app.get('/api/membership', handleGetMembership);

  // Track 4: per-project instruction links (owner-only management +
  // copy-paste fallback text; the public fetch lives at /i/:token above)
  app.get('/api/projects/:projectId/instruction-link', handleGetInstructionLink);
  app.post('/api/projects/:projectId/instruction-link', handleCreateInstructionLink);
  app.delete('/api/projects/:projectId/instruction-link', handleRevokeInstructionLink);
  app.get('/api/projects/:projectId/instructions.txt', handleGetInstructionsText);
  app.post('/api/admin/membership/adjust', handleAdminAdjust);

  // Current signed-in user info & admin status
  app.get('/api/me', (req, res) => {
    const email = (req.user?.email || '').toLowerCase();
    const isAdmin = Boolean(email && config.adminEmails.includes(email));
    res.json({
      uid: req.user?.uid,
      email: req.user?.email,
      name: req.user?.name,
      isAdmin,
    });
  });

  // Text Chat Fallback (20 req/min per uid, validated product & input caps)
  app.post('/api/chat', rateLimitChat, async (req, res) => {
    try {
      const {
        product = 'muse',
        messages,
        userTimezone,
        currentScreenFrame,
        routineState,
        progressSummary,
        sessionNotes,
        toolsProfile,
        userProjects,
        latestAudit,
      } = req.body || {};

      if (!isKnownProduct(product)) {
        return res.status(400).json({ error: `Unknown product "${product}".` });
      }

      if (
        currentScreenFrame &&
        typeof currentScreenFrame === 'string' &&
        currentScreenFrame.length > MAX_SCREEN_FRAME_BASE64
      ) {
        return res.status(400).json({
          error: 'The shared screen image is larger than the 2 MB limit. Please try sharing a smaller window.',
        });
      }

      const rawMessages = Array.isArray(messages) ? messages : [];
      const cappedMessages = rawMessages.slice(-60).map((m: any) => ({
        role: typeof m?.role === 'string' ? m.role : 'user',
        text: typeof m?.text === 'string' ? m.text.slice(0, 4000) : '',
      }));

      const normalizedRoutineState =
        routineState && typeof routineState === 'object'
          ? {
              activeRoutineId:
                typeof routineState.activeRoutineId === 'string' ? routineState.activeRoutineId : null,
              completedSteps: Array.isArray(routineState.completedSteps)
                ? routineState.completedSteps.map((n: any) => Number(n))
                : [],
              activeStep: typeof routineState.activeStep === 'number' ? routineState.activeStep : null,
            }
          : null;

      // User's name and email ALWAYS come from the verified token
      const result = await handleTextChat({
        userName: req.user!.name,
        userEmail: req.user!.email,
        product,
        messages: cappedMessages,
        userTimezone: userTimezone || 'America/New_York',
        currentScreenFrame: currentScreenFrame || null,
        routineState: normalizedRoutineState,
        progressSummary: progressSummary || null,
        sessionNotes: Array.isArray(sessionNotes)
          ? sessionNotes.filter((n: any) => typeof n === 'string').slice(0, 20)
          : [],
        toolsProfile: toolsProfile && typeof toolsProfile === 'object' ? toolsProfile : null,
        userProjects: Array.isArray(userProjects) ? userProjects : null,
        latestAudit: latestAudit && typeof latestAudit === 'object' ? latestAudit : null,
      });
      res.json(result);
    } catch (err: any) {
      console.error('Chat generation failed:', err?.message || err);
      res.status(503).json({
        error: "I couldn't reach the guide just now. Your message is saved.",
        message: "I couldn't reach the guide just now. Your message is saved.",
      });
    }
  });

  // Session Progress Summarize (20 req/hour per uid)
  // Body: { product, transcript (last 80 messages), routineState, previousSummary }
  app.post('/api/summarize', rateLimitSummarize, async (req, res) => {
    try {
      const {
        product = 'muse',
        transcript,
        messages,
        routineState,
        previousSummary,
      } = req.body || {};

      if (!isKnownProduct(product)) {
        return res.status(400).json({ error: `Unknown product "${product}".` });
      }

      const rawTranscript = Array.isArray(transcript)
        ? transcript
        : Array.isArray(messages)
        ? messages
        : [];

      const result = await handleSummarize({
        userName: req.user!.name,
        product,
        transcript: rawTranscript.slice(-80),
        routineState: routineState || null,
        previousSummary: previousSummary || null,
      });
      res.json(result);
    } catch (err: any) {
      res.status(503).json({ error: err?.message || 'Summary generation failed' });
    }
  });

  // Report Pre-fill with High Thinking (10 req/hour per uid)
  // Body: { product, transcript (last 40 messages), progressSummary, routineState }
  app.post('/api/report/draft', rateLimitReportDraft, async (req, res) => {
    try {
      const {
        product = 'muse',
        transcript,
        progressSummary,
        routineState,
      } = req.body || {};

      if (!isKnownProduct(product)) {
        return res.status(400).json({ error: `Unknown product "${product}".` });
      }

      const rawTranscript = Array.isArray(transcript) ? transcript : [];

      const result = await handleReportDraft({
        userName: req.user!.name,
        product,
        transcript: rawTranscript.slice(-40),
        progressSummary: progressSummary || null,
        routineState: routineState || null,
      });
      res.json(result);
    } catch (err: any) {
      res.status(503).json({ error: err?.message || 'Report draft generation failed' });
    }
  });

  // Handoff Report to Google Sheet (5 successful sends per day per uid; userName & userEmail always from verified token)
  const handleReportHandler = async (req: express.Request, res: express.Response) => {
    try {
      const body = req.body || {};
      const product = body.product || 'muse';
      if (!isKnownProduct(product)) {
        return res.status(400).json({ error: `Unknown product "${product}".` });
      }

      const includeTranscript = body.includeTranscript !== false;
      const result = await dispatchHandoffReport({
        userName: req.user!.name,
        userEmail: req.user!.email,
        product,
        goal: typeof body.goal === 'string' ? body.goal : '',
        tried: typeof body.tried === 'string' ? body.tried : '',
        blocker: typeof body.blocker === 'string' ? body.blocker : '',
        includeTranscript,
        transcript: body.transcript,
        routineProgress: typeof body.routineProgress === 'string' ? body.routineProgress : '',
        progressSummary: typeof body.progressSummary === 'string' ? body.progressSummary : '',
      });

      if (!result.ok) {
        return res.status(502).json({
          ok: false,
          error: "I couldn't send that just now. Nothing was lost — you can try again, or open Nic's booking page.",
          bookingUrl: config.bookingUrl,
        });
      }

      recordReportSendSuccess(req.user!.uid);

      return res.json({
        ok: true,
        id: result.id,
        bookingUrl: config.bookingUrl,
      });
    } catch (err: any) {
      return res.status(502).json({
        ok: false,
        error: "I couldn't send that just now. Nothing was lost — you can try again, or open Nic's booking page.",
        bookingUrl: config.bookingUrl,
      });
    }
  };

  app.post('/api/report', rateLimitReport, handleReportHandler);
  app.post('/api/escalate', rateLimitReport, handleReportHandler);

  // Tools Catalog (auth required)
  app.get('/api/tools-catalog', (_req, res) => {
    res.json(getToolsCatalog());
  });

  // Anonymous Tools Profile Share with Nic (10 sends per day per uid; no name or email)
  app.post('/api/tools-share', rateLimitToolsShare, async (req, res) => {
    try {
      const body = req.body || {};
      const result = await dispatchToolsShare({
        uid: req.user!.uid,
        devices: body.devices ?? body.device,
        tools: Array.isArray(body.tools) ? body.tools : [],
        other: typeof body.other === 'string' ? body.other : '',
      });

      if (!result.ok) {
        return res.status(502).json({
          ok: false,
          error: "Couldn't share your anonymous tool list right now. Your profile is still saved to your account.",
        });
      }

      recordToolsShareSuccess(req.user!.uid);
      return res.json({
        ok: true,
        anonId: result.anonId,
      });
    } catch (err: any) {
      return res.status(502).json({
        ok: false,
        error: "Couldn't share your anonymous tool list right now. Your profile is still saved to your account.",
      });
    }
  });

  // Opt-in Knowledge Mismatch Corrections to Nic (20 sends per day per uid; no name, email, or images)
  app.post('/api/corrections', rateLimitCorrections, async (req, res) => {
    try {
      const body = req.body || {};
      const product = typeof body.product === 'string' ? body.product : 'muse';
      if (!isKnownProduct(product)) {
        return res.status(400).json({ error: `Unknown product "${product}".` });
      }

      const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
      const notesSay =
        typeof body.notesSay === 'string'
          ? body.notesSay.trim()
          : typeof body.notes_say === 'string'
          ? body.notes_say.trim()
          : '';
      const screenShows =
        typeof body.screenShows === 'string'
          ? body.screenShows.trim()
          : typeof body.screen_shows === 'string'
          ? body.screen_shows.trim()
          : '';
      const device = typeof body.device === 'string' && body.device.trim() ? body.device.trim() : 'Website';

      if (!topic) {
        return res.status(400).json({ ok: false, error: 'Missing topic for correction note.' });
      }

      const result = await dispatchCorrection({
        product,
        device,
        topic,
        notesSay,
        screenShows,
      });

      if (!result.ok) {
        return res.status(502).json({
          ok: false,
          error: "Couldn't send the mismatch note to Nic right now.",
        });
      }

      recordCorrectionSendSuccess(req.user!.uid);
      return res.json({
        ok: true,
        id: result.id,
      });
    } catch (err: any) {
      return res.status(502).json({
        ok: false,
        error: "Couldn't send the mismatch note to Nic right now.",
      });
    }
  });

  // Knowledge details (validated against product registry)
  app.get('/api/knowledge/:product', (req, res) => {
    const p = req.params.product;
    if (!isKnownProduct(p)) {
      return res.status(400).json({ error: `Unknown product "${p}".` });
    }
    const knowledge = getKnowledge(p);
    res.json(knowledge);
  });

  // Guided apps (validated against product registry)
  app.get('/api/apps/:product', (req, res) => {
    const p = req.params.product;
    if (!isKnownProduct(p)) {
      return res.status(400).json({ error: `Unknown product "${p}".` });
    }
    const apps = getGuidedApps(p);
    res.json(apps);
  });

  // Admin Dashboard Data (requires Google sign-in + email in ADMIN_EMAILS)
  app.use('/api/admin', requireAdmin);

  // Track 3, Step 0: template record import (Firestore templates are
  // server-write only by rule).
  app.post('/api/admin/templates/import', handleImportTemplates);

  app.get('/api/admin/data', async (_req, res) => {
    // Refresh health status
    await runModelHealthCheck();

    const products = getAllRegisteredProducts();
    const knowledgeFiles = products.map(p => getKnowledge(p));

    res.json({
      health: currentHealthStatus,
      knowledgeFiles,
      config: {
        liveModel: config.liveModel,
        textModel: config.textModel,
        textModelFallback: config.textModelFallback || null,
        thinkingLevels: getThinkingLevelsConfig(),
        bookingUrl: config.bookingUrl,
        sheetUrl: config.sheetUrl,
        sheetWebhookUrlSet: Boolean(config.sheetWebhookUrl),
        ownerEmail: config.ownerEmail,
        ownerName: config.ownerName,
        ownerTimezone: config.ownerTimezone,
      },
    });
  });

  // Setup WebSocket Server for Live API Relay
  const wss = new WebSocketServer({ noServer: true });
  setupLiveWebSocket(wss);

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
    if (pathname === '/api/live-ws') {
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Mount Vite or static dist
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = config.port;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Calm Guide server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
