# Meta Muse Knowledge Pack

Last checked: 2026-10-20. Source labels: [Meta] means Meta's own statement as relayed by coverage; [Reported] means reporters or third-party writers; [Unverified] means plausible but I have not seen it in the app. Nic will correct anything wrong.

## What it is
Muse is Meta's personal AI agent. It takes a goal, makes a plan, and keeps working after the app is closed, pinging the user when it needs approval. [Meta] Launched September 8, 2026 in the US, ages 18 and over, on web, iOS, Android, and in WhatsApp. [Reported] Smart glasses support was announced September 23. [Reported]

## Cost
Free tier, Power at $20 a month, Maximum at $100 a month. [Reported] Sources disagree on weekly token allowances, so do not quote numbers. One source says all features are on every tier and paid plans only add volume. [Reported]

## Where it runs
Each user gets a dedicated cloud virtual machine holding the agent, its browser, and the data for connected services. Other users' agents cannot reach it. [Meta] A separate system called Sentinel sits alongside and decides whether an action is allowed, denied, or needs the user's approval. [Meta] Meta staff can still access that VM for service operations, so it is not a barrier against Meta itself. [Reported]

## Credentials and data
Muse cannot see passwords or payment details; credentials are stored separately and used on its behalf. [Meta] Conversations are not shared with Meta's advertising systems. [Meta] There is an option to opt out of having data used for model training. [Reported]

## Approvals and permissions
Sensitive actions such as sending email or making purchases require the user's confirmation. [Meta] Users choose which apps connect and how much access each gets, for example read email without sending. [Meta] Approval prompts may offer allow once, allow always, or deny; "allow always" creates a standing rule worth reviewing. [Unverified in app]

## Connections
Launch connections include Gmail, Google Calendar, Spotify, and OpenTable; Notion and Granola were reported as early additions. [Reported] In one hands-on test, Facebook and Instagram were already connected by default and Muse used them to build an initial profile, so the first review should check what is already connected. [Reported] Where a service has no API, Muse can use its browser, with the user supplying credentials. [Reported] Sources conflict on whether Meta runs a third-party connector program. Muse can also write its own integrations, and Meta does not review those, so the user is trusting the service directly. [Reported]

## Known limits
Amazon reportedly blocked Muse from purchasing, citing its terms. [Reported] The app list is smaller than technical agent platforms. [Reported]

## Honest summary for nervous users
The controls are real: isolation, approval prompts, separate credential storage. They limit what the agent can do. They do not give a cryptographic lock against Meta, and they do not protect against permissions the user granted too broadly. The best protection is starting narrow and reviewing often.
