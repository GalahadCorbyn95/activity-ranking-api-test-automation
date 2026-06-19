# Activity Ranking API — Test Automation

Automated QA test suite for the **Activity Ranking API**, a service that provides weather-based activity recommendations for cities worldwide. Built with **TypeScript**, **Cucumber.js (BDD)**, **Axios**, and **Chai**.

---

## Project Overview

This project delivers a complete QA solution for the Activity Ranking API challenge:

- **8 BDD feature files** covering 3 API endpoints + integration flows
- **30+ automated scenarios** organized by endpoint and test type
- **Manual test script** with step-by-step instructions and QA findings
- **Divergence analysis** documenting contract mismatches between ticket and API
- **Proposed solution** with OpenAPI spec for a corrected `/v2/activities` endpoint
- **Auto-generated reports** (HTML + Markdown) with pass/fail metrics

### Endpoints Under Test

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/suggest?query={text}` | City autocomplete suggestions |
| `GET /v1/weather?lat={lat}&lon={lon}` | 7-day weather forecast |
| `GET /v1/activities?lat={lat}&lon={lon}` | Activity rankings by weather suitability |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- Internet connection (tests run against live AWS API endpoints)

### Installation

```bash
git clone git@github.com:GalahadCorbyn95/activity-ranking-api-test-automation.git
cd activity-ranking-api-test-automation
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests by endpoint
npm run test:suggest
npm run test:weather
npm run test:activities

# Run integration/e2e tests
npm run test:integration

# Run smoke tests only
npm run test:smoke

# Run known-failure (divergence) tests only
npm run test:known-failures

# Run tests and generate HTML report
npm run test:report
```

### Reports

After running tests, reports are generated in the `reports/` directory:

- **`reports/cucumber-report.json`** — Raw Cucumber JSON output
- **`reports/index.html`** — Interactive HTML report with charts and metrics
- **`reports/test-summary.md`** — Markdown summary with pass/fail breakdown

---

## Project Structure

```
activity-ranking-api-test-automation/
|-- README.md                            # This file
|-- package.json                         # Dependencies and scripts
|-- tsconfig.json                        # TypeScript configuration
|-- cucumber.js                          # Cucumber runner configuration
|-- .env                                 # API base URL and settings
|-- manual-test-script.md               # Step-by-step manual test script
|
|-- features/                            # BDD scenarios (Gherkin)
|   |-- suggest/
|   |   |-- suggest-success.feature      # Happy path: autocomplete, field validation
|   |   |-- suggest-errors.feature       # Error handling: empty query, missing params
|   |-- weather/
|   |   |-- weather-success.feature      # Happy path: 7-day forecast, field presence
|   |   |-- weather-errors.feature       # Error handling: missing coordinates
|   |-- activities/
|   |   |-- activities-success.feature   # Real behavior: scores, snapshot, sorting
|   |   |-- activities-errors.feature    # Error handling: invalid coords, missing params
|   |   |-- activities-acceptance.feature # Acceptance criteria (EXPECTED TO FAIL)
|   |-- integration/
|       |-- end-to-end-flow.feature      # Full flow: suggest -> weather -> activities
|
|-- tests/                               # Test implementation
|   |-- steps/                           # Cucumber step definitions
|   |   |-- suggest.steps.ts
|   |   |-- weather.steps.ts
|   |   |-- activities.steps.ts
|   |   |-- integration.steps.ts
|   |-- support/                         # Shared utilities
|       |-- api-client.ts               # HTTP client with timing
|       |-- assertions.ts               # Reusable assertion helpers
|       |-- hooks.ts                    # Before/After lifecycle hooks
|       |-- report-generator.ts         # HTML + Markdown report generation
|       |-- types.ts                    # TypeScript interfaces
|       |-- world.ts                    # Cucumber World (shared state)
|
|-- docs/                                # Documentation
|   |-- divergence-report.md             # QA findings: ticket vs. real API
|   |-- proposed-solution.md             # /v2/activities endpoint proposal
|   |-- openapi-spec.yaml               # OpenAPI 3.0 spec (v1 + proposed v2)
|   |-- product-documentation.md         # Product-level feature description
|   |-- technical-documentation.md       # Technical architecture and reference
|   |-- system-flowchart.md             # Mermaid diagrams of system flow
|
|-- reports/                             # Auto-generated test reports
```

---

## Test Strategy

The test suite uses a **two-layer approach**:

### Layer 1 — Acceptance Criteria Tests (`@known-failure`)

These scenarios test exactly what the feature ticket describes. They validate the **expected contract** as written in the acceptance criteria:

- Response includes `date`, `rank (1–10)`, and `reasoning` per activity per day
- Response contains 7 days of data

**These tests are expected to FAIL.** The current API does not match the ticket's contract. This is intentional — it formally documents the divergence between specification and implementation.

### Layer 2 — Real API Behavior Tests (`@positive`, `@negative`, `@edge-case`)

These scenarios validate what the API **actually does**:

- Aggregated `score` (0–1) per activity
- `snapshot` with weather summary
- Error handling for missing/invalid parameters
- End-to-end integration flow

**These tests should all PASS.**

### Tags Reference

| Tag | Description | Expected Result |
|-----|-------------|-----------------|
| `@smoke` | Critical happy-path scenarios | Pass |
| `@positive` | All successful request scenarios | Pass |
| `@negative` | Error handling and invalid inputs | Pass |
| `@edge-case` | Boundary and unusual inputs | Pass |
| `@integration` / `@e2e` | Cross-endpoint flows | Pass |
| `@known-failure` | Acceptance criteria divergence tests | **Fail** |
| `@divergence` | Tests documenting spec vs. implementation gaps | **Fail** |
| `@suggest` / `@weather` / `@activities` | Endpoint-specific filters | Mixed |

---

## Important: Known Failures

> **Some tests in this suite are designed to fail.**
>
> The scenarios tagged `@known-failure` in `features/activities/activities-acceptance.feature` validate the acceptance criteria as written in the feature ticket. The current `/v1/activities` API does not return `date`, `rank (1–10)`, or `reasoning` fields — it returns aggregated `score (0–1)` values instead.
>
> These failures are **documented findings**, not bugs in the test code. They demonstrate that the API implementation diverges from the specification.
>
> For the full analysis, see [`docs/divergence-report.md`](docs/divergence-report.md).
> For the proposed fix, see [`docs/proposed-solution.md`](docs/proposed-solution.md).

---

## Documentation

| Document | Description |
|----------|-------------|
| [`manual-test-script.md`](manual-test-script.md) | Step-by-step manual testing guide with QA findings |
| [`docs/divergence-report.md`](docs/divergence-report.md) | Formal divergence analysis between ticket and API |
| [`docs/proposed-solution.md`](docs/proposed-solution.md) | Proposed `/v2/activities` endpoint design |
| [`docs/openapi-spec.yaml`](docs/openapi-spec.yaml) | OpenAPI 3.0 spec (current v1 + proposed v2) |
| [`docs/product-documentation.md`](docs/product-documentation.md) | Product-level feature description |
| [`docs/technical-documentation.md`](docs/technical-documentation.md) | Technical architecture and API reference |
| [`docs/system-flowchart.md`](docs/system-flowchart.md) | Mermaid diagrams: system flow and test coverage |

---

## How AI Assisted

AI tools (Cursor with Claude) were used throughout this project as a **development accelerator**, with human judgment applied at every step:

### What AI Helped With

- **API exploration**: Generating HTTP requests to discover real API response structures
- **Scaffolding**: Creating the initial project structure, config files, and boilerplate
- **Code generation**: Drafting step definitions, feature files, and support utilities
- **Documentation**: Generating first drafts of reports, specs, and technical docs
- **Pattern application**: Applying BDD best practices and Cucumber conventions consistently

### Where Human Judgment Was Applied

- **Divergence discovery**: The mismatch between ticket acceptance criteria and actual API behavior was identified through manual API exploration and critical analysis of the responses
- **Test strategy design**: The two-layer approach (acceptance criteria vs. real behavior) was a deliberate QA decision to maximize the finding's impact
- **Scenario selection**: Deciding which edge cases matter, which scenarios to prioritize, and how to tag them for different execution profiles
- **Solution design**: The `/v2/activities` proposal, including the ranking algorithm and reasoning templates, required domain reasoning beyond code generation
- **Quality review**: All generated code was reviewed, tested, and refined for correctness, readability, and maintainability

---

## Omissions and Trade-offs

### Intentional Omissions

1. **No authentication testing** — the API is publicly accessible with no auth layer
2. **No load/performance testing** — out of scope for this challenge; would use k6 or Artillery
3. **No UI testing** — the challenge focuses on API testing; no frontend was provided
4. **No contract testing (Pact)** — would be valuable in a real project but adds complexity beyond the scope

### Trade-offs

1. **Live API dependency** — tests run against the real AWS endpoints. This provides realistic results but means tests can fail if the API is down. A mock server could be added for offline testing.
2. **Response time variability** — API response times depend on network conditions and AWS Lambda cold starts. Response time assertions are intentionally generous (30s timeout).
3. **Single-character query behavior** — the API returns empty results for single-character queries. This is tested but may be intentional behavior rather than a bug.
4. **Coordinate validation** — the `/v1/weather` endpoint does not appear to reject out-of-range coordinates (it proxies to Open-Meteo which handles this). We test what we observe.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | ^5.5 | Type-safe test code |
| Cucumber.js | ^11.0 | BDD test runner |
| Axios | ^1.7 | HTTP client |
| Chai | ^4.4 | Assertion library |
| ts-node | ^10.9 | TypeScript execution |
| multiple-cucumber-html-reporter | ^3.7 | HTML report generation |
| dotenv | ^16.4 | Environment configuration |
