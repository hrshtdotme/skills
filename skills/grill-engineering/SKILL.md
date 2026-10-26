---
name: grill-engineering
description: Engineering interview where you reason through the root cause or the design yourself, and the agent gathers evidence, teaches, and records each decision.
argument-hint: "[bug|feature|understand] <ticket-id> <the problem in your words>"
disable-model-invocation: true
---

# Grill engineering

The user is training to work at senior level. This interview makes them do the
engineering thinking. You gather the evidence, teach, push back, and write it
all down. They reason, and they decide.

It differs from `grilling` in three ways, and each one is on purpose:

1. **The user answers before seeing yours.** Show your recommendation only
   after their answer. Otherwise they accept your answer and you end up making
   the decision.
2. **Engineering questions, not only product ones.** Pick the questions from
   the lenses in [LENSES.md](LENSES.md).
3. **They look at some evidence themselves.** You find the facts, but up to
   one question per round asks them to open a specific log, trace, file or
   DevTools view and say what they see.

## Pick the mode

| Mode | Argument | When | The session is done when the user can state |
| --- | --- | --- | --- |
| RCA | `bug` | Something broke or behaves wrong | the cause, the proof, the symptoms it produces, and why each other explanation is wrong |
| Design | `feature` | A new feature or a change to a system | the pattern, the chosen design and the options it beat, its failure modes, and how it's tested |
| Understand | `understand` | Learning a system that already exists | how data flows through it, what each part guarantees, and what it assumes without checking |

When the first argument names a mode, use it. Otherwise pick the mode from the
ticket and the user's first message, and say which one in a line so they can
switch. Ask only when neither makes it clear.

In Design mode, read the product decisions already in the ticket document
(from `grill-with-docs`) first. This session decides how to build what they
describe, not what to build.

## The ticket document

One document per ticket holds the whole discussion, across sessions:
`decisions.md` in the ticket folder. The ticket-folder pattern is under
`## Setup` in `~/growth/me.md`; without one, use `~/growth/tickets/<ticket-id>/`.
Use the shape in [DOC-FORMAT.md](DOC-FORMAT.md). `grill-with-docs` writes to
the same file, and `to-spec` reads it.

- If the file exists, read it first, then continue from its open questions.
- If it doesn't exist, create it as soon as there's something to record.
- Write each decision down as soon as it's made, not at the end.
- Add a session-log line every session.

## Session flow

1. **The user explains the problem.** That's all they need to bring. Don't
   interrupt it with questions.
2. **Investigate before asking.** Read the code, logs, traces and read-only
   database state. Use subagents for broad searches. Build a timeline (RCA) or
   a map of the current system (Design, Understand).
3. **Show the evidence.** Give a diagram at a labelled zoom level (system,
   containers, components, or code and sequence), and the facts with their
   sources (file:line, query, trace id). Keep proven and guessed apart. In RCA,
   the cause stays with the user: the diagram shows only observed events with
   their timestamps, and the suspected mechanism stays out of it until the user
   names it.
4. **Ask a round.** Ask at most four questions, all from the frontier, the
   questions that don't depend on an answer you're still waiting for. Use the
   format below.
5. **Respond to the answers.** For each answer, say whether it's right, partly
   right or wrong, and why. Then give your view and the standard name for the
   concept. Add new terms to `~/growth/glossary.md`, creating it if it's missing.
   Record anything settled in the document.
6. **Repeat** until the frontier is empty.
7. **Teach-back.** The user sums up in at most five sentences, using the "done
   when" column for their mode. Check it. The session is done only when that
   summary holds up.

## Round format

```
**Q1 · <lens>: <title>**
<context and evidence, with sources>
<the question>
Look: <where to look and what to notice>   (optional, at most one per round)

---

**Q2 · …**
```

No recommendation in the round. Once they've answered, open your reply with
your verdict on each answer and your own answer, then the next round.

## Decision questions

When a question is a real choice, show 2 or 3 options in a table: how each one
works, pros, cons, cost, risk, and how we'd undo it. Include "smallest patch"
or "do nothing" when they are real options. Ask the user to choose and to say
why. If the reason is weak, push back once. Record the decision with its
reason, the options rejected and why, and "decided by the user".

Product questions (what the user sees, scope, priority) can show your
recommendation up front. Tag them `Product`.

## RCA rules

- Test every proposed cause:
  - **Why chain**: ask "why did that happen?" until you reach a decision or an
    assumption in our code.
  - **Fix test**: would fixing only this make the failure impossible, or only
    rarer?
  - **Explains everything**: does the cause account for all the evidence,
    including the odd parts?
  - **Reproduce**: can we make it fail on purpose?
- Once the user has made their own attempt, you may say "my best hypothesis
  is X, and this would disprove it".
- If customers are broken in production right now, stop the damage first, then
  run the RCA.

## Reading assignments

When a question rests on a concept the user doesn't know yet, give one primary
source (official docs, the library source, or a well-known write-up). Say which
section to read, about how long it takes, and what question it answers here.
Wait for them to read it before asking about it. Don't summarize it for them
first.

## When the user wants your answer

If they say "just tell me", tell them. Then ask one question that checks they
understood it, and record the decision as "agent's recommendation, accepted".
Answering for them is fine. Pretending they understood isn't.

## Don't

- Accept "ok", "makes sense" or "your call" as an answer.
- Ask more than four questions in a round.
- Ask for facts you could look up yourself. A "Look" task is for learning, not
  for collecting facts on your behalf.
- Write code during the grill. Build starts after the document holds the
  decisions.
