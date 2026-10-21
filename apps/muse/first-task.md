---
id: first-task
title: Design Your Own Task
type: project
order: 4
estimated_time: 10 minutes
risk: varies
requires: []
recommended_after: [getting-started]
summary: Turn your own idea into a safe, bounded task contract.
goal: Choose one small, low-stakes, repeatable task and turn it into a clear contract with the least access it needs.
---

## Step 1: Pick a low-stakes task
- coach: "What's one small, repetitive thing you'd like help with, something that couldn't cost money or embarrass you if it went wrong?"
- done_when: The user has named a task, and it involves no payments, public posts, or sending to other people.
- verify: user
- why: Starting with something harmless lets you learn how Muse works with nothing at stake.
- if_stuck: Suggest one of the sample projects instead.

## Step 2: What it needs access to
- coach: "Which of your accounts would this task need to read? And does it need to change, send, or share anything?"
- done_when: The user has listed the connectors needed and whether each needs read only or write.
- verify: user
- why: The answer decides the lowest rung this task can start on.
- safety: If it needs to send to someone, scope any allowance to one named person or this one task, never broadly.

## Step 3: Draft the contract
- coach: "In your own words: what should Muse do, what must it never do, and when should it ask you first?"
- done_when: A contract exists with Goal, Do, Do not, Ask me before, Report back, and Stop if.
- verify: user
- why: A contract you can read in ten seconds is one you can actually check.

## Step 4: Tighten it
- coach: "Reading it back together: does anything feel too open-ended? Where could this go wrong?"
- done_when: The user has reviewed each line and tightened at least the Do not and Stop if lines.
- verify: user
- why: Most problems come from instructions that are broader than you meant.

## Step 5: One supervised run
- coach: "Paste it into Muse and run it once while we watch. Then check Activity. Did it do only what the contract says?"
- where: Status panel > Activity
- done_when: The user ran it once and confirmed in Activity that it stayed within the contract.
- verify: either
- why: One watched run shows you what the task really does.

## Contract
- goal: {one sentence}
- do: {allowed actions}
- do_not: {forbidden actions}
- ask_me_before: {actions needing sign-off}
- report_back: {when, where, format}
- stop_if: {conditions to halt and alert}

## Ladder
- 0 Watch: Reads and reports only.
- 1 Draft: Prepares; you act.
- 2 Act with approval: Acts after you approve each time.
- 3 Standing rule: One narrow action without asking, reviewed weekly.

## Finish
- summarize: Give the user a copyable version of the contract.
- save_contract: Save the contract and the starting rung.
- next: Suggest scheduling it only after two good supervised runs.
