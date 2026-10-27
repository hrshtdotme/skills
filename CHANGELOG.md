# Changelog

## 2026-10-27

- New `harshit-learn`: teaches a system as one fixed map with progressive
  zoom (whole system, each sub-system, each node). A frame shows the focus,
  each step ends with check questions, and the walkthrough ends with a
  draw-back from memory. `scripts/zoom-map.mjs` renders every step from one
  `map.json`, so the layout never moves, and saves a page that steps through
  the frames.

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
