# Engineering lenses

Pick only the lenses that matter for the ticket. A small UI fix might need
two. A sync engine needs most of them. Each lens lists the questions to adapt
and the concepts it teaches.

## Pattern

- What known class of problem is this? What name do engineers use for it?
- Where in our codebase, or at a well-known company, has this been solved
  before? What did they pick, and why?

Teaches: naming patterns such as cache invalidation, reconciliation, the
outbox pattern, optimistic UI, backpressure, and fan-out.

## Boundaries and data flow

- Where does the data enter, which pieces does it pass through, and where is it
  stored?
- Which piece is the source of truth? Which ones hold copies?
- Draw the request in order. Which calls cross the network?

Teaches: source of truth, trust boundary, sequence diagrams, coupling.

## State and consistency

- What states can this be in, and which moves between them are allowed?
- What happens if two writers act at once, or the same event arrives twice?
- Which order do we rely on, and what guarantees that order?

Teaches: state machines, race conditions, idempotency, transactions, locks,
eventual consistency.

## Failure modes

- What happens when each dependency is slow, down, or returns an error?
- Who gives up first, the client or the server? What state is left behind
  when that happens?
- Is a retry safe here?

Teaches: timeouts, retries, partial failure, the "fail open" vs "fail closed"
choice, dead-letter handling.

## Performance

- What is the hot path? How many requests, queries and bytes does it cost, and
  how long does it take at p50 and p95?
- What runs on every render, request or row?
- What can be done earlier (prefetch, precompute), or later (lazy load, a
  background job)?

Teaches: percentiles, N+1 queries, indexes, bundle size, waterfalls, caching.

## React and Next.js

- Does this effect sync with something outside React? Or should it be an
  event handler, or a value computed during render?
- Does this run on the server or the client, and why? What crosses that
  boundary?
- Where does the loading state show, and what does the user see while they
  wait?

Teaches: effects and their alternatives, server vs client components,
Suspense, hydration, keys, controlled vs uncontrolled inputs.

## Security

- Who can call this, and what checks that they're allowed to?
- Which input is trusted, and what makes it safe to trust?
- Where do secrets live, and who can read them?

Teaches: authentication vs authorization, trust boundaries, least privilege,
row-level security, secret handling.

## Operability

- How will we know it broke in production? Which log, metric or alert?
- How do we turn it off, or roll it back?
- Does it need a migration or a backfill? In what order do the deploys run?

Teaches: structured logs, feature flags, rollbacks, append-only migrations,
deploy ordering.

## Testing

- At which seam do we test this, and why that one?
- Which behavior deserves an end-to-end test, and which can a unit or
  integration test cover?
- How do we prove the failure path, not only the happy path?

Teaches: test seams, the test pyramid, end-to-end vs integration tests.

## Change cost

- What else depends on this code? Who owns the nearby code?
- How hard is this to undo once it ships?
- What's the smallest change that would prove the idea?

Teaches: blast radius, reversible vs one-way decisions, tracer bullets.
