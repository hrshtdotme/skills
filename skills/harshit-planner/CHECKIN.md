# Check-in

Runs on the check-in days in `~/growth/me.md` (default: Wednesday and
Saturday). Covers the days since the last check-in. Write the results into
this week's weekly file under `## <Day> check-in`.

## 1. Score the signals

Use the signal table in `~/growth/me.md`.

1. **Explain test.** List what the user shipped since the last check-in. For
   each one, the user explains it without AI: what it does, how data flows
   through it, the main decision and what it cost. Ask for a drawing at the
   containers or sequence zoom level. Then compare it with `decisions.md` and
   the code, name the gaps, and score 1 to 5. The user answers first; you
   don't hint until they've tried.
2. **Bugs from my work.** Search the tracker and team chat for bugs and
   complaints since the last check-in that trace back to the user's changes,
   and check the ship-check results in the ticket folders. List each one with
   its link and the ticket that caused it.
3. **Plan hit rate.** Add up done / planned from the daily files.
4. **Terms.** Ask the user to use 2 or 3 `new` or `read` glossary terms in a
   sentence about their own work. Move the ones used correctly to `using`.

Compare with the last check-in: better, same, or worse, and the likely reason.

## 2. Check the skills

This is an eval: check how the agents actually behaved against what the user
wants from them.

Find the ticket sessions since the last check-in. For Claude Code, session
transcripts are JSONL files under `~/.claude/projects/<project-folder>/`:

```bash
find ~/.claude/projects -maxdepth 2 -name '*.jsonl' -newermt <last check-in date>
```

Keep the ones that started with `/harshit-works`. For each one, read the
user's messages and the agent's replies:

```bash
jq -r 'select(.type=="user") | .message.content | if type=="string" then . else (map(select(.type=="text").text) | join("\n")) end' <file>
jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="text") | .text' <file>
```

Score each item yes, partly or no, and give the quote or file that shows it.

**`/harshit-works`**

- The kickoff said what the ticket wants, where `decisions.md` left off, the
  fitting workflow, and the command for the user to type next, then waited.
- The agent ran no skill the user didn't type.
- Fix and Build tickets went through `/grill-engineering` before build.
- `decisions.md` exists and has a session-log line for each session.
- Build started only after the decisions were recorded.
- The test plan had exact values, full URLs, and checks after each step.
- A feature named its usage signal and failure signal.
- The ticket ended with a lesson in `learned.md`.
- A passive session made no decisions and stopped where it was told to.

**`grill-engineering`**

- In bug mode, the agent didn't state the cause, or draw it into a diagram,
  before the user tried.
- Each proposed cause went through the why chain and the fix test.
- The questions were about engineering (pattern, data flow, failure,
  trade-offs), not only about the product.
- The user answered before seeing the agent's view, and each answer got a
  verdict.
- Real choices came as an options table, and the user picked with a reason.
- New terms were defined and added to the glossary.
- Every discussion had a diagram with a zoom level.
- It ended with a teach-back that held up.

## 3. Improve

1. Read `## Proposed` in `~/growth/skill-feedback.md`, and add a proposal
   for each `no` above that happened more than once.
2. Recommend at most two changes, each with the evidence behind it. The user
   approves or rejects each one.
3. Apply the approved changes to the skill files (the skills folder in
   `## Setup`; otherwise ask where the user keeps them), then move each one to
   `## Applied` with the date. Move rejected ones to `## Rejected` with the
   reason.

A step the user keeps skipping is a sign it's too heavy. Propose cutting it
rather than enforcing it.

## 4. Last check-in of the week

Review the week against the weekly goals: met, partly met, or missed, and
why. Note one habit to keep and one to change next week. The `monday` mode
reads this.
