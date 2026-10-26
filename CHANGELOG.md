# Changelog

## 2026-10-26 (later)

- `harshit-planner` has a `meetings` mode, which `shutdown` runs first. It
  reads the full transcripts of new meetings and pulls out to-dos, changes,
  expectations, lessons, context, terms and questions, each with a quote and
  marked proven or guessed. It confirms them with you before writing them to
  your plan, `team.md`, `learned.md` and the glossary.
- `harshit-works` follows the expectations in `team.md`.

## 2026-10-26

- First release: `grill-engineering`, `harshit-works`, `harshit-planner`.
- `grill-engineering` takes `bug`, `feature` or `understand` to pick its mode.
  In `bug` mode, evidence diagrams show only observed events, so they can't
  give the cause away.
- `harshit-works` describes how you work and which command comes next. It
  loads no other skills.
- `harshit-planner` keeps its state in `~/growth/` and starts with `setup`.
