# Divergence Report — Activity Ranking API

**Finding ID:** DIV-001  
**Severity:** High  
**Date:** 2026-06-18  
**Reported by:** QA Engineering  
**Status:** Open  

---

## Summary

The `/v1/activities` endpoint response contract **does not match** the acceptance criteria described in the feature ticket. The ticket specifies a per-day ranking structure with fields `date`, `rank (1–10)`, and `reasoning`, but the API returns an aggregated summary with `score (0–1)` and no temporal or explanatory data.

---

## Detailed Comparison

| Aspect | Acceptance Criteria (Ticket) | Actual API Response |
|--------|------------------------------|---------------------|
| **Data granularity** | Per-day (7 separate entries per activity) | Aggregated (single entry per activity) |
| **Ranking field** | `rank` — integer from 1 to 10 | `score` — float from 0 to 1 |
| **Reasoning field** | `reasoning` — human-readable explanation (e.g., "High snowfall expected") | **Not present** |
| **Date field** | `date` — one entry per forecast day | **Not present** |
| **Snapshot field** | Not mentioned in acceptance criteria | Present — contains `avg_temp`, `max_precip`, `total_snowfall`, `avg_cloud`, `max_wind` |
| **Expected entries** | 28 entries (7 days x 4 activities) | 4 entries (one per activity, aggregated) |

---

## Evidence

### Expected Response (per Acceptance Criteria)

```json
{
  "rankings": [
    {
      "date": "2026-06-18",
      "activity": "Outdoor Sightseeing",
      "rank": 9,
      "reasoning": "Clear skies with 22°C and low wind — ideal for outdoor activities"
    },
    {
      "date": "2026-06-18",
      "activity": "Skiing",
      "rank": 1,
      "reasoning": "No snowfall and warm temperatures — not suitable for skiing"
    }
  ]
}
```

### Actual Response (from API)

```json
{
  "activities": [
    { "activity": "Outdoor Sightseeing", "score": 0.9475 },
    { "activity": "Indoor Sightseeing", "score": 0.0524 },
    { "activity": "Surfing", "score": 0.0498 },
    { "activity": "Skiing", "score": 0 }
  ],
  "snapshot": {
    "avg_temp": 16.965,
    "max_precip": 0,
    "total_snowfall": 0,
    "avg_cloud": 26.236,
    "max_wind": 16.7
  }
}
```

---

## Impact Analysis

1. **User Experience:** Users cannot see day-by-day recommendations, reducing the feature's utility for trip planning.
2. **Decision Transparency:** Without a `reasoning` field, users have no insight into why an activity was ranked higher or lower.
3. **Data Loss:** Aggregating across 7 days loses granularity — a single rainy day in a week of sunshine affects the overall score without visibility.
4. **Frontend Integration:** Any frontend consuming this API expecting the ticket's contract will break or display incomplete data.

---

## Affected Tests

The following automated scenarios (tagged `@known-failure`) document this divergence:

| Scenario | Expected Behavior | Actual Behavior |
|----------|-------------------|-----------------|
| Response contains entries for each of the 7 forecast days | `rankings` array with 7 unique dates | `activities` array with no date field |
| Each activity has a rank between 1 and 10 | `rank` field (integer 1–10) | `score` field (float 0–1) |
| Each activity includes a reasoning field | `reasoning` field with text | Field does not exist |
| Response includes date field for each activity ranking | `date` field per entry | Field does not exist |

---

## Root Cause Hypothesis

The `/v1/activities` endpoint appears to aggregate the 7-day weather data (via the `/v1/weather` endpoint) into a single summary before computing activity scores. This produces a valid but simplified output that does not satisfy the ticket's requirement for daily granularity and human-readable explanations.

It is possible that:
- The implementation was built as an MVP with aggregation, and the per-day breakdown was deferred.
- The acceptance criteria were updated after the implementation was completed, creating a spec-vs-code drift.
- The `snapshot` field was added as a debugging/diagnostic tool but was not part of the original specification.

---

## Recommendation

Implement a new versioned endpoint (`/v2/activities`) that returns per-day activity rankings matching the acceptance criteria, while keeping `/v1/activities` available for backward compatibility. See [Proposed Solution](./proposed-solution.md) for the detailed design.
