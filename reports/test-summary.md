# Test Summary Report

**Generated:** 2026-06-19T03:04:20.151Z

## Overall Metrics

| Metric | Value |
|--------|-------|
| Total Scenarios | 40 |
| Passed | 36 |
| Failed | 4 |
| Skipped | 0 |
| Pass Rate | 90.0% |
| Avg Response Time | 235ms |
| Min Response Time | 161ms |
| Max Response Time | 838ms |

## Results by Feature

| Feature | Passed | Failed | Skipped |
|---------|--------|--------|---------|
| Activity Ranking API — Acceptance Criteria Validation | 0 | 4 | 0 |
| Activity Ranking API — Error Handling and Edge Cases | 4 | 0 | 0 |
| Activity Ranking API — Successful Requests (Real Behavior) | 6 | 0 | 0 |
| End-to-End Flow — City Search to Activity Ranking | 2 | 0 | 0 |
| City Suggestion API — Error Handling and Edge Cases | 5 | 0 | 0 |
| City Suggestion API — Successful Requests | 10 | 0 | 0 |
| Weather Forecast API — Error Handling and Edge Cases | 3 | 0 | 0 |
| Weather Forecast API — Successful Requests | 6 | 0 | 0 |

## Known Failures (@known-failure)

These scenarios are **expected to fail** due to divergences between the ticket acceptance criteria and the actual API behavior. See [Divergence Report](../docs/divergence-report.md) for details.

- Response contains entries for each of the 7 forecast days
- Each activity has a rank between 1 and 10
- Each activity includes a reasoning field
- Response includes date field for each activity ranking

---

*Report generated automatically by the test suite.*
