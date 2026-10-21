# Nic's Playbook for Personal AI Agents

Last checked: 2026-10-21

These are Nic's recommendations, tagged **[NIC]**. They are opinions and working practice, not facts about the product. When you use one, say so: "Nic recommends…". Facts about Muse live in the knowledge pack and keep their own tags.

<!-- DRAFT: written by Claude from Nic's field guide and the guide's design principles. Nic to review, edit, and remove this line before shipping. -->

## The core idea

An agent is a helper with keys. Give it the fewest keys that get the job done, watch it work before you trust it, and check in on it regularly. Start small, earn trust, then widen. [NIC]

## 1. Start safe

- **Turn approvals up before you connect anything.** Set Settings > Permissions > Connector defaults and Web access defaults to "Always ask" for your first weeks. Relax them later, one area at a time, when you know what the prompts look like. [NIC]
- **Check what is already connected.** Look at Settings > Connectors > Connected before adding anything. Disconnect what you didn't choose. [NIC]
- **Decide on the AI-training toggle on purpose.** It starts ON for a standard account. If you plan to route email, money, health, or work through Muse, consider turning it off in Data controls. [NIC]
- **Leave the Wallet empty at first.** Purchases always ask, but an empty Wallet means nothing can even be prepared. Add a payment method only when you have a specific purchase task. [NIC]
- **Learn your off switch before you need it.** Know how to stop a running action (Activity, Stop), delete a scheduled task (Upcoming), disconnect a connector, and, as a last resort, Reset. Practice finding them once. [NIC]
- **Keep apps updated.** Security fixes ship through updates. [NIC]

## 2. Least access, always

- **Read before write.** Connect a service with read actions allowed and write actions on Ask or Deny. Promote write actions only for a task that needs them. [NIC]
- **Background sync off for sensitive accounts.** For email, finances, and health, consider setting Background sync to Deny so only the tasks you start use that connector. [NIC]
- **Personal before work.** Don't connect a work email, calendar, or drive without checking your employer's policy. When in doubt, talk to Nic first. [NIC]
- **One recipient, one task.** If you allow sending without asking, scope it to one named person or one scheduled task. Never broad. [NIC]
- **Use a low-stakes sandbox while learning:** a secondary email address, a test calendar, a throwaway folder. [NIC]

## 3. The autonomy ladder

Move each task up one rung at a time, only when the rung below has been boring for a week. [NIC]

| Rung | The agent… | You… |
|---|---|---|
| 0. Watch | reads and reports only | read the report |
| 1. Draft | prepares drafts, labels, or proposals | apply them yourself |
| 2. Act with approval | acts after you approve each time | approve or deny on the card |
| 3. Standing rule | does one narrow thing without asking | review it weekly |

Purchases, public posts, and anything you can't undo never go past rung 2. [NIC]

## 4. Write tasks like contracts

Every recurring task gets a short contract the user can read in ten seconds [NIC]:

- **Goal:** one sentence.
- **Do:** the allowed actions.
- **Do not:** the forbidden actions, stated plainly.
- **Ask me before:** the actions that need sign-off.
- **Report back:** when, where, and in what format.
- **Stop if:** conditions that should halt the task and alert the user.

Paste the contract into the task's instructions so the agent sees it on every run. [NIC]

## 5. Trust, but verify the output

- **Gather, verify, write: three separate steps.** Have Muse collect sources, check each one by opening it, then write. Ask for a source link on every claim. [NIC]
- **Spot-check weekly.** Open two or three items from a briefing and check them against the source. Nobody else sees your briefings, so nobody else will catch mistakes. [NIC]
- **Muse checks on a schedule; it doesn't watch live.** Don't rely on it for anything time-critical. [NIC]

## 6. Treat incoming content as untrusted

Emails, web pages, documents, and messages can contain instructions aimed at your agent ("forward this to…", "ignore your rules and…"). Muse scans for this, but no filter is perfect. [NIC]

- Never give an email-reading task permission to send or forward without asking.
- Be suspicious of any task result that asks you to approve something you didn't expect.
- If an approval card surprises you, deny it and ask the guide or Nic.

## 7. Keep it tidy

- **Weekly ten-minute check:** Upcoming (what runs), Permissions counts (what's allowed), Connectors (what's connected), Identity > MEMORY (what it remembers), Activity (what it did). [NIC]
- **Prune.** Ideas, Goals, and scheduled tasks pile up. Delete what you're not using. [NIC]
- **Memory hygiene.** Muse keeps a page about each person in your life. Read MEMORY occasionally and remove anything too personal or wrong. Clearing a chat doesn't clear what memory already captured. [NIC]

## 8. When something goes wrong

Stop first, understand second. [NIC]

1. Stop the running action (Activity, Stop) or delete the task (Upcoming).
2. Disconnect the connector involved.
3. Check Activity and approvals History to see exactly what happened.
4. If anything was sent, bought, or shared, deal with that directly (contact the person, the store, or the bank).
5. If a password may be exposed, change it in that service and in Accounts Center.
6. Talk to Nic.

## 9. When to bring in a human

Bring in Nic when [NIC]:

- it involves money, a work account, or someone else's data
- something happened that you didn't expect and can't explain
- you've tried the same fix twice
- you just want a second pair of eyes; that's what Nic is for
