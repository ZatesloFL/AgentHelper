---
id: calendar-tasks
title: Calendar & Tasks Helper
type: project
order: 2
estimated_time: 20 minutes
risk: medium
requires: [calendar]
recommended_after: [getting-started]
summary: A morning agenda and a simple task list, read-only to start.
goal: Have Muse read your calendar, send a morning agenda, and keep a simple task list, without letting it create, change, or answer anything on your behalf yet.
---

## Step 1: Which calendar and where tasks live
- coach: "Which calendar do you use, and where do you keep your to-do list today, if anywhere?"
- done_when: The user has named their calendar (for example Google Calendar or Outlook) and their task tool or "nowhere yet."
- verify: user
- why: This decides which connection we set up, and whether Muse should keep a task list for you.
- if_stuck: Use the tools profile if it's filled in. If it's a work calendar, suggest checking the employer's policy first and offer Nic. Apple Calendar and Reminders work through the Mac app or iPhone pairing; Outlook calendar support is not confirmed in our notes, so check the Connectors list together.

## Step 2: Connect read-first
- coach: "In Connectors, connect your calendar. Then open it with View. Can you set the read actions to Allow and every write action, like creating events or sending invitations, to Ask?"
- where: Settings > Connectors > (calendar) > View
- done_when: The calendar is connected with read actions allowed and every write action on Ask or Deny.
- verify: screen
- why: Muse can see your schedule but can't change it or invite anyone without asking.
- safety: Don't create a standing invitation allowance for anyone yet. If one exists, revoke it under Manage recipient permissions.

## Step 3: Background sync
- coach: "On that same page there's a 'Background sync' row. Would you like Muse to use your calendar only for tasks you ask for? If so, set it to Deny."
- where: Settings > Connectors > (calendar) > View > Background sync
- done_when: Background sync matches the user's choice.
- verify: either
- why: With it on, Muse's background jobs (Ideas, Feed, suggestions) can also look at your calendar.

## Step 4: Your task list
- coach: "Would you like Muse to keep a simple to-do list for you, as a document in your Library? You'd add things by telling it in chat."
- done_when: The user has chosen where tasks live: a Muse document, their existing tool, or no task list for now.
- verify: user
- why: A list Muse keeps in your Library needs no extra connection. Connecting another tool adds access, so it can wait.

## Step 5: Write the task contract
- coach: "Here's a draft of the instructions. Read the 'Do not' line especially. Does it cover what worries you?"
- done_when: The user has approved a contract that forbids creating, moving, deleting, accepting, or declining events and inviting anyone without asking.
- verify: user
- why: Calendars involve other people. Invites and replies go out under your name.

## Step 6: One supervised run
- coach: "Paste the contract into Muse and ask for today's agenda. Then check Activity. Do you see only reading, no changes?"
- where: Status panel > Activity
- done_when: The user received an agenda and confirmed Activity shows only reads.
- verify: screen
- why: Activity is the record of what Muse actually did.

## Step 7: Try one approval
- coach: "Let's see what an approval looks like. Ask Muse to add a 30-minute 'Focus time' block tomorrow. When the approval card appears, read it to me before you choose."
- done_when: The user saw an approval card for a calendar change and chose Allow or Deny deliberately.
- verify: user
- why: Practicing on something harmless makes real approvals easier to judge. On Android, swiping the notification away counts as Deny.
- if_stuck: If no card appeared, the event may have been created without asking. Check the connector's write settings together and save a note.

## Step 8: Schedule the morning agenda
- coach: "Ask Muse to send your agenda every weekday morning. Then open Upcoming. Is it listed?"
- where: Status panel > Upcoming
- done_when: The agenda task appears in Upcoming.
- verify: screen
- why: Everything that runs on its own should be visible in Upcoming.
- safety: Times are approximate. Don't rely on it for anything time-critical.

## Contract
- goal: Each weekday morning, send me today's agenda with conflicts and anything I should prepare.
- do: Read my calendar. Keep my to-do list document up to date when I tell you about tasks.
- do_not: Create, move, or delete events. Accept or decline invitations. Invite or email anyone. Share my calendar.
- ask_me_before: Any calendar change at all, even one I asked for.
- report_back: One chat message each weekday morning.
- stop_if: The calendar connection needs reconnecting, or you see an event you don't understand.

## Ladder
- 0 Watch: Morning agenda and conflict warnings.
- 1 Draft: Suggests focus blocks and reschedules; you make the changes.
- 2 Act with approval: Creates events you approve on the card, for you only.
- 3 Standing rule: Adds personal focus blocks to your calendar only, never with other people, reviewed weekly.

## Finish
- summarize: Recap the connection level, Background sync choice, task list location, schedule, and the off switch.
- save_contract: Save the final contract and the current rung.
- next: Suggest the weekly check-in, and Inbox Triage only after a week at this level feels boring.
