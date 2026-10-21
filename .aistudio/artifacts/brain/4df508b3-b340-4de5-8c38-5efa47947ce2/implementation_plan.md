# Calm Guide for Meta Muse & Personal AI Agents

A trustworthy, plain-language web application providing nervous users with a slow, supportive companion to configure and safely operate Meta's Muse personal AI agent. Delivers real-time bidirectional voice conversation, contextual screen-sharing guidance, inline stepped prompt flows ("apps"), calendar-aware escalation to Nic, and an administrative health console.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during interactive clarification and are locked into the system architecture:
>
> - **Confirmed Visual Mood**: Archival warm editorial & paper-like aesthetic with muted stone/parchment tones, deliberate pacing, high-legibility typography, and no aggressive neon or generic AI gradients.
> - **Confirmed Guided Apps Presentation**: Stepped interactive cards rendered directly inside the chat stream with clear progress indicators, allowing users to move one step at a time alongside the guide.
> - **Confirmed Admin Security**: Admin dashboard (`/admin`) protected via admin passcode for fast, direct operational access without OAuth dependency.
>
> **Live API & Model Strategy (October 2026 GA Validation)**:
> - Default real-time model: `gemini-3.8-live` (with `gemini-3.8-live-extended-thinking` switch for deep governance reviews).
> - Text fallback & summaries: `gemini-3.8-flash`.
> - Ephemeral client authentication tokens minted server-side via `POST /v1alpha/auth_tokens` (or server proxy fallback) so the user's `GEMINI_API_KEY` is never exposed to browser runtimes.
> - Context window compression (sliding window) and session resumption enabled on every connection to prevent session cap termination during screen share.

---

### 1. Overview & Core Concept

- **What It Does**: A personal AI companion and safety advisor that welcomes visitors into a calm, unhurried space. It patiently listens, speaks via low-latency audio, inspects the user's screen on demand, runs guided prompt routines (such as least-access security audits and initial task goal-setting), and escalates to a human expert (Nic) when human judgment or account intervention is warranted.
- **Target Audience / Persona**: Everyday individuals, professionals, and small business operators who are curious about agentic AI (starting with Meta Muse) but feel overwhelmed, cautious, or anxious about standing permissions, private email access, and background autonomy.
- **Key Value**: Replaces anxiety and tech-jargon confusion with unhurried clarity, strict "least access first" security posture, visual transparency, and an immediate escape hatch to a human advisor.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Authentication & Welcome**:
   - Clean, minimalist entry screen with modular provider authentication ("Sign in with Google" via Firebase Auth or guest profile fallback).
   - Clear statement that private credentials are never accessed or stored.

2. **First-Run "What I Can and Can't See" Transparency Gate**:
   - An unskippable, calm single-screen agreement presented once per user:
     - *I can hear you and read what you type.*
     - *I can see your screen only when you say yes, and only the window or tab you pick. A banner shows the whole time and you can stop at any time.*
     - *I never need your passwords, API keys, or card numbers. If you see one on screen, do not read it out loud. Close that tab before sharing.*
     - *I only guide. I do not click or type for you.*
     - *I do not save video or audio. I save short text notes so I can help next time, and you can delete them.*
   - Acceptance persists to the user profile in Firestore.

3. **Main Guided Session (Voice, Text, & Vision)**:
   - A spacious, balanced workspace featuring a persistent "Talk to Nic" escalation bar, product switcher (starting with Meta Muse, extensible for Grok and Gemini Builder), and live chat transcript.
   - Microphone control with audio level meter, instant barge-in support, and automatic transcription for both user speech and guide audio.
   - When the agent detects confusion or asks to verify a screen state, it calls `request_screenshare(reason)`. The app displays a clear permission modal explaining the reason before triggering the browser's `getDisplayMedia` picker.
   - During screen share, a prominent, persistent status banner (*"Sharing your screen with the guide"*) remains visible with an immediate "Stop Sharing" button. If `getDisplayMedia` is unsupported (e.g. mobile Safari), the UI gracefully falls back to a photo/screenshot upload affordance.
   - Text fallback: If microphone access is denied or Live WebSocket disconnects, the UI seamlessly transitions to `gemini-3.8-flash` text chat without wiping the conversation history.

4. **Guided Prompt Flows ("Apps")**:
   - Sidebar and inline quick-launch cards for Muse workflows:
     - **Safety First-Pass**: Stepped walkthrough to audit connected apps, isolate Instagram/Facebook profiles, review standing "allow always" rules, and configure opt-outs.
     - **First Task**: Collaborative goal templating (*Goal, Do, Do not, Ask me before, Report back by*).
     - **Weekly Review**: Routine 10-minute hygiene check for standing permissions and memory accuracy.
   - Each app renders as stepped interactive cards inside the conversation, tracking completed steps and concluding with a succinct summary saved to session notes via `save_session_note`.

5. **Human Escalation & Calendar Scheduling**:
   - Triggered either by the agent (e.g. failing twice, billing issues, policy dilemmas) or by the visitor clicking "Talk to Nic".
   - The server parses `CALENDAR_ICS_URL` (expanding recurring events, hiding all event titles and attendee data), computes free 30-minute intervals within `WORKING_HOURS` in `OWNER_TIMEZONE` (at least 24 hours out, up to 14 days ahead), and renders up to 3 proposed slots in the user's local timezone.
   - Offers `BOOKING_URL` link for confirmation.
   - Dispatches a structured text-only handoff summary (goal, tried steps, screen observation summary, blocker, last 20 transcript turns) to `ESCALATION_WEBHOOK_URL` and appends to `data/escalations.jsonl`.

6. **Admin Dashboard (`/admin`)**:
   - Protected by admin passcode.
   - Displays real-time model health status (verifying `gemini-3.8-live` and `gemini-3.8-flash` existence via Gemini Models API, warning if fallback is active or if newer models are detected).
   - Chronological escalation log with full handoff dossiers and timestamps.
   - Knowledge pack manager showing registered products (`knowledge/muse.md`), source citation breakdown ([Meta], [Reported], [Unverified]), and last-checked date freshness alerts (>14 days).

#### Visual Identity & Theme

- **Aesthetic Direction**: Archival warm editorial & paper-like tone. Evokes a quiet study, high-grade typography, and deliberate whitespace.
- **Color Palette (60-30-10 Rule)**:
  - Canvas (60%): Warm alabaster `#FBF9F5` / soft paper background.
  - Structural Surfaces (30%): Subdued warm limestone `#F4F0E8`, hairline borders `#E5DFD3`, deep ink charcoal typography `#1C1917`, and muted stone secondary text `#78716C`.
  - Intent Accent (10%): Warm terracotta `#9A3412` and gentle forest ink `#14532D` applied strictly to active mic state, stop buttons, and verified badges.
- **Zero-Pill Discipline**: No capsule pills or candy badge clusters. Dates and metadata are rendered as quiet, unboxed prose separated by `·`.
- **Top Bar Contract**: Exactly 3 zones separated by clean spacing:
  `[Calm Guide — Meta Muse]` — `[Knowledge · Guided Flows · Privacy & Notes]` — `[Talk to Nic]`.

---

### 3. Key Product Decisions & Trade-Offs

- **Server-Side Ephemeral Token Minting vs. Direct Server Proxy**:
  - *Chosen Approach*: Hybrid resilience. The server mints a restricted, short-lived ephemeral token (`uses: 3`, `expireTime: 30m`) from `ai.authTokens.create` (or direct Generative Language API call). The client connects directly via WebSocket to `wss://generativelanguage.googleapis.com/...` with `access_token`. If ephemeral minting is restricted by current project tier or network firewall, the server seamlessly provides a WebSocket proxy bridge (`/api/live-ws`) using the backend `GEMINI_API_KEY`. The user's experience is identical and uninterrupted.
- **Context Compression & Session Resumption**:
  - *Chosen Approach*: Enabled from the initial WebSocket setup frame. Sliding window compression prevents the 2-minute audio+video hard limit from cutting off screen shares. On `GoAway` notifications from the Live API, the client reconnects with the latest `resumptionHandle`, preserving conversational state without user awareness.
- **Privacy-Preserving Screen Capture**:
  - *Chosen Approach*: Client downscales screen frames to max 1280px width, JPEG quality 0.7, throttled to 1 FPS via HTML5 Canvas. Frames are streamed in real-time memory and never saved to disk or database. The model is forbidden from reciting secrets or credentials.
- **Calendar Parsing on Server Only**:
  - *Chosen Approach*: Fetch and parse the private iCal feed (`node-ical`) strictly on the Express backend, caching for 5 minutes. No calendar event titles or private details are ever sent to the browser or the LLM. Only anonymous busy/free timestamps within working hours are evaluated.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (BROWSER)                                 │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │     Top Bar Contract    │  │  Persistent Escalation Banner            │  │
│  │ [Brand]   [Nav]   [Nic] │  │  "Need human judgment? Talk to Nic"      │  │
│  └─────────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │      Main Chat & Transcript     │   │     Sidebar / Guided Flows      │  │
│  │  • Unified Turn History (Voice) │   │  • safety-first-pass            │  │
│  │  • Live Transcription (In/Out)  │   │  • first-task                   │  │
│  │  • Stepped Inline Flow Cards    │   │  • weekly-review                │  │
│  │  • Persistent Screen Banner     │   │  • Session Notes Drawer         │  │
│  └────────────────┬────────────────┘   └─────────────────────────────────┘  │
│                   │ Audio (16kHz PCM) / Video (1 FPS JPEG)                  │
│                   ▼                                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Client Live Session Manager (AudioContext 16k in / 24k out + WebSockets)│  │
│  │ • Ephemeral Token Auth  • Sliding Window  • Session Resumption Handle │  │
│  └────────────────┬──────────────────────────────────────▲────────────────┘  │
└───────────────────┼──────────────────────────────────────┼──────────────────┘
                    │                                      │
                    │ REST API / WebSocket                 │
                    ▼                                      │
┌──────────────────────────────────────────────────────────┼──────────────────┐
│                        FULL-STACK EXPRESS BACKEND        │                  │
│                                                          │                  │
│  ┌──────────────────────────────────────────────┐        │                  │
│  │ /api/session/token                           ├────────┘                  │
│  │ Mints Ephemeral Token via GEMINI_API_KEY     │                           │
│  └──────────────────────────────────────────────┘                           │
│  ┌──────────────────────────────────────────────┐                           │
│  │ /api/chat/fallback                           │                           │
│  │ gemini-3.8-flash for text & tool executions  │                           │
│  └──────────────────────────────────────────────┘                           │
│  ┌──────────────────────────────────────────────┐                           │
│  │ /api/calendar/slots                          │                           │
│  │ Parses CALENDAR_ICS_URL, computes free times │                           │
│  └──────────────────────────────────────────────┘                           │
│  ┌──────────────────────────────────────────────┐                           │
│  │ /api/escalate                                │                           │
│  │ Appends to escalations.jsonl + Webhook POST  │                           │
│  └──────────────────────────────────────────────┘                           │
│  ┌──────────────────────────────────────────────┐                           │
│  │ /api/admin/* (Passcode protected)            │                           │
│  │ Model health diagnostics + escalation feed   │                           │
│  └──────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities

1. **User Profile & Consent (`users/{uid}`)**:
   - `uid`, `displayName`, `email`, `consentAcceptedAt`, `updatedAt`.
2. **Session Notes (`users/{uid}/notes/{noteId}`)**:
   - `id`, `productId` (e.g. `muse`), `content` (max 500 chars), `createdAt`.
3. **Escalation Record (`data/escalations.jsonl`)**:
   - `id`, `timestamp`, `userName`, `userEmail`, `product`, `goal`, `tried`, `screenSeen`, `blocker`, `proposedTimes`, `transcriptExcerpt` (last 20 turns).
4. **Knowledge Store (`knowledge/{product}.md`)**:
   - Curated knowledge files loaded dynamically by product identifier.
5. **Guided Apps Store (`apps/{product}/*.md`)**:
   - Step-by-step guidance prompts parsed into structured interactive stages.

#### Verification & Acceptance Mapping

1. **Login & Consent**: Sign in with Google (Firebase), accept "what I can and can't see", persisted to storage.
2. **Voice Greeting**: Live WebSocket opens, user speaks or greets, guide responds in 24kHz audio within seconds.
3. **Calm Safety Inquiry**: User asks "I'm nervous about connecting my email" → receives single calm question, least-access principle.
4. **Screen Share Walkthrough**: Agent calls `request_screenshare`, user approves in modal, canvas captures at 1 FPS, persistent banner appears, agent comments on screen contents, "Stop" halts capture immediately.
5. **Longevity Test**: Connection sustained past 5 minutes with context sliding window compression and resumption handle.
6. **Escalation**: User asks for human → agent calls `propose_times`, shows 3 slots in user's timezone, shows `BOOKING_URL`, dossier appears in `/admin`.
7. **Graceful Fallback**: Microphone denial falls back seamlessly to `gemini-3.8-flash` text chat without conversation restart.
8. **Admin Health Check**: Fake `LIVE_MODEL` triggers warning on `/admin` and locks app to text-only mode until corrected.
