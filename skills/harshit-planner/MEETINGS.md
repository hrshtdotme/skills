# Meetings

Pull what matters to the user out of their meetings: what they have to do,
what changed, what's expected of them, and what they can learn. This isn't a
summary; the recorder already writes one.

## 1. Find new meetings

1. Read `~/growth/meetings.md`, the log of meetings already processed.
2. Ask the meeting source in `## Setup` for meetings since the last logged
   one (at most the last 7 days). With the Wispr Flow connector, that's
   `search_meetings` with `since` and `until`.
3. Skip every meeting id already in the log.
4. A meeting whose transcript isn't ready yet (still recording, or not
   finalized) is **waiting**: list it and move on. The next run picks it up.
5. With no connector, ask the user to paste the notes or a share link.

Work out which speaker is the user: the name and aliases from the source's
account info, and the name in `me.md`.

## 2. Read

- Read the whole transcript, page by page until it ends. Use the recorder's
  summary only to find your way around; it drops details and gets speakers
  wrong.
- Any language is fine. Write the items in English; quote the original and
  add a translation when it isn't English.
- Name who said something only when the transcript names them or the context
  makes it certain. Otherwise mark it: "guessed: probably Kamran".
- For a meeting someone else shared, attribute things to the people in it,
  never to the user, unless the user is named.

## 3. Extract

| Kind | What counts | Goes to, once confirmed |
| --- | --- | --- |
| **To do** | Something the user committed to, or was asked to do: who asked, by when | The ranked queue in today's or tomorrow's daily file |
| **Changed** | A decision, a priority change, or an ownership change that affects the user's work | The daily file, and `team.md` when it lasts |
| **Expected** | A standing expectation from the manager or a lead about how work is done | `team.md` under `## Expectations` |
| **Feedback** | Praise or a correction from the manager or a lead, to the user or to someone else in the room, that shows what good work looks like | `feedback.md`, newest first |
| **Lesson** | Something that worked, or a mistake discussed, that the user can reuse | `learned.md`, or a proposal in `skill-feedback.md` when it changes the routine (for example, the weekly-goals format) |
| **Context** | Who owns what, what's shipping, risks, customer situations | `team.md` |
| **Term or question** | A technical term new to the user, or something the user didn't follow | The glossary, or a follow-up in the daily file |

Rules for every item:

- One line, then its evidence: a short quote (one sentence at most), the
  meeting title, and the local time.
- Mark it **proven** (said outright) or **guessed** (inferred).
- When the owner isn't clear, write "owner: ?". When there's no date, write
  "by: not said". Write only what the meeting supports; when you're
  inferring, say so.
- Leave out small talk, and updates from others that don't touch the user's
  work, unless they belong in `team.md` as context.

## 4. Confirm

Show one numbered list, grouped by meeting and then by kind, with each item's
destination. List waiting meetings at the end. The user answers in a line,
such as "all except 4; 6 is mine, not Kamran's". Write nothing before they
confirm.

## 5. Write

1. Write each confirmed item to its destination. In `team.md`, replace an
   entry that's out of date rather than adding a second one, and date each
   entry.
2. When an item needs a reply to someone, draft the message for the user to
   send.
3. Add one line per processed meeting to `~/growth/meetings.md`:
   `- YYYY-MM-DD HH:MM · <title> · <meeting id> · <n> items kept`. Waiting
   meetings aren't logged.

Done when every new meeting is either logged with its confirmed items or
listed as waiting.
