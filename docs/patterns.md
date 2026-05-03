# Key Patterns

## Identifier Pattern

Use stable IDs for internal state.

Rules:

- Use city slugs such as `amsterdam`, `utrecht`, and `rotterdam` for supported locations.
- Store station IDs from KNMI, Rijkswaterstaat, and Luchtmeetnet / RIVM separately from display names.
- Use display names only in UI and user-facing copy.

## State Pattern

Dashboard state should be normalized before it reaches the API or AI layer.

Rules:

- Keep raw source responses behind ingestion and persistence boundaries.
- Convert units and timestamps once, in normalizers.
- Carry source freshness and missing-data reasons through derived summaries.
- Prefer explicit `unknown` states over nullable values with ambiguous meaning.

## Snapshot Pattern

If mutable configuration affects long-running operations, snapshot the config at operation start.

Purpose:

- preserve reproducibility
- avoid mid-operation config drift
- improve auditability

## Persistence Pattern

Document transaction/session rules once the backend exists.

Examples:

- use context-managed sessions
- rollback on failure
- keep writes atomic
- avoid direct writes outside persistence helpers

## External Side-Effect Pattern

External operations should be isolated behind source adapters, service layers, or broker layers.

Rules:

- no raw external calls from random modules
- queue or wrap dangerous side effects
- log outcomes without secrets
- test with mocks

## AI Grounding Pattern

The LLM receives compact normalized JSON and explains it.

Rules:

- deterministic code calculates scores, trends, and categories
- prompts must instruct the model to disclose missing data
- answers must identify used data keys when possible
- model output must not present itself as official Dutch authority guidance

## Code Style

- Comments should be sparse and useful.
- Prefer clear names.
- Avoid clever abstractions.
- Delete dead code.
- Do not add compatibility shims unless required.
- Keep helpers only when they reduce real duplication or complexity.

## Anti-Patterns

- hidden global state
- broad exception swallowing
- untested external calls
- unexplained background jobs
- AI access to raw NetCDF or GRIB source files in MVP
- docs that duplicate code instead of explaining behavior
