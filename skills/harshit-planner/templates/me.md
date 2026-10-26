# Me: goals and routine

Read by `/harshit-works`, `/harshit-planner` and `/grill-engineering`. The
agent keeps this file current; change it by telling the agent.

## Who

<role, team, years of experience, where you are today>

## The goal

<the level you're working towards, and by when>. That means you can:

1. Explain any system you built at every zoom level, and draw it.
2. Name the real cause of a failure with evidence, not a symptom of it.
3. List the options considered for a decision, why one won, and what it costs.
4. Use the right technical words and know what each one means.
5. Prove a change works end to end, and see how it behaves in production.

The point is to be reliable. Recognition follows from that; it isn't the
target.

## Every ticket has two goals

1. **Ship it**: the ticket's outcome, proven, observable in production.
2. **Learn from it**: one new thing you understand afterwards, in your own
   words, in `learned.md`.

## Signals (scored at each check-in)

| Signal | Question | Score |
| --- | --- | --- |
| Explain test | Without AI, can you draw and explain what you shipped? | 1 to 5 per shipped thing |
| Bugs from my work | How many bugs or customer complaints trace back to what you shipped? | count, with links |
| Plan hit rate | How many of each day's planned top 3 got done? | done / planned |
| Terms | Glossary terms that moved to `using` | count |

## Routine

| Item | Setting |
| --- | --- |
| Work days | not set |
| Morning | not set (e.g. 4 to 6 hours of ticket work: one active session at a time, up to 2 passive) |
| Learning block | not set (e.g. 1 to 2 hours a day studying a system you built) |
| Meetings | not set |
| Shutdown time | not set |
| Standup | not set (where, when, format; default Yesterday / Today / Blockers) |
| Weekly goals | not set (default: posted on the first workday of the week) |
| Manager update | not set (default: every 2 work days: decisions and why, priority changes or risks, what you need) |
| Check-in days | not set (default: Wednesday and Saturday) |

## Shipping rule: observability

Every feature ships with:

1. **A usage signal**: an analytics event showing people use it.
2. **A failure signal**: a log, trace or metric query that shows when it
   breaks.
3. **A ship check**: 2 days after the change reaches production, look at both.

## Setup

| Item | Setting |
| --- | --- |
| Tracker | not set (e.g. Linear, Jira, GitHub Issues) |
| Code host | not set (e.g. GitHub `owner/repo`) |
| Repositories and worktrees | not set (e.g. `~/code/app`, worktrees at `~/code/app-<ticket>`) |
| Ticket folders | `~/growth/tickets/<ticket-id>/` |
| Preview environment | not set (e.g. Vercel preview per pull request) |
| Production branch | not set (e.g. `main`, or the branch that deploys to production) |
| Analytics | not set (e.g. PostHog, Amplitude) |
| Logs and traces | not set (e.g. Datadog, Sentry) |
| Skills folder | not set (where you edit these skills) |
| Companion skills | `grill-with-docs`, `to-spec`, `to-tickets`, `implement` from `npx skills add mattpocock/skills` |
