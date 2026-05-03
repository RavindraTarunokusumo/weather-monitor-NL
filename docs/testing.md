# Testing Guide

## Purpose

Testing includes both execution and planning. Run automated tests and use `test-plan-writer` when meaningful changes need explicit coverage mapping.

## Prerequisites

- activate the project environment
- run commands from repo root
- mock external services
- avoid real credentials in tests

## Test Layout

Planned test groups:

- API tests: dashboard, briefing, Q&A, and source status endpoints
- service tests: scoring, trend, and source freshness behavior
- persistence tests: snapshots, observations, migrations, and station matching
- integration tests: source adapter happy paths and failure paths with mocked network
- frontend tests: dashboard rendering and user flows once frontend exists
- fixtures: normalized city snapshots and source payload examples

## Running Tests

Run all tests:

```bash
pytest
```

Run one file:

```bash
pytest tests/test_example.py
```

Run one test:

```bash
pytest tests/test_example.py::test_name -v
```

Run by keyword:

```bash
pytest -k "keyword"
```

Stop on first failure:

```bash
pytest -x
```

## Validation Workflow

Default sequence before commit:

```bash
ruff check . --fix
ruff format .
pytest
```

Frontend validation once a frontend exists:

```bash
npm run lint
npm test
```

## When To Invoke `test-plan-writer`

Invoke after implementation and before PR-ready when:

- behavior changed
- API changed
- state transitions changed
- persistence changed
- external integrations changed
- acceptance criteria need coverage mapping

Do not invoke for trivial copy, docs-only, or tiny localized edits.

## Test-Plan Output Contract

The test plan should include:

- `VERDICT`
- `MERGE_BLOCKING`
- `FILES`
- `ACCEPTANCE_CRITERIA`
- `REQUIRED_ACTIONS`
- coverage mapping
- explicit test cases
- edge cases
- negative tests
- fixture/setup needs
- out-of-scope items
- open questions

## Coverage Expectations

Meaningful changes should cover:

- happy path
- failure path
- boundary conditions
- state before and after
- persistence effects
- external service mocks
- regression case, if bug fix

## Test Writing Rules

- keep tests deterministic
- isolate state
- mock network and external services
- name tests by behavior
- assert durable outcomes, not implementation trivia
