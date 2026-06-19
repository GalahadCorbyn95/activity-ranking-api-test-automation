# Technical Documentation — Activity Ranking API

## Architecture Overview

The Activity Ranking API is a serverless application deployed on AWS API Gateway + Lambda. It exposes three REST endpoints that work together to deliver weather-based activity recommendations.

```
Client (Browser/App)
  |
  v
AWS API Gateway (https://ibp62gp1b9.execute-api.us-east-1.amazonaws.com)
  |
  |-- /v1/suggest   -->  Geocoding lookup (Open-Meteo Geocoding API)
  |-- /v1/weather   -->  Weather forecast (Open-Meteo Forecast API)
  |-- /v1/activities -->  Activity ranking engine (internal computation)
```

---

## Endpoint Reference

### `GET /v1/suggest`

Provides city autocomplete suggestions based on a search query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | City/town name (minimum 2 characters for results) |

**Response (200):**

```json
[
  {
    "id": "2643743-51.50853--0.12574",
    "name": "London",
    "country": "GB",
    "admin1": "England",
    "lat": 51.50853,
    "lon": -0.12574,
    "timezone": "Europe/London"
  }
]
```

**Error (400):** `{"error": "query required"}`

**Behavior notes:**
- The response is a plain JSON array (not wrapped in an object)
- Single-character queries return an empty array `[]`
- Non-matching queries return an empty array (not an error)
- Maximum of ~10 results returned per query

---

### `GET /v1/weather`

Returns a 7-day weather forecast including hourly and daily data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | float | Yes | Latitude (-90 to 90) |
| `lon` | float | Yes | Longitude (-180 to 180) |

**Response (200):** See [OpenAPI Spec](./openapi-spec.yaml) for full schema.

Key response characteristics:
- `hourly.time` contains **168 entries** (7 days x 24 hours)
- `daily.time` contains **7 entries**
- Hourly metrics: temperature, precipitation, weathercode, wind speed, cloud cover, snowfall, snow depth
- Daily metrics: sunrise, sunset, temperature max/min, precipitation sum

**Error (400):** `{"error": "lat & lon required"}`

---

### `GET /v1/activities`

Returns aggregated activity rankings based on weather data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | float | Yes | Latitude |
| `lon` | float | Yes | Longitude |

**Response (200):**

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

**Error (400):** `{"error": "lat & lon required"}`  
**Error (4xx/5xx):** `{"error": "activities_failed"}` (invalid coordinates or upstream failure)

---

## Data Flow

```
1. User types "London"
     |
     v
2. GET /v1/suggest?query=London
     |  Returns: [{name: "London", lat: 51.508, lon: -0.125, ...}]
     v
3. User selects "London" from suggestions
     |
     |--- GET /v1/weather?lat=51.508&lon=-0.125
     |      Returns: 7-day hourly + daily weather forecast
     |
     |--- GET /v1/activities?lat=51.508&lon=-0.125
     |      Returns: Aggregated activity scores + weather snapshot
     v
4. Display results to user
```

The `/v1/weather` and `/v1/activities` calls can be made in parallel since they both only depend on the coordinates from the suggest step.

---

## Scoring Algorithm (v1 — observed behavior)

Based on the API responses, the scoring appears to work as follows:

1. Fetch 7-day hourly weather data for the given coordinates
2. Aggregate weather metrics across all 168 hours into a snapshot:
   - `avg_temp`: Average temperature across all hours
   - `max_precip`: Maximum hourly precipitation
   - `total_snowfall`: Sum of all hourly snowfall
   - `avg_cloud`: Average cloud cover percentage
   - `max_wind`: Maximum hourly wind speed
3. Compute a suitability score (0–1) for each activity based on these aggregated metrics
4. Return activities sorted by score (descending)

---

## Proposed v2 Changes

The `/v2/activities` endpoint would process weather data **per day** instead of aggregating:

1. Fetch 7-day daily weather data
2. For each of the 7 days:
   a. Compute per-activity scores using that day's metrics
   b. Map score (0–1) to rank (1–10): `rank = Math.round(score * 9) + 1`
   c. Generate a reasoning string from weather conditions using templates
3. Return a `rankings` array with 7 entries, each containing 4 activity rankings

See [Proposed Solution](./proposed-solution.md) for the full design and [OpenAPI Spec](./openapi-spec.yaml) for the response schema.

---

## Error Handling Patterns

| Scenario | Endpoint | Status | Error Message |
|----------|----------|--------|---------------|
| Missing required parameter | All | 400 | `"query required"` or `"lat & lon required"` |
| Invalid coordinates | `/v1/activities` | 4xx | `"activities_failed"` |
| No matching cities | `/v1/suggest` | 200 | Empty array `[]` |
| Upstream API failure | `/v1/weather`, `/v1/activities` | 5xx | Varies |

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| API Gateway | AWS API Gateway |
| Compute | AWS Lambda (inferred) |
| Weather Data | Open-Meteo API (free, no auth required) |
| Geocoding | Open-Meteo Geocoding API |
