# Example: a link shortener

A short walkthrough that shows the pacing. The map is
[`examples/link-shortener.json`](examples/link-shortener.json).

```text
/harshit-learn link shortener
```

## Setup

The agent reads the code, then writes the map: a Browser outside the system,
and three groups. The Write path holds the Links API and the ID generator.
The Read path holds the Redirector and the Cache. Storage holds the Links
table and the Click log. `zoom-map.mjs check` lists ten steps: 1, 2.1 to 2.3,
and 3.1 to 3.6.

## Step 1: whole system

> *(diagram: step 1, frame around every box)*
>
> The link shortener turns a long URL into a short code, and sends anyone who
> visits the code to the long URL. Two kinds of request come from the Browser.
> **Create**: the Links API asks the ID generator for a new code and saves
> code and URL in the Links table. **Visit**: the Redirector looks the code up
> in the Cache, falls back to the Links table on a miss, sends the browser a
> redirect, and writes a row to the Click log without waiting for it.
>
> A **cache** is a fast copy of data that lives somewhere slower; it can be
> lost at any time without losing anything real.
>
> 1. Which two boxes does a create request touch, besides the Browser?
> 2. Trace a visit for a code that isn't in the Cache. Name each box in order.
> 3. Why is the Click log arrow dashed?

The user answers: "1. Links API and ID generator. 2. Redirector, Cache, Links
table. 3. Because it's slow."

> 1. Partly right. The Links API also writes to the Links table, which is
>    where the link lives; without it the code points nowhere.
> 2. Right.
> 3. Partly right. Dashed means async: the Redirector sends the redirect
>    without waiting for the write, so a slow Click log doesn't slow the
>    visit. The cost is that a crash can lose a click.
>
> One more: if the Click log is down for an hour, what does a visitor notice?

"Nothing, the redirect still works, but those clicks are missing from the
stats." Correct, so step 1 is `checked`.

## Step 2.2: Read path

The user says "jump to the read path". The agent notes that 2.1 is still
`todo`, and goes.

> *(diagram: step 2.2, frame around the Redirector and the Cache)*
>
> The read path's job is to answer a visit fast. Input: a code from the
> Browser. Output: a redirect to the long URL, or a 404. It reads the Cache
> first and the Links table on a miss, then puts the result in the Cache. It
> owns no data of its own: the Cache is a copy, and the Links table is the
> source of truth. (`src/redirect.ts:12`, proven.)
>
> 1. A link is deleted from the Links table. How long can visits still
>    redirect, and why?
> 2. Which box would you watch to see whether the read path is healthy?

## Step 3.3: Redirector

> *(diagram: step 3.3, frame around the Redirector only)*
>
> Inside, the Redirector runs three steps for each request:
> `lookup(code)` in `src/redirect.ts:12`, then `respond` at line 30, then
> `logClick` at line 41, which isn't awaited. A bad code returns 404 before
> any lookup …

## Finishing

After 3.6 the user draws the map from memory: seven boxes, and every arrow
except the one from the Links API to the Links table. They trace a visit in
four sentences. The agent records explain test 4 of 5, with "missed: the
write of a new link to the Links table" in the notes file.
