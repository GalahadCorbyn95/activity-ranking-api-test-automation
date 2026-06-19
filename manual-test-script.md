# Manual Test Script — Activity Ranking API

## Overview

This document provides a step-by-step manual test script to validate the Activity Ranking API feature: **City-Based Weather Forecast Integration with Search Suggestions**. It covers all three endpoints (`/v1/suggest`, `/v1/weather`, `/v1/activities`) across happy paths, error handling, field validation, and edge cases.

## Preconditions

- [ ] API base URL is accessible: `https://ibp62gp1b9.execute-api.us-east-1.amazonaws.com`
- [ ] HTTP client is available (e.g., Postman, cURL, Insomnia, or browser)
- [ ] Network connection is stable
- [ ] Test data prepared: known city names (London, Votuporanga, Tokyo) and coordinates

## Tools Required

| Tool | Purpose |
|------|---------|
| HTTP client (Postman/cURL) | Sending API requests |
| JSON viewer | Inspecting response payloads |
| Timer/Stopwatch | Measuring response times (optional) |

---

## Test Cases — `/v1/suggest` (City Suggestion)

### TC-S01: Valid city name returns suggestions

| Field | Value |
|-------|-------|
| **ID** | TC-S01 |
| **Priority** | High |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/suggest?query=Votuporanga`
2. Observe the HTTP status code
3. Inspect the response body

**Expected Results:**
- Status: `200 OK`
- Response is a JSON array containing at least 1 entry
- First entry `name` is `"Votuporanga"`
- Each entry has fields: `id`, `name`, `country`, `admin1`, `lat`, `lon`, `timezone`

---

### TC-S02: Partial query returns autocomplete suggestions

| Field | Value |
|-------|-------|
| **ID** | TC-S02 |
| **Priority** | High |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/suggest?query=lon`
2. Inspect the response body

**Expected Results:**
- Status: `200 OK`
- Response array contains multiple entries
- At least one entry has `name` equal to `"London"`
- Results include cities from different countries

---

### TC-S03: Empty query returns 400 error

| Field | Value |
|-------|-------|
| **ID** | TC-S03 |
| **Priority** | Medium |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/suggest?query=`
2. Observe the HTTP status code
3. Inspect the error response

**Expected Results:**
- Status: `400 Bad Request`
- Response body: `{"error": "query required"}`

---

### TC-S04: Missing query parameter returns 400 error

| Field | Value |
|-------|-------|
| **ID** | TC-S04 |
| **Priority** | Medium |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/suggest` (no query parameter)
2. Observe the HTTP status code

**Expected Results:**
- Status: `400 Bad Request`
- Response body: `{"error": "query required"}`

---

### TC-S05: Non-existent city returns empty results

| Field | Value |
|-------|-------|
| **ID** | TC-S05 |
| **Priority** | Medium |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/suggest?query=xyznonexistent99`
2. Inspect the response body

**Expected Results:**
- Status: `200 OK`
- Response is an empty array `[]`

---

### TC-S06: Single character query returns empty results

| Field | Value |
|-------|-------|
| **ID** | TC-S06 |
| **Priority** | Low |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/suggest?query=a`
2. Inspect the response body

**Expected Results:**
- Status: `200 OK`
- Response is an empty array `[]`

---

### TC-S07: Special characters in query

| Field | Value |
|-------|-------|
| **ID** | TC-S07 |
| **Priority** | Low |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/suggest?query=!@%23$%25`
2. Observe the response

**Expected Results:**
- Status: `200 OK` (no server error)
- Response is an empty array `[]`
- No 500 error or stack trace

---

## Test Cases — `/v1/weather` (Weather Forecast)

### TC-W01: Valid coordinates return 7-day forecast

| Field | Value |
|-------|-------|
| **ID** | TC-W01 |
| **Priority** | High |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/weather?lat=-20.71889&lon=-46.60972`
2. Inspect the response structure

**Expected Results:**
- Status: `200 OK`
- `daily.time` array has exactly 7 entries
- `hourly.time` array has exactly 168 entries (7 x 24)
- Response includes `timezone`, `elevation`, `hourly_units`, `daily_units`

---

### TC-W02: Hourly data contains all expected fields

| Field | Value |
|-------|-------|
| **ID** | TC-W02 |
| **Priority** | High |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/weather?lat=-20.71889&lon=-46.60972`
2. Inspect `hourly` object keys

**Expected Results:**
- `hourly` contains: `time`, `temperature_2m`, `precipitation`, `weathercode`, `windspeed_10m`, `cloudcover`, `snowfall`, `snow_depth`
- All arrays have 168 entries

---

### TC-W03: Daily data contains all expected fields

| Field | Value |
|-------|-------|
| **ID** | TC-W03 |
| **Priority** | High |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/weather?lat=-20.71889&lon=-46.60972`
2. Inspect `daily` object keys

**Expected Results:**
- `daily` contains: `time`, `sunrise`, `sunset`, `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum`
- All arrays have 7 entries

---

### TC-W04: Missing parameters returns 400 error

| Field | Value |
|-------|-------|
| **ID** | TC-W04 |
| **Priority** | Medium |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/weather` (no parameters)
2. Observe the HTTP status code

**Expected Results:**
- Status: `400 Bad Request`
- Response body: `{"error": "lat & lon required"}`

---

### TC-W05: Missing lat parameter

| Field | Value |
|-------|-------|
| **ID** | TC-W05 |
| **Priority** | Medium |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/weather?lon=-46.60972`

**Expected Results:**
- Status: `400 Bad Request`

---

## Test Cases — `/v1/activities` (Activity Ranking)

### TC-A01: Valid coordinates return 4 activities

| Field | Value |
|-------|-------|
| **ID** | TC-A01 |
| **Priority** | High |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/activities?lat=-20.71889&lon=-46.60972`
2. Inspect the response structure

**Expected Results:**
- Status: `200 OK`
- `activities` array has exactly 4 entries
- Activities are: Skiing, Surfing, Outdoor Sightseeing, Indoor Sightseeing
- Each activity has `activity` (string) and `score` (number 0–1)
- `snapshot` object is present

---

### TC-A02: Scores are within valid range

| Field | Value |
|-------|-------|
| **ID** | TC-A02 |
| **Priority** | High |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/activities?lat=-20.71889&lon=-46.60972`
2. Check each activity's `score` value

**Expected Results:**
- Every `score` is >= 0 and <= 1
- Activities are sorted by `score` descending

---

### TC-A03: Snapshot contains weather summary fields

| Field | Value |
|-------|-------|
| **ID** | TC-A03 |
| **Priority** | Medium |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/activities?lat=-20.71889&lon=-46.60972`
2. Inspect the `snapshot` object

**Expected Results:**
- `snapshot` contains: `avg_temp`, `max_precip`, `total_snowfall`, `avg_cloud`, `max_wind`
- All values are numbers
- `avg_temp` is between -60 and 60
- `max_wind` is >= 0

---

### TC-A04: Missing parameters returns 400 error

| Field | Value |
|-------|-------|
| **ID** | TC-A04 |
| **Priority** | Medium |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/activities` (no parameters)

**Expected Results:**
- Status: `400 Bad Request`
- Response body: `{"error": "lat & lon required"}`

---

### TC-A05: Invalid coordinates return error

| Field | Value |
|-------|-------|
| **ID** | TC-A05 |
| **Priority** | Medium |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/activities?lat=999&lon=999`

**Expected Results:**
- Response body contains `{"error": "activities_failed"}`

---

## Test Cases — Integration (End-to-End)

### TC-E01: Full flow — search city, get weather, get activities

| Field | Value |
|-------|-------|
| **ID** | TC-E01 |
| **Priority** | Critical |
| **Preconditions** | API is accessible |

**Steps:**
1. Send `GET /v1/suggest?query=London`
2. Extract `lat` and `lon` from the first result
3. Send `GET /v1/weather?lat={lat}&lon={lon}` using extracted coordinates
4. Verify weather response has 7 days of data
5. Send `GET /v1/activities?lat={lat}&lon={lon}` using same coordinates
6. Verify activities response has 4 ranked activities

**Expected Results:**
- All three requests return `200 OK`
- Coordinates from suggest are accepted by weather and activities
- Weather returns 7 daily + 168 hourly entries
- Activities returns 4 activities with valid scores

---

## Test Cases — Acceptance Criteria Validation

### TC-AC01: Response should include date, rank, and reasoning

| Field | Value |
|-------|-------|
| **ID** | TC-AC01 |
| **Priority** | Critical |
| **Preconditions** | API is accessible |
| **Expected Outcome** | **FAIL (Known Divergence)** |

**Steps:**
1. Send `GET /v1/activities?lat=-20.71889&lon=-46.60972`
2. Check for `date` field in each activity entry
3. Check for `rank` field (integer 1–10) in each activity entry
4. Check for `reasoning` field (non-empty string) in each activity entry

**Expected Results (per Acceptance Criteria):**
- Each entry has a `date` field with a valid ISO date
- Each entry has a `rank` field with an integer between 1 and 10
- Each entry has a `reasoning` field with a human-readable explanation

**Actual Results:**
- `date` field: **MISSING** — response is aggregated, not per-day
- `rank` field: **MISSING** — uses `score` (float 0–1) instead
- `reasoning` field: **MISSING** — no explanatory text in response

> **QA Finding:** See [Divergence Report](docs/divergence-report.md) for full analysis.

---

### TC-AC02: Response should contain 7 days of rankings

| Field | Value |
|-------|-------|
| **ID** | TC-AC02 |
| **Priority** | Critical |
| **Preconditions** | API is accessible |
| **Expected Outcome** | **FAIL (Known Divergence)** |

**Steps:**
1. Send `GET /v1/activities?lat=-20.71889&lon=-46.60972`
2. Count unique dates in the response

**Expected Results (per Acceptance Criteria):**
- Response contains entries spanning 7 different dates

**Actual Results:**
- Response contains 4 aggregated entries with **no date dimension**

---

## Edge Cases

| ID | Scenario | Endpoint | Expected Behavior |
|----|----------|----------|-------------------|
| EC-01 | Very long query string (500+ chars) | `/v1/suggest` | Returns empty results or 400 (no 500 error) |
| EC-02 | Unicode characters in query (e.g., "München") | `/v1/suggest` | Returns matching results |
| EC-03 | Negative lat/lon values | `/v1/weather` | Returns valid weather data |
| EC-04 | Boundary coordinates (lat=90, lon=180) | `/v1/weather` | Returns data or graceful error |
| EC-05 | Coordinates at 0,0 (Gulf of Guinea) | `/v1/activities` | Returns valid activities |
| EC-06 | Rapid successive requests (rate limiting) | All | Returns consistent responses |
| EC-07 | Response time under high latency | All | Responds within 30 seconds |

---

## QA Findings

### Finding #1: API Response Contract Divergence (Severity: High)

**Summary:** The `/v1/activities` endpoint response does not match the acceptance criteria from the feature ticket.

**Details:**
- The ticket specifies: `date`, `rank (1–10)`, `reasoning` per activity per day
- The API returns: `score (0–1)` per activity (aggregated), with a `snapshot` field not in the spec
- 3 fields are missing from the response
- 1 undocumented field (`snapshot`) is present
- Data granularity differs: ticket expects per-day, API returns aggregated

**Impact:** Frontend cannot display day-by-day recommendations as designed.

**Recommendation:** Implement `/v2/activities` with the corrected contract. See [Proposed Solution](docs/proposed-solution.md).

### Finding #2: Single Character Query Behavior (Severity: Low)

**Summary:** The `/v1/suggest` endpoint returns empty results for single-character queries.

**Details:** Querying with `?query=a` returns `{"value": [], "Count": 0}` instead of an error. This may be intentional (minimum query length) but is not documented.

**Recommendation:** Document the minimum query length requirement in the API specification.

### Finding #3: Undocumented Snapshot Field (Severity: Medium)

**Summary:** The `/v1/activities` response includes a `snapshot` field that is not mentioned in the acceptance criteria.

**Details:** The `snapshot` field contains aggregated weather metrics (`avg_temp`, `max_precip`, `total_snowfall`, `avg_cloud`, `max_wind`). While useful for debugging, its presence was not specified.

**Recommendation:** Either document `snapshot` as part of the API contract or remove it if not intended for consumers.
