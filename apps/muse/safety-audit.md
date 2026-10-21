---
id: safety-audit
title: Full Safety Audit
type: checkup
order: 1
estimated_time: 20 minutes
risk: low
requires: []
recommended_after: [getting-started]
summary: A thorough check of everything Muse can reach, with a scorecard you can compare over time.
goal: Review every area of Muse's access, rate each one, and leave with a scorecard and a short fix list.
---

## Step 1: Connections
- area: connections
- coach: "Open Connectors and switch to Connected. Let's go through each one: is it still needed, and is it at the right level?"
- where: Settings > Connectors > Connected
- done_when: Every connected service has been reviewed for need, read/write levels, and Background sync.
- verify: screen
- why: Unused connections are risk with no benefit.
- rating: green if every connection is needed and write actions are on Ask or Deny unless a task needs them; amber if something is broader than needed; red if a work account or finance account has write access the user didn't choose.

## Step 2: Standing permissions
- area: approvals
- coach: "Open Permissions. What do the defaults say, and what are the counts next to Connectors, Websites, Artifacts, and Scheduled tasks?"
- where: Settings > Permissions
- done_when: The user has read the defaults and the counts, and opened Websites you've allowed and each connector's recipient permissions.
- verify: screen
- why: Standing allows are permissions that no longer ask. Each one should be deliberate.
- rating: green if defaults are as chosen and every standing allow is scoped to one person or one task; amber if there are allows the user can't explain; red if broad send or share allowances exist.

## Step 3: Network protocols
- area: approvals
- coach: "On the same Permissions page, scroll down to Direct network protocols. Are they all set to Deny?"
- where: Settings > Permissions > Direct network protocols
- done_when: The user has confirmed each protocol's setting.
- verify: screen
- why: These are low-level ways to reach the internet, such as sending email directly. They start on Deny, and most people should leave them there.
- rating: green if all Deny; amber if any are Ask without a reason the user can name.

## Step 4: Scheduled work
- area: scheduled
- coach: "Open Upcoming. For each task, do you know what it does, what it can send, and to whom?"
- where: Status panel > Upcoming
- done_when: Every user-created task has been explained, kept, or deleted.
- verify: screen
- why: Scheduled tasks keep running when the app is closed.
- safety: The Heartbeat is a system task and can't be deleted. That's expected.
- rating: green if every task is understood and wanted; amber if any task is unclear; red if a task sends to other people without the user knowing.

## Step 5: Memory and identity
- area: memory
- coach: "Open Identity, then MEMORY. Is there anything wrong, outdated, or too personal?"
- where: Status panel > Identity > MEMORY (and SOUL)
- done_when: The user has reviewed MEMORY and removed anything they didn't want kept.
- verify: either
- why: Muse writes memories on its own, including about people in your life.
- rating: green if the user is comfortable with what's stored; amber if they removed items today.

## Step 6: Recent activity
- area: activity
- coach: "Open Activity. Scroll through the last few days. Anything you didn't expect?"
- where: Status panel > Activity (and Approvals > History)
- done_when: The user has reviewed recent activity and approvals history.
- verify: either
- why: Activity is the record of what Muse actually did, not what it said it did.
- rating: green if nothing surprising; amber if something was unclear; red if something was sent, bought, or shared unexpectedly (switch to the "Something went wrong" routine).

## Step 7: Privacy and data
- area: privacy
- coach: "In Data controls, is 'Help improve our AI models' set the way you want?"
- where: Settings > Data controls
- done_when: The training switch matches the user's choice, and they know where Download your agent data and Reset are.
- verify: either
- why: When it's on, your conversations can be used to train Meta's AI.
- rating: green if set deliberately; amber if left on without a decision.

## Step 8: Money
- area: money
- coach: "Open Wallet and Secure store. What payment methods and saved logins are there, and how is each login set?"
- where: Settings > Wallet; Settings > Secure store
- done_when: The user has reviewed payment methods and saved logins, and each login is set to "use automatically" or "always ask first" on purpose.
- verify: screen
- why: Saved logins and cards let Muse act in more places.
- rating: green if Wallet is empty or used deliberately and logins are on "always ask first"; amber otherwise.

## Finish
- summarize: Show the scorecard (one rating per area) and a fix list with at most three items, in priority order.
- save_scorecard: Record each area's rating and a one-line reason.
- next: Offer a calendar reminder for the weekly check-in, and Nic if any area is red.
