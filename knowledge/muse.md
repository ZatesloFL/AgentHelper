# Meta Muse Knowledge Pack

Last checked: 2026-10-21

Built from Nic's Muse Field Guide v2: screenshots of a live account (web, Oct 20-21, 2026), the Muse team's own documentation that ships inside each agent's virtual machine, chats with the agent, and web reporting. Muse changes fast. Treat this as a snapshot and trust the user's screen over it.

## Evidence tags

- **[SEEN]** seen in a screenshot of a real account
- **[DOC]** stated in the Muse team's own documentation inside the agent's VM. The best source we have, but it describes Meta's intent and can lag the live app. A row or button the docs don't list is not a known fact.
- **[SAID]** the Muse agent said it in a chat. A self-report.
- **[WEB]** third-party reporting
- **[INFERRED]** a reasonable guess; confirm before telling a user
- **[UNKNOWN]** not yet observed

Rule for the guide: never state [SAID], [INFERRED], or [UNKNOWN] items as settled fact. Say what you know and how you know it, then ask the user to check their own screen. Even [DOC] items can lag, and settings differ by device, plan, and VM type. Settings labels below are from the web app unless noted.

## 1. What Muse is

Meta's personal AI agent. Launched September 8, 2026 in the US and Canada, adults only [DOC, WEB]. A Mac app followed September 18 [WEB]. Each user gets one agent running on its own dedicated Linux virtual machine (VM) with its own files, terminal, a real Chromium browser, a credential Vault, and a Wallet [DOC]. It is strictly one-to-one: no group chats, no sharing a chat with another person, and no admin console for managing someone else's Muse [DOC]. Nobody else, including Nic, can log in to help remotely; help happens by the user sharing their own screen.

Where people use it: muse.ai on the web, iOS and Android apps, a Mac app, and WhatsApp as a messaging channel [DOC].

Each agent has a name and avatar the user can edit (for example, one observed agent is called "Silver") [SEEN].

**Models.** Muse Spark is the base model line; the consumer agent identifies as Muse Spark 1.3 [DOC]. Meta announced a stronger model, Muse Wonder, on October 12, 2026 [WEB]. The docs say paid plans run Wonder and the free plan runs Spark, with some free accounts getting Wonder [DOC]. Reporting says the consumer app still runs Spark 1.3 and gets Wonder "soon," subscribers first [WEB]. The sources disagree on timing. There is no model picker [DOC].

**Identity files.** Each agent has editable files: SOUL (persona and values), MEMORY (curated long-term memory), and IDENTITY (name and vibe) [DOC]. The default SOUL tells the agent to be helpful without filler, have opinions, be resourceful before asking, treat access to the user's life with care, and tell the user if it changes the file [SEEN]. The agent also keeps its own working notes (AGENTS.md, USER.md, TOOLS.md) [DOC].

## 2. Where things are (screen map)

Always ask which device the user is on first: web, iPhone, Android, Mac app, or WhatsApp. Navigation differs.

### 2.1 Web app left rail [SEEN, labels from DOC]

Top to bottom: Chat (blue dot = unread), Search, Feed, Ideas, Goals, Library. Search also opens with Cmd+K. Feed is the notebook-looking icon and Library the four-shapes icon [INFERRED from icon order]. Pinned artifacts sit below a divider [DOC]. At the bottom, a menu icon opens Settings, Keyboard shortcuts (Cmd+/), and Report an issue [DOC]. In narrow windows the rail becomes an icon-only bottom bar with a More sheet [DOC].

Shortcuts [DOC]: Cmd+J jump to chat, Cmd+Shift+K search in chat, Cmd+, open Settings, Cmd+P file quick-open, Esc stops a reply that is still streaming.

### 2.2 Chat

- Sidebar: search, Main chat, Channels (WhatsApp appears here with its own unread dot), and Side chats with a + button [SEEN]. The main chat can never be deleted; side chats can be archived or deleted [DOC].
- Header: avatar, name, and a live status pill (for example "Verifying sources") [SEEN]. Clicking the avatar opens the status panel (2.3).
- Composer: +, text box, mic for dictation [SEEN]. Dictation and voice notes exist; live voice conversation was not available on the observed account [DOC].
- The agent puts a thumbs-up on a message when it picks up a task [SEEN]. Clarifying questions arrive as tappable option cards plus free text [SEEN].
- Creating a scheduled task shows a "Scheduled task" card with a button to open it in the Upcoming tab [SEEN, DOC].
- WhatsApp is a separate side chat. Its history is not copied into main chat, and tasks scheduled from it report back to it [DOC]. Menus and Settings cannot be reached from WhatsApp, so tell users where a control lives in the app instead of giving tap-by-tap steps there [DOC].

### 2.3 Status panel (click the agent's avatar) [SEEN, DOC]

A right-side panel with the avatar (pencil to edit), name, a green "Connected" indicator, and four icon tabs in this order: list, shield, clock, fingerprint. These match the docs' Activity, Approvals, Upcoming, Identity [INFERRED mapping].

- **Activity:** log of the agent's recent actions. On web, a running item shows Stop on hover [DOC]. Everything the agent does is recorded here and in approvals History and cannot be secretly erased [DOC].
- **Approvals:** pending permission requests plus History [DOC]. Not yet seen [UNKNOWN layout].
- **Upcoming:** every scheduled job, grouped under Daily and Weekly [SEEN]. A "Heartbeat" running every 30 minutes appears to be system-owned [SEEN, INFERRED]. Clicking a task opens details with run history and a View permissions button; Edit drafts a chat message rather than editing directly; the user can delete their own tasks, but system-owned tasks refuse deletion [DOC].
- **Identity** (web and iPhone): name card with Edit, then two cards labeled **SOUL** and **MEMORY**, marked "ACCESS WITH CARE" [SEEN]. Opening one shows an editable document with basic formatting [SEEN, DOC]. Memory is one editable document, not a list of rows [DOC]. IDENTITY is editable in the same place [DOC].

### 2.4 Feed [DOC]

Short editorial posts the agent writes in the background, guided by one plain-text "brief" the user can rewrite. It is not a news aggregator and cannot take an RSS or source list. Posts draw on live web search, social platforms, connected services, and the user's own context, and must cite real links. The system controls the schedule; users cannot speed it up or switch it off. New posts appear silently. Each post has Love, Discuss, sometimes "Why I created this," and Delete. A new feed starts with fixed "Getting started" posts that use none of the user's data. The Feed screen itself has not been seen [UNKNOWN layout].

### 2.5 Ideas [SEEN, DOC]

Cards with an icon, title, short pitch, and "..." menu, grouped by theme (for example Health & Fitness). A background process generates them daily from the user's real context. On web the build button reads "Let's do it." The agent cannot dismiss a card; the user long-presses to dismiss. Cards expire after being built or about two weeks after the newest refresh [DOC].

### 2.6 Goals [SEEN, DOC]

A "Tracking" group with one-line statuses, plus "Create a goal" (Health, Relationships, Finance, Career, Interests, Productivity, Something else) [SEEN]. A goal is active or completed (no pause). Goals nest one level. Each has Complete, Rename, Delete; Add Subgoal starts a chat message. The agent logs dated progress, and background "briefings" attach to goals on a system schedule. Deleting a goal removes its subgoals, history, briefings, and scheduled jobs. A goal does nothing by itself; real background work happens only through scheduled jobs [DOC]. The agent adds goals on its own when it sets up follow-ups [SEEN].

### 2.7 Library [SEEN, DOC]

Left sidebar: Artifacts (All artifacts, Documents, Web artifacts), Media (Images, Videos, Podcasts), and System files [SEEN]. Header: Search, Select (multi-delete), sort, grid or list, and "+ Create an artifact" [SEEN, DOC]. Each card's menu: Pin, Share, Download, Delete [DOC].

- **Artifacts** are what the agent builds: documents (PDF, Word, sheets, decks, markdown), static pages, and interactive apps with their own database, stored on the agent's VM. Only static artifacts can be published to a public link, and every publish and update needs a fresh one-tap approval. Deleting an artifact is permanent [DOC].
- **System files** is a window into the agent's own filesystem. Files the agent saves to `workspace/your_files` appear in the Library; user uploads land in `workspace/user` and do not automatically appear [DOC].
- No upload button in the web Library; attach files through the chat composer. iOS and Android System Files have upload controls [DOC].

### 2.8 Settings (web dialog) [SEEN unless noted]

Left nav: General, Connectors, Wallet, Secure store, Permissions, Messaging channels, Devices, Data controls, Help & support, Legal info, Log out.

| Pane | What's on it |
|---|---|
| General | Accounts Center link (password, security, personal details; opens Meta's page). Usage card (plan name, percent used, weekly reset date, Upgrade link). Redeem invite code. Language. Appearance |
| Connectors | Search box and an **Available / Connected** switch. Available shows Featured (Gmail, Messenger, Withings) then categories (Productivity: Google Calendar, Google Drive, Finances (Plaid), Google Sheets, more under See all). Each row has Connect, or View once connected |
| Wallet | "Add payment methods to allow [agent] to make secure purchases." Link by Stripe and Shop Pay, each with Add |
| Secure store | Saved browser logins [DOC]; not yet seen |
| Permissions | **Connector defaults** and **Web access defaults**, each a choice of "Ask for some actions" (default) or "Always ask". **Manage permissions** rows with counts: Connectors, Websites, Artifacts, Scheduled tasks, and below the fold Direct network protocols [SEEN, DOC] |
| Messaging channels | WhatsApp setup; not yet seen |
| Devices | Paired devices; web cannot pair, rename, or remove [DOC]; not yet seen |
| Data controls | **Help improve our AI models** toggle (was ON on the observed account). Import memory. Download your agent data. **Reset** (red; permanently deletes Muse data including chat history, files, and active tasks) |
| Help & support | Help center, feedback form, Report an issue [DOC] |
| Legal info | Terms and privacy policy links [DOC] |

Deeper detail [DOC]:

- **A connector's detail page** (Settings > Connectors > Connected > View): Disconnect; a permission tree where each **Read** and **Write** action is set to **Allow, Ask, or Deny**; and a **Background sync** row (Allow by default). Setting a connector to Deny stops proactive work, system jobs, Feed and Ideas, and background sync from using it, but the user's own chats and the schedules the user created still use it. "Needs additional access" opens the provider's consent screen. Gmail and similar connectors show **Manage recipient permissions** with Revoke. Multi-account connectors show a Default badge and Add account.
- **Browser connector:** built in, cannot be disconnected. Its page sets visit websites, submit forms, download files, upload files (Ask or Deny only), and fill saved credentials to Allow, Ask, or Deny.
- **Wallet:** one write-permission choice for creating spend requests; cards are picked on the checkout approval card.
- **Secure store:** add, edit, or delete a login and set each one to "use automatically" or "always ask first."
- **Permissions page:** "Reset approvals to defaults." Opening an artifact or scheduled task shows a per-item editor listing each connector's Read and Write actions. "Websites you've allowed" can be revoked one by one. **Direct network protocols** (SSH, sending email, mailbox access, databases, FTP, external DNS, other TCP and UDP) are each Deny or Ask, all start on Deny, and there is no Allow.

### 2.9 Mobile and Mac differences [DOC]

- Same five tabs: Chat, Feed, Ideas, Goals, Library. Settings is a gear (iOS header, Android side-panel header). Mobile adds Notifications and Appearance panes; Android adds App lock and default-assistant settings. Mobile settings rows come in unlabeled card groups.
- The mobile chat header's Invite button (gift icon on iOS) is a referral share sheet, not a chat invite.
- Approval requests can arrive as push notifications with Allow and Deny. **On Android, swiping the notification away counts as Deny.**
- Android pairing can read and send texts (if Muse is the default assistant), read notifications, set alarms, and place calls. iPhone pairing gives health data, HomeKit, and Reminders, and can only draft texts. The agent cannot see the phone screen, control other apps, take photos, or find a lost phone.
- Mac app: a window plus menu bar icon, Quick chat (Option-Space), hold-fn dictation into any app, and pairing that lets the agent work with Mail, Messages, Notes, Calendar, Reminders, Contacts, local files, screen captures, and one camera photo per request, each with permission. Computer use and a Blocked folders list are Mac-only settings. Muse Home Link is an experimental home-network bridge.

## 3. How work flows [DOC]

1. The user asks in chat. The agent may ask clarifying questions as option cards.
2. The agent works itself or with sub-agents. Browser work happens in its own browser on its VM, not on the user's computer.
3. Anything sensitive or state-changing stops at an **approval card**. A separate gate called **Sentinel** decides; approvals are never inferred from chat text. The agent cannot see or describe the card's wording.
4. Output lands as a chat message, an artifact, a file, or media.
5. Recurring work becomes a **scheduled task**. Each run does its job, decides whether to notify, and the schedule starts the next one.

**Scheduled task facts [DOC]:**
- It checks on a schedule; it does not watch live. Timing is approximate. Never promise anything "the moment it happens."
- Runs continue when the app is closed or the phone is off. Results arrive in chat, plus a push if no app is open.
- A watch can only alert. It cannot stop, reject, or block anything.
- Alerts go to the user only. A task that emails someone else is a send and needs approval unless that task was given a standing allow.
- No start date, end date, or condition field; conditions go in the task's instructions. Jobs repeat until paused or removed.
- A job blocked on something lasting (a connector needing reconnect, a bot check, an offline device) pauses and retries later. A failed run can end with no chat message, so check run history, not the schedule.
- Purchases can be prepared by a scheduled task but never preapproved.

## 4. What Muse can and can't do

| Capability | Evidence |
|---|---|
| Live web research with cited sources | [SEEN, DOC] |
| Real browser work: forms, sign-ins, downloads, checkout; solves CAPTCHAs; the user can take over a live browser session for a blocked step | [DOC] |
| Build documents, decks, spreadsheets, static pages, and database-backed apps; publish static ones with approval | [DOC, SEEN] |
| Generate images (up to 4 per request), short video clips (about 10 seconds), and speech or multi-voice **podcast audio** | [DOC, SEEN] |
| Daily and weekly scheduled tasks, one-time checks | [SEEN, DOC] |
| Connectors: Gmail, **Outlook**, Google Calendar, Google Drive, Google Sheets, Plaid finances, Messenger, Facebook, Instagram, Spotify, Withings, Shopify, and others. Only the documented commands exist for each | [DOC, SEEN] |
| Custom connectors for services with an API key or their own OAuth; services using password logins, cookies, request signing, or multiple secrets are declined | [DOC] |
| Purchases through Wallet (Link by Stripe, Shop Pay), each with fresh approval | [DOC] |
| Business phone calls for the user's own tasks (early access; user confirms each call; cannot receive calls or text) | [DOC] |
| Work with Mac apps and files (Mac app) and texts and calls on Android, through paired devices | [DOC] |
| Import memory from another assistant (paste, or a ZIP export up to 100 MB from ChatGPT, Claude, Gemini, or Meta AI) | [DOC] |
| **Cannot:** use the user's phone screen, reach files on the user's computer without the Mac app, text from its own number, join group chats, or watch or listen to media it makes | [DOC] |

Amazon blocked Muse from shopping on Amazon.com on September 20, 2026, citing its terms; the companies were reported to be in talks [WEB]. Do not suggest Amazon purchases through Muse.

## 5. Background work (why Muse does things nobody asked for) [DOC]

Muse runs upkeep jobs between conversations: hourly memory upkeep including **a page for each person in the user's life**, a daily Ideas pass, overnight "studying" that researches goals and may suggest goals the user hinted at, a nightly "dreaming" pass that writes reflections, and a daily review that can save repeated workflows as new skills. This explains surprise items in Ideas, Goals, and chat. Proactive messages follow the user's waking hours, at most a couple of ordinary ones a day, and users can state their preferences in chat.

Setting a connector's **Background sync** to Deny keeps that connector out of this background work (see 2.8).

## 6. Permissions model (read before advising anyone)

**Defaults [DOC, SEEN]:** connector actions and web access both start on "Ask for some actions" (ask before sharing information or making important changes, or on unfamiliar sites). Either can be switched to "Always ask." Ordinary requested tasks need no approval, and an ordinary browser form submit is allowed by default.

**Standing permissions that exist [DOC]:**
- A website allow ("Allow once," or a lasting allow per site).
- A Gmail send, Calendar invitation, or Drive share to **one named recipient** from that account. Other recipients still ask. A Messenger send can be allowed for one conversation. Revoke at Settings > Connectors > that connector > Manage recipient permissions.
- A scheduled task or artifact that sends mail can get a lasting allow for **only that task or artifact**, removable on the Permissions page.
- On a Mac with the Mac app, a Messages or Mail send to one person.

**Never gets a standing allow [DOC]:** purchases (fresh approval every time); Threads posts and messages; Facebook posts, comments, and Page posts; Messenger sends outside an allowed conversation. Publishing or updating a public artifact needs a fresh approval every time, and so does uploading a file to a temporary public link (valid at most 48 hours).

**The agent cannot change permission settings or revoke standing grants.** Only the user can, on the Permissions page or a connector's page. The agent's own tool sees only pending approvals [DOC].

Exactly which choices appear on an approval card is [UNKNOWN]; ask the user to read the card to you.

## 7. Privacy and data

**Standard VM (what everyone has today) [DOC]:** interactions and actions may be logged and reviewed by Meta for safety, security, debugging, and product improvement. Conversations are not end-to-end encrypted. They are used for AI development unless the user turns off **Settings > Data controls > Help improve our AI models**. That toggle was ON on the observed account [SEEN]. Meta says VM data and conversations are not shared with its ad systems [DOC]. Meta staff can access the VM for service operations [WEB].

**Confidential VM [DOC, WEB]:** a hardware-protected environment where Meta cannot access prompts, responses, files, or derived content, with keys the user holds. Meta still gets limited operational metadata. **Not available yet;** reports say "late 2026" with no date or price [WEB]. A Confidential VM also removes: the AI-training toggle (never used for training), the usage area, invite codes, Messaging channels (so **no WhatsApp**), **image, video, speech, and podcast generation**, temporary public download links, and the Shopify connector. It adds an Encryption pane with a recovery PIN [DOC].

**Credentials [DOC]:** passwords go through a secure entry card into the Vault. The agent can confirm a login exists but cannot see stored values. Card details and one-time codes given for a task are used for that task and kept out of memory and files. A sign-in code arriving in connected email or texts can be fetched on a narrow, protected path, and the user approves sharing it on a card. Raw passwords should never be typed into chat; the agent should offer the secure card.

**Retention and control [DOC]:**
- Export: Data controls > Download your agent data. A separate account export lives in Meta Accounts Center.
- Reset (Data controls) wipes chat history, files, and active tasks. It is the only full wipe. Account deletion goes through Accounts Center.
- No incognito mode. Clearing a conversation is not private because memory may already have been written; delete those memories afterward in Identity > MEMORY.
- No retention-period setting.
- Disconnecting a connector removes its tokens.

## 8. Plans and usage

Usage shows in Settings > General as a percent of a weekly allowance with a reset date [SEEN]. Research builds, media generation, and scheduled runs use it fastest. It does not reset early [DOC].

Paid plans: the docs say paid plans run Muse Wonder and point to the About Muse subscriptions page [DOC]. Launch coverage reported $20 and $100 monthly plans [WEB], but at least one analysis says Meta never confirmed the amounts [WEB]. Muse Code (a separate coding product) has its own plans [WEB]. **Do not quote prices or limits;** send users to Settings > General > Usage and the Upgrade screen.

## 9. Known issues

- Podcast links expire after about 48 hours. An archive keeps players for the latest few episodes plus permanent written versions [SAID, DOC: 48-hour cap on temporary public links]. A player can show an error when its link rotates [SEEN].
- Episodes can come in shorter than requested (for example 8:41 instead of 10 minutes) [SEEN].
- Internal drafting notes can leak into delivered text [SEEN].
- Fact checks verify individual claims, not the overall story; one theme can get stretched across unrelated items [SEEN].
- Unverified items are flagged rather than removed [SEEN].
- Ideas, Goals, and scheduled tasks pile up until the user removes them [INFERRED]. The Permissions counts and the Upcoming tab are the places to audit.
- Daily tasks run at approximate times chosen by the system [SEEN].
- The agent cannot describe approval cards or screens it cannot see. When it describes a screen, check it [DOC].
- Security: in October 2026 a researcher published a proof-of-concept that hijacked the Muse app's dictation on a computer that was already compromised; Meta reportedly hot-fixed it [WEB]. Meta says it labels outside content as untrusted and scans it for prompt injection, and runs a bug bounty [WEB]. Keep Muse apps updated.

## 10. Guidance for the guide

1. Ask which device the user is on and what they see. Say which labels are confirmed.
2. Treat permissions, credentials, connectors, standing sends, payments, and what Meta can see as high-stakes. Walk the user to their own Settings screen and have them confirm. Never ask for passwords or API keys.
3. Don't promise Confidential VM timing, price, or behavior. Anyone who relies on WhatsApp or media generation should know a Confidential VM removes both.
4. For recurring work, have the user write down what runs, when, what it can send and to whom, and where results land. Then check Upcoming, Permissions, and Goals regularly. Prefer one-recipient allowances over broad ones.
5. Split gathering, verifying, and writing into separate steps. Require a source link for each item, and have the checker open the source.
6. Remind users the AI-training toggle starts ON for a standard VM, and ask whether that fits what they'll route through Muse.
7. A briefing made for one person is seen by no one else, so spot-check it now and then.
8. Never say Muse "watches" something live. It checks on a schedule.
9. For billing, usage, or plans, send users to Settings > General > Usage and the subscription page.

## 11. Not yet seen

Approvals tab and History; an approval card for a send or purchase; the Activity tab; Feed; Secure store and the secure entry card; Messaging channels; Devices; Direct network protocols; a scheduled task's detail dialog and per-task permission editor; Library Media pages and "+ Create an artifact"; the IDENTITY card; Upgrade and billing screens; onboarding and first run; a connector's detail page. When a user shows one of these, describe it carefully, say it's new to your notes, and save a note about it.
