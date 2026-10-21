import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { config } from './server/config.js';
import {
  runModelHealthCheck,
  currentHealthStatus,
  mintEphemeralToken,
  handleTextChat,
} from './server/models.js';
import {
  getAvailableProducts,
  getKnowledge,
  getGuidedApps,
} from './server/knowledge.js';
import { proposeTimes } from './server/calendar.js';
import { logAndDispatchEscalation, getEscalations } from './server/escalations.js';
import { setupLiveWebSocket } from './server/live-proxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: '10mb' }));

  // Run initial model health check
  runModelHealthCheck().catch(err => console.error('Initial health check failed:', err));

  // --- API Routes ---

  // Health & Model Status
  app.get('/api/health', (req, res) => {
    res.json(currentHealthStatus);
  });

  // Ephemeral Token Minting
  app.post('/api/session/token', async (req, res) => {
    try {
      const tokenResult = await mintEphemeralToken();
      res.json({
        token: tokenResult.tokenName,
        proxyAvailable: tokenResult.proxyAvailable,
        model: config.liveModel,
        deepModel: config.liveModelDeep,
        textModel: config.textModel,
        liveAvailable: currentHealthStatus.liveAvailable,
        warningMessage: currentHealthStatus.warningMessage,
        ownerName: config.ownerName,
        bookingUrl: config.bookingUrl,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Token generation failed' });
    }
  });

  // Text Chat Fallback
  app.post('/api/chat', async (req, res) => {
    try {
      const { userName, userEmail, product, messages, userTimezone, currentScreenFrame } = req.body;
      const result = await handleTextChat({
        userName: userName || 'Friend',
        userEmail: userEmail || '',
        product: product || 'muse',
        messages: messages || [],
        userTimezone: userTimezone || 'America/New_York',
        currentScreenFrame: currentScreenFrame || null,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Text generation failed' });
    }
  });

  // Calendar Slots Proposal (Server-Side Only)
  app.get('/api/calendar/slots', async (req, res) => {
    try {
      const duration = parseInt(req.query.duration as string || '30', 10);
      const tz = (req.query.timezone as string) || config.ownerTimezone;
      const slots = await proposeTimes(duration, tz);
      res.json({
        slots,
        ownerTimezone: config.ownerTimezone,
        workingHours: config.workingHours,
        bookingUrl: config.bookingUrl,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Calendar check failed' });
    }
  });

  // Human Escalation
  app.post('/api/escalate', async (req, res) => {
    try {
      const result = await logAndDispatchEscalation(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Escalation logging failed' });
    }
  });

  // Products
  app.get('/api/products', (req, res) => {
    const products = getAvailableProducts();
    const detailed = products.map(p => {
      const k = getKnowledge(p);
      return {
        id: p,
        title: k.title,
        lastChecked: k.lastChecked,
        isStale: k.isStale,
      };
    });
    res.json(detailed);
  });

  // Knowledge details
  app.get('/api/knowledge/:product', (req, res) => {
    const p = req.params.product || 'muse';
    const knowledge = getKnowledge(p);
    res.json(knowledge);
  });

  // Guided apps
  app.get('/api/apps/:product', (req, res) => {
    const p = req.params.product || 'muse';
    const apps = getGuidedApps(p);
    res.json(apps);
  });

  // Admin Passcode Verification
  app.post('/api/admin/verify', (req, res) => {
    const { passcode } = req.body;
    if (passcode === config.adminPasscode) {
      res.json({ authorized: true });
    } else {
      res.status(401).json({ authorized: false, error: 'Incorrect passcode' });
    }
  });

  // Admin Dashboard Data
  app.get('/api/admin/data', async (req, res) => {
    const passcode = req.headers['x-admin-passcode'] as string;
    if (passcode !== config.adminPasscode) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Refresh health status
    await runModelHealthCheck();

    const escalations = getEscalations();
    const products = getAvailableProducts();
    const knowledgeFiles = products.map(p => getKnowledge(p));

    res.json({
      health: currentHealthStatus,
      escalations,
      knowledgeFiles,
      config: {
        liveModel: config.liveModel,
        liveModelDeep: config.liveModelDeep,
        textModel: config.textModel,
        calendarIcsUrlSet: Boolean(config.calendarIcsUrl),
        bookingUrl: config.bookingUrl,
        escalationWebhookUrlSet: Boolean(config.escalationWebhookUrl),
        ownerEmail: config.ownerEmail,
        ownerName: config.ownerName,
        ownerTimezone: config.ownerTimezone,
        workingHours: config.workingHours,
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
    app.get('*', (req, res) => {
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
