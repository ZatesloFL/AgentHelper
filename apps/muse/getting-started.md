---
id: getting-started
title: Getting Started
type: setup
order: 1
estimated_time: 15 minutes
risk: low
requires: []
recommended_after: []
summary: Set Muse up safely before you give it any real work.
goal: Set up Muse with the least access that still works, know where the controls are, and find the off switch before you need it.
---

## Step 1: Your device
- coach: "Which device are you using Muse on right now: the website, an iPhone, an Android phone, the Mac app, or WhatsApp?"
- done_when: The user has named the device they're using.
- verify: user
- why: Menus differ by device, so this decides which directions I give.
- if_stuck: If they use WhatsApp only, explain that settings can't be changed from WhatsApp and suggest opening muse.ai on a computer for this setup.

## Step 2: What you want help with
- coach: "What's one thing you'd like Muse to help with first, and how comfortable or nervous do you feel about it?"
- done_when: The user has named a first goal (or said they're not sure yet) and how they feel about it.
- verify: user
- why: Knowing the goal lets us give Muse only the access that goal needs.
- if_stuck: Offer the three sample projects: a daily news briefing (no accounts needed), a calendar helper, or inbox triage.

## Step 3: Turn approvals up
- coach: "Let's start careful. In Settings, open Permissions. Can you set both Connector defaults and Web access defaults to 'Always ask'?"
- where: Settings > Permissions > Connector defaults, Web access defaults
- done_when: Both defaults show "Always ask".
- verify: either
- why: While you're learning, seeing every request teaches you what Muse does. You can relax this later.
- safety: Purchases, Facebook posts, and Threads posts always ask regardless of this setting.

## Step 4: What's already connected
- coach: "Now open Connectors and switch to 'Connected'. What do you see listed there?"
- where: Settings > Connectors > Connected
- done_when: The user has listed every connected service, or confirmed there are none.
- verify: screen
- why: Some accounts can be connected before you choose anything. You should know exactly what Muse can reach.
- if_stuck: If they can't find the switch, ask them to share their screen.

## Step 5: Keep, narrow, or disconnect
- coach: "For each one, would you like to keep it, keep it but read-only, or disconnect it? Let's go one at a time."
- where: Settings > Connectors > Connected > (service) > View
- done_when: Every connected service has been kept, narrowed (write actions set to Ask or Deny), or disconnected, matching what the user chose.
- verify: either
- why: Read-only means Muse can look but not change, send, or share.
- safety: For email, finances, or health, suggest setting Background sync to Deny so only tasks the user starts can use that account.
- if_stuck: If a service is a work account, recommend disconnecting it until they've checked their employer's policy, and offer Nic.

## Step 6: The AI-training choice
- coach: "In Data controls there's a switch called 'Help improve our AI models'. It starts on. Would you like to leave it on or turn it off?"
- where: Settings > Data controls > Help improve our AI models
- done_when: The switch matches the user's stated choice.
- verify: either
- why: When it's on, your conversations can be used to train Meta's AI. It's your call; it matters more if you'll route email, money, or health through Muse.

## Step 7: Leave the Wallet empty
- coach: "Open Wallet. Is there any payment method saved there?"
- where: Settings > Wallet
- done_when: The Wallet has no payment methods, or the user consciously chose to keep one.
- verify: either
- why: Purchases always need your approval, but an empty Wallet means nothing can even be prepared until you decide.

## Step 8: Find your off switch
- coach: "Let's find the brakes before we need them. Click Muse's picture at the top of the chat. Do you see the panel with four small icons?"
- where: Chat header > agent avatar > status panel (Activity, Approvals, Upcoming, Identity)
- done_when: The user has found Activity (where running work can be stopped) and Upcoming (where scheduled tasks can be deleted), and knows Reset is in Data controls as a last resort.
- verify: screen
- why: Muse keeps working after you close the app. Knowing how to stop it makes everything else less scary.
- if_stuck: The icons are list, shield, clock, fingerprint. The list icon is Activity and the clock is Upcoming.

## Step 9: What Muse remembers
- coach: "In that same panel, the last icon opens Identity. Open the MEMORY card. Is there anything in there you'd rather it didn't keep?"
- where: Status panel > Identity > MEMORY
- done_when: The user has looked at MEMORY and removed anything they didn't want kept, or said it's fine.
- verify: either
- why: Muse writes memories on its own, including a page about people in your life. You can read and edit them like a document.

## Step 10: A tiny first test
- coach: "Let's try one small, harmless request in Muse, like 'What's the weather this weekend where I live?' Tell me what happened."
- done_when: The user ran one low-stakes request and reported the result, including whether any approval card appeared.
- verify: user
- why: A harmless test shows how Muse responds and what approval cards look like, with nothing at stake.

## Step 11: Your weekly check-in
- coach: "Last step: shall we put a ten-minute weekly check-in on your calendar? I can give you a calendar file to add."
- done_when: The user accepted or declined the weekly reminder.
- verify: user
- why: Agents drift. A short weekly look at what's connected and scheduled keeps you in control.

## Finish
- summarize: Write one calm paragraph listing the safeguards now in place (approval defaults, what's connected and at what level, training choice, Wallet, off switch found, memory reviewed).
- save_note: Record the device, the first goal, approval defaults, each connector's level, the training choice, and the Wallet state.
- next: Suggest "Your tools" next, then the News Podcast project as the safest first project.
