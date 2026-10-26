# Ticket document format

Path: `decisions.md` in the ticket folder (see `## Setup` in `~/growth/me.md`;
default `~/growth/tickets/<ticket-id>/`). One file per ticket, updated every
session. `grill-with-docs` and
`grill-engineering` both write to it, and `to-spec` reads it.

```markdown
# <TICKET-ID>: <ticket title>

Ticket: <url> · Worktree: <path> · Branch: <name>

## Problem

The problem in the user's words, then a sharper version once it's agreed.

## Diagrams

Mermaid, or links to diagram files kept in the ticket folder.
Label each one with its zoom level.

## Evidence

RCA only: a timeline of facts. Each fact has its source and is marked proven
or guessed.

## Root cause

RCA only, once proven: the cause, the proof, the symptoms it produces, and why
each other explanation was ruled out.

## Product decisions

### <decision title> (YYYY-MM-DD)
- Decision:
- Why:
- Decided by:

## Engineering decisions

### <decision title> (YYYY-MM-DD)
- Decision:
- Why:
- Options rejected: <option>: <why rejected>
- Trade-off accepted:
- Decided by: the user | agent's recommendation, accepted

## Open questions

- <question>: <who answers it>

## Session log

- YYYY-MM-DD, <mode>: what we covered. New terms: …
```

Delete the sections that don't apply. Don't leave empty headings.
