# Anonymous Usage & AI Q&A Foundation Spec

Status: Draft
Spec path: `docs/specs/anonymous-usage-ai-qna-foundation.md`
Accepted by: TBD
Accepted date: TBD

## Goal

Create the foundation for controlled AI Q&A usage without requiring full account authentication.

This spec enables anonymous users to ask limited dashboard questions, allows the backend to enforce quotas, logs Q&A interactions, and prepares the system for future authenticated users and paid tiers.

The current application is a single Next.js app with Prisma/PostgreSQL. Any ask flow should be implemented as a server-side Route Handler in the same app, not as a separate FastAPI service.

## Scope

This spec includes:

* Anonymous session support
* Auth-ready user table
* Usage quota table
* Q&A interaction logging
* Ask endpoint foundation
* Deterministic answer path before LLM use
* LLM service interface stub
* Quota response shape
* Cache/answer-mode fields
* Guardrail-oriented response structure

Required API route:

```http
POST /api/ask
```

Future-compatible route stub:

```http
POST /api/internal/users/sync
```

Required tables:

```text
users
usage_quotas
qa_interactions
```

The ask endpoint must support anonymous users first and authenticated users later.

## Non-Goals

The following are intentionally out of scope:

* Full OAuth implementation
* Google/GitHub sign-in
* Billing integration
* Paid subscriptions
* Real LLM provider calls in the first pass
* Semantic cache implementation beyond schema-ready fields
* User profile management
* Saved locations
* Account settings page

## Acceptance Criteria

* Anonymous user can call `/api/v1/ask` with a city and question.
* Backend resolves an anonymous session identifier.
* Backend enforces anonymous daily quota.
* Backend returns quota remaining.
* Backend logs each Q&A interaction.
* Ask response includes answer, answer mode, used data, confidence, and quota remaining.
* Initial implementation can answer simple seeded-data questions deterministically without calling an LLM.
* Quota-exceeded response is explicit and testable.
* Tables support future authenticated users through nullable `user_id` and `anonymous_session_id` fields.
* No LLM API key is required for initial Q&A foundation tests.

## Constraints

* Do not require account creation for public MVP.
* Do not call an LLM until deterministic Q&A, logging, and quota checks exist.
* Do not expose AI provider keys to the frontend.
* Do not let every user question directly hit an expensive model.
* The server must own quota enforcement.
* The frontend must treat Q&A as a same-app API call only.
* Store enough metadata to audit cost and behavior later.
* Avoid storing raw IP addresses; use hashed or session-based identifiers if IP-related abuse controls are needed.
* AI answers must be grounded in dashboard snapshots once LLM calls are enabled.

## Implementation Notes

Recommended ask flow:

```text
User question
  ↓
Resolve anonymous actor
  ↓
Check quota
  ↓
Load latest dashboard snapshot
  ↓
Classify simple intent
  ↓
Can deterministic backend answer?
  ├─ Yes → deterministic answer
  └─ No → LLM stub or fallback response for now
  ↓
Log qa_interaction
  ↓
Return answer
```

Allowed answer modes:

```text
deterministic
cached_ai
llm
fallback_missing_data
quota_exceeded
```

Recommended request:

```json
{
  "city": "amsterdam",
  "question": "Should I cycle at 17:00?"
}
```

Recommended response:

```json
{
  "answer": "Cycling at 17:00 looks mixed based on the seeded dashboard because the worst outdoor window overlaps with late afternoon conditions.",
  "mode": "deterministic",
  "used_data": [
    "cycle_comfort",
    "worst_outdoor_window"
  ],
  "confidence": "medium",
  "quota_remaining": 2
}
```

Recommended `users` table:

```text
id UUID primary key
external_provider TEXT nullable
external_user_id TEXT nullable unique
email TEXT nullable
name TEXT nullable
tier TEXT not null default 'free'
created_at TIMESTAMPTZ not null
updated_at TIMESTAMPTZ not null
last_seen_at TIMESTAMPTZ nullable
```

Recommended `usage_quotas` table:

```text
id UUID primary key
user_id UUID nullable references users(id)
anonymous_session_id TEXT nullable
period_start TIMESTAMPTZ not null
period_end TIMESTAMPTZ not null
qa_used INTEGER not null default 0
qa_limit INTEGER not null
created_at TIMESTAMPTZ not null
updated_at TIMESTAMPTZ not null
```

Recommended `qa_interactions` table:

```text
id UUID primary key
user_id UUID nullable references users(id)
anonymous_session_id TEXT nullable
city_id UUID not null references cities(id)
dashboard_snapshot_id UUID nullable references dashboard_snapshots(id)
question TEXT not null
normalized_intent TEXT nullable
answer TEXT not null
answer_mode TEXT not null
used_model TEXT nullable
prompt_tokens INTEGER nullable
completion_tokens INTEGER nullable
estimated_cost_usd NUMERIC nullable
cache_hit BOOLEAN not null default false
created_at TIMESTAMPTZ not null
```

Suggested quota defaults:

```text
anonymous: 3 Q&A requests per day
free authenticated: 10 Q&A requests per day
paid placeholder: 100 Q&A requests per day
admin/dev: high cap
```

Suggested environment variables:

```bash
ENABLE_AI_QNA=false
ANON_DAILY_QA_LIMIT=3
FREE_DAILY_QA_LIMIT=10
PAID_DAILY_QA_LIMIT=100
AI_PROVIDER=disabled
AI_MODEL_SMALL=
AI_API_KEY=
```

## Test Expectations

Automated checks:

* Ask endpoint accepts valid anonymous request.
* Ask endpoint rejects invalid city.
* Ask endpoint rejects empty or oversized question.
* Ask endpoint decrements quota or increments usage correctly.
* Ask endpoint returns quota exceeded after configured limit.
* Q&A interaction is logged.
* Deterministic seeded-data answer path works without LLM key.
* Missing dashboard data returns fallback_missing_data mode.

Manual checks:

* User can ask a question from the dashboard UI.
* Quota remaining is visible or available in API response.
* Repeated requests eventually hit quota limit.
* No LLM provider call is made when `ENABLE_AI_QNA=false`.

Not applicable:

* OAuth sign-in tests.
* Billing tier tests.
* Real LLM output quality tests.

## Open Questions

* None.
