---
name: harshit-learn
description: Teaches a system as one fixed map with progressive zoom, from the whole system to each sub-system to each node. A frame moves to show the focus, and you explain each step back before going deeper.
argument-hint: "<system, ticket id, or path> [resume | <step id>]"
disable-model-invocation: true
---

# Harshit learn

You teach the user one system as a **map**: a fixed diagram of boxes and
arrows that stays the same from start to finish. Only the **focus frame**
moves. It goes around the whole system, then around each sub-system, then
around each node. The user keeps one picture in their head, and each step adds
detail to part of it.

```text
1    Whole system      frame around everything
2.n  Sub-system n      frame around a group of nodes
3.n  Node n            frame around one node
```

The user is the student. A step is done when they explain it back correctly,
not when you finish explaining it.

## Before the first step

1. Read `~/growth/me.md`, especially `## Setup`. Read `~/growth/glossary.md`
   so you know which terms the user already uses (status `using`) and which
   are new to them.
2. Work out the **slug**: a short kebab-case name for the system, such as
   `billing-usage` or `link-shortener`. If `~/growth/systems/<slug>.md`
   exists, read it and continue from its first step that isn't `checked`, or
   from the step in the arguments.
3. If the arguments name a ticket, read `decisions.md` in its ticket folder
   (the pattern is in `## Setup`). Its decisions explain why the system has
   its shape; cite them when you teach.
4. Investigate. Read the code, docs, plan or spec until you can trace one real
   request or piece of data through the whole system. Use subagents for broad
   searches. Keep facts and guesses apart, with sources (`file:line`, doc
   section). When the system is only planned, say so and mark planned nodes
   in their note.
5. Build `map.json` in `~/growth/systems/<slug>/`, following
   [DIAGRAMS.md](DIAGRAMS.md). It holds 5 to 12 nodes, 2 to 4 groups (the
   sub-systems), and the arrows between nodes. Run
   `node <this skill's folder>/scripts/zoom-map.mjs check <map.json>` and fix
   every error and warning.

The map is the contract for the whole walkthrough. Changing it later moves
boxes the user has already memorised, so get it right now.

## Each step

Send one step per message, in this order:

1. **Diagram.** Render the step with `zoom-map.mjs step <map.json> <id>` and
   draw it as described in [DIAGRAMS.md](DIAGRAMS.md#drawing-in-chat).
2. **Explanation**, in plain words, for the level in focus:

   | Level | Cover |
   | --- | --- |
   | 1 Whole system | What the system is for, in one sentence. Who or what uses it. One real request or piece of data traced from start to end across the map. The sub-systems by name. |
   | 2 Sub-system | Its job. Its inputs and outputs. How it talks to each neighbour: call or event, sync or async, what data crosses. What it owns and what it promises. |
   | 3 Node | How it works inside: the data it holds, its states and what moves it between them, the code path with `file:line` when there's code, what happens when it fails, and one trace through it. |

   Keep levels 1 and 2 short: what a reader takes in with the diagram open,
   about 150 to 250 words. Level 3 can be longer.
3. **Words.** The first time a term comes up, define it in one plain sentence.
   When something has a standard name, give the name. Add new terms to
   `~/growth/glossary.md` with status `new`.
4. **Check questions.** End with 2 or 3 numbered questions, then stop and
   wait for the answers.

## Check questions

Each question makes the user use the map, not repeat your words. Mix these:

- **Explain back**: "In two sentences, what is the Redirector's job?"
- **Trace**: "A visit arrives for a code that isn't cached. Name every box it
  touches, in order."
- **What if**: "The Cache is down. What still works, and what gets slower?"
- **Boundary**: "Which box decides the short code, and which one only stores
  it?"
- **Connect** (level 2 and 3): link this step to one the user already passed.

When the answers come in, say for each one whether it's right, partly right
or wrong, and why. Then give your own answer.

- **All right**: mark the step `checked` and move to the next step.
- **Partly right or wrong**: explain the missing piece another way, and ask
  one new question about it. Move on once that one is right.
- **Stuck**: give a hint, then the box or file to look at, then the answer
  followed by a new check question.
- "ok", "makes sense" or "got it" isn't an answer. Ask the questions again,
  shorter.
- "Just tell me": answer, then ask one question that checks they understood,
  and note in the notes file that the step was told, not explained back.

## Moving around the map

The default order is 1, then each 2.n, then each 3.n. The user can say:

| The user says | You do |
| --- | --- |
| next, or answers the questions | Check the answers, then the next step |
| jump to 3.4, or zoom into the Cache | Go to that step. If its sub-system isn't `checked`, say so in one line, and go anyway |
| zoom out | Go to the step one level up that contains the current focus |
| back | The previous step |
| map, or tour | Draw the whole stepper (`zoom-map.mjs tour`) so they can click through every frame |
| skip | Mark the step `skipped` and go to the next one |

When a node is a whole system of its own, finish its 3.n step, then offer a
**child map**: a new walkthrough with slug `<slug>--<node-id>` that starts
again at level 1.

When you find the map is wrong (a missing node or arrow), say so, fix
`map.json`, and put new nodes in empty cells so the existing boxes stay where
they are. If boxes must move, show level 1 again before you continue.

## The notes file

`~/growth/systems/<slug>.md` lets any later session resume where this one
stopped. Create it after step 1, and update it after every step:

```markdown
# <System name>

Map: [map.html](<slug>/map.html) · Source: <code paths, plan or doc> · Ticket: <id or none>

## Map

<Mermaid from `zoom-map.mjs mermaid`>

## Steps

| Step | Focus | Status | Date |
| --- | --- | --- | --- |
| 1 | Whole system | checked | YYYY-MM-DD |
| 2.1 | <group> | todo | |

## Notes

### 2.1 <group>
- In the user's words: <their explanation, quoted or close to it>
- Corrected: <what they got wrong, and the right version>
- Open: <questions nobody could answer yet>

## Session log

- YYYY-MM-DD: steps covered. New terms: …
```

Status is one of `todo`, `taught` (explained, not yet checked), `checked`
(explained back correctly), `told` (the user asked for the answer) or
`skipped`. Run `zoom-map.mjs save <map.json> ~/growth/systems/<slug>/` after
any change to `map.json`, so `map.html` and `map.svg` match it.

When the walkthrough is about a ticket, add a link to the notes file under
`## Diagrams` in that ticket's `decisions.md`, and a line to its session log.
This is a learning session, so it records no decisions. When the user wants to
change the design, write it under `## Open questions` in `decisions.md` for a
design session.

## Finishing

After the last step, run the **draw-back**: the user draws the map from
memory, on paper or as a list of boxes and arrows, and explains one trace from
start to end in at most five sentences. Compare it with the map and name what
they missed. Record the result in the notes file as the session's explain
test: what they drew, what they missed, and a score from 1 to 5.

Then suggest at most one change to this skill, based on what didn't work. If
the user agrees, add it to `~/growth/skill-feedback.md` under `## Proposed`.

A walked-through example is in [EXAMPLE.md](EXAMPLE.md).
