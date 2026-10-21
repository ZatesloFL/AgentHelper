---
id: news-podcast
title: Daily News Podcast
type: project
order: 1
estimated_time: 20 minutes
risk: low
requires: []
recommended_after: [getting-started]
summary: A short daily audio briefing on topics you choose, with sources. No accounts needed.
goal: Set up a daily, sourced news briefing that Muse researches, checks, and turns into a short podcast, without connecting any personal accounts.
---

## Step 1: What you want to hear
- coach: "What topics would you like in your daily briefing, and roughly how long should it be?"
- done_when: The user has named 2-5 topics and a length (5-15 minutes).
- verify: user
- why: A narrow brief makes better episodes and uses less of your weekly allowance.

## Step 2: Sources you trust
- coach: "Are there news sources you trust, or ones you'd like Muse to avoid?"
- done_when: The user has named preferred sources, sources to avoid, or said "use reputable sources."
- verify: user
- why: Muse's Feed can't take a source list, but a scheduled task's instructions can.

## Step 3: Write the task contract
- coach: "Here's a draft of the instructions for Muse. Does anything feel too open or missing?"
- done_when: The user has approved a contract that splits gathering, checking, and writing into separate steps, requires a source link for every item, and flags anything unverified.
- verify: user
- why: Separate checking steps catch more mistakes than one pass.

## Step 4: Keep it account-free
- coach: "This project doesn't need any of your accounts. When we create the task, we'll check its permissions so it can't use your email or calendar."
- where: Status panel > Upcoming > (task) > View permissions
- done_when: The user understands the task needs no connectors and will set each connector to Deny in the task's permission editor once it exists.
- verify: user
- why: Even a harmless task shouldn't hold keys it doesn't need.
- safety: Sharing an episode with someone else counts as a send and will ask first.

## Step 5: One supervised run
- coach: "Paste the contract into Muse and ask for today's episode now, not on a schedule yet. Tell me when it's ready."
- done_when: The user has one episode (audio or script) in Library > Media > Podcasts or in chat.
- verify: either
- why: Seeing one episode first lets you fix the instructions before it runs every day.
- if_stuck: If audio fails, ask for a written briefing first. Note that a Confidential VM, once available, removes podcast audio.

## Step 6: Check the episode
- coach: "Pick two stories from the episode and open their source links. Do the sources say what the episode says?"
- done_when: The user has checked at least two items against their sources and reported what they found.
- verify: user
- why: Nobody else sees your briefing, so spot-checking is the only way to catch mistakes. Muse checks single claims well but can stretch one theme across unrelated stories.

## Step 7: Put it on a schedule
- coach: "Happy with it? Ask Muse to run it every morning at the time you like. You should see a 'Scheduled task' card in chat. Then open Upcoming. Is it listed?"
- where: Status panel > Upcoming
- done_when: The task appears in Upcoming under Daily, and its permissions show connectors set to Deny.
- verify: screen
- why: Upcoming is where you can see, pause, or delete everything that runs on its own.
- safety: Times are approximate. Podcast links expire after about 48 hours, so listen the same day or keep the written version.

## Contract
- goal: Each morning, give me a {length}-minute audio briefing on {topics}.
- do: Search the web; gather sources; check each item by opening its source; write a script; make the audio; save it to my Library.
- do_not: Use any of my connected accounts. Share, publish, or send the episode to anyone. Include anything you couldn't check without flagging it.
- ask_me_before: Changing topics, length, or schedule.
- report_back: A chat message with the episode, the written version, and a source list.
- stop_if: A source can't be reached for most items, or usage is above 80% of my weekly allowance.

## Ladder
- 0 Watch: A written research brief with sources, on request.
- 1 Draft: A written script you read and approve before audio is made.
- 2 Act with approval: Daily audio episode, made on request.
- 3 Standing rule: Daily scheduled episode, delivered to you only.

## Finish
- summarize: Recap the topics, schedule, source rules, and the spot-check habit.
- save_contract: Save the final contract and the current rung.
- next: Suggest the Calendar & Tasks project when they're ready to connect an account.
