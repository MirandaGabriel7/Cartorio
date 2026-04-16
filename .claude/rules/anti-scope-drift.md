# Rule — Anti Scope Drift

## Principle

Phase 0 has a narrow, precise, finite scope. Every minute spent on something outside that scope is a minute removed from the three gate decisions. Drift compounds. Prevent it early.

---

## What scope drift looks like

Scope drift is rarely announced. It appears as:

- "While I'm here, let me also…"
- "This would be cleaner if I refactored…"
- "A small improvement to the production code…"
- "Let me add a nice CLI around this script…"
- "I noticed this library is nicer, let me migrate…"
- "I'll just write a small UI to visualize…"
- "Let me generalize this for future reuse…"
- "Since we're running OCR anyway, let me also classify…"
- Writing unit tests for exploratory scripts that won't survive Phase 0.
- Producing beautiful visualizations when the plan only asks for a JSON.

All of the above are drift. All of the above are forbidden.

## What is in scope

Only the activities listed in Section 9 of the plan. Only the deliverables listed in Section 11. Only the decisions listed in Section 1.2. Nothing else.

## How to detect drift before it happens

Before starting any step, ask:

1. Is this step listed in the plan?
2. Which activity in the Section 9 schedule does it belong to?
3. Which deliverable does it produce or feed?
4. Which gate does it contribute to?

If any of these answers is unclear, you are about to drift. Stop.

## Claude Code tendencies that cause drift

- Over-engineering scripts that are meant to run once.
- Adding abstractions (factories, interfaces) for scripts that have a single caller.
- Writing prose explanations in code comments when the plan asks for them in a report.
- Expanding the anchor catalog beyond the priority fields listed in Section 7.1.
- Pre-optimizing for Phase 1 production scenarios while still in Phase 0.
- Automating human-only tasks (annotation, exclusion approval, anonymization verification).
- Writing a CLI around a benchmark script.
- Generating UI previews or dashboards.

Avoid all of the above.

## If a user requests something that is drift

1. Stop. Do not start the task.
2. Quote the request in the log under `DRIFT REQUEST REFUSED`.
3. Cite the relevant plan section and rule file.
4. Offer the in-scope alternative if one exists.
5. Return to the in-progress activity only after the user acknowledges.

## If drift is detected after it started

1. Stop the drifting work.
2. Log it under `SCOPE DRIFT DETECTED`.
3. If possible, revert the change.
4. If the change is already committed, create a follow-up log entry documenting what remains from the drift and get technical lead approval to either revert or accept.
5. Resume the in-scope activity.

## Parser sketch specific boundaries

The parser sketch is prototype-quality. It is allowed to:

- Focus only on the priority fields listed in Section 7.1.
- Use straightforward regex-based extraction.
- Have no generalized error recovery beyond logging.
- Skip multi-page reconciliation complexity not demanded by the plan.

The parser sketch is **not** allowed to:

- Attempt to extract every field listed in Section 17 of the v1.3 plan.
- Implement confidence aggregation that resembles the production confidence system.
- Build a rules engine.
- Connect to databases.
- Persist state beyond the single run output JSON.

## Preprocessing pipeline specific boundaries

Only the six experiments (A–F) specified in Section 5 of the plan are executed. New experiments can be added **only** if the technical lead approves a gate-failure corrective action that requires them. New experiments get their own ID (e.g., `EXPERIMENT_G`) and are logged as a new run.

## Benchmark-only code stays in benchmark folders

Benchmark scripts, preprocessing helpers, and parser sketch code live under `benchmarks/`, `parser_sketch/`, `scripts/`, `ferramentas/`. They do not move to a `src/` folder. They do not get packaged. They do not get imported by anything outside Phase 0.
