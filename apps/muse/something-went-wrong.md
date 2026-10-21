---
id: something-went-wrong
title: Something Unexpected Happened
type: support
order: 1
estimated_time: 10 minutes
risk: high
requires: []
recommended_after: []
summary: Muse did something you didn't expect. We'll stop it, see what happened, and fix it, one step at a time.
goal: Stop anything still running, understand exactly what happened, limit any harm, and decide whether Nic should get involved.
---

## Step 1: Breathe, then stop it
- coach: "We'll sort this out together. First, is Muse still doing something right now? Click Muse's picture, open Activity, and if anything is running, press Stop."
- where: Chat header > agent avatar > Activity
- done_when: Nothing is running, or the user has stopped it.
- verify: either
- why: Stopping first keeps things from getting worse while we look.
- if_stuck: On web, Stop appears when you hover over a running item. If you can't find it, disconnecting the service involved in step 3 also stops it.

## Step 2: What happened
- coach: "In your own words, what did Muse do that you didn't expect?"
- done_when: The user has described the event.
- verify: user
- why: I'll use your words to find it in the records.

## Step 3: Cut off the access involved
- coach: "Which service was involved, like email, calendar, or a website? Let's disconnect it for now. You can reconnect later."
- where: Settings > Connectors > Connected > (service) > View > Disconnect; or Settings > Permissions > Websites you've allowed
- done_when: The service involved is disconnected or its website allow revoked, or the user chose to keep it with a reason.
- verify: screen
- why: Disconnecting removes Muse's access to that service right away.

## Step 4: Check the records
- coach: "Open Activity and Approvals > History. Can you find the moment it happened? What does it say, and did an approval come before it?"
- where: Status panel > Activity; Status panel > Approvals > History
- done_when: The user has found the event in Activity or History, or confirmed it isn't there.
- verify: either
- why: These records can't be secretly erased, so they show what really happened and whether something was approved.

## Step 5: Scheduled cause?
- coach: "Open Upcoming. Is there a scheduled task that could have done this?"
- where: Status panel > Upcoming
- done_when: Any task that caused or could repeat the event is deleted or paused.
- verify: screen
- why: If a schedule caused it, it will happen again unless removed.

## Step 6: Deal with what went out
- coach: "Did anything go to another person, get bought, or get posted publicly? If so, let's plan what to do about it."
- done_when: Anything sent, bought, or shared has a plan: contact the person, cancel or return through the store, delete the post, or "nothing went out."
- verify: user
- why: Muse can't undo things in the outside world. Some of this needs you to act directly.
- safety: If a payment was involved, contact the store or bank. If a password may be exposed, change it in that service and in Meta Accounts Center.

## Step 7: Bring in Nic
- coach: "Would you like me to draft a short report for Nic with what we found? You'll see it before anything is sent."
- done_when: The user has chosen to send a report to Nic, book time, or handle it alone.
- verify: user
- why: A second pair of eyes helps, especially if money, other people, or a work account were involved.

## Finish
- summarize: Calmly recap what happened, what was stopped and disconnected, and what's left to do.
- save_note: Record the incident in one or two factual lines with the date.
- next: Offer the Full Safety Audit once things feel settled.
