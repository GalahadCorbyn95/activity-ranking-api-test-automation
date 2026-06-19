# Proposed Solution — `/v2/activities` Endpoint

## Problem Statement

The current `/v1/activities` endpoint returns an aggregated activity ranking that does not meet the acceptance criteria defined in the feature ticket. Key missing elements include per-day granularity, a 1–10 ranking scale, and human-readable reasoning for each ranking.

See the full analysis in [Divergence Report](./divergence-report.md).

## Proposed Approach

Create a **new versioned endpoint** rather than modifying the existing one, ensuring backward compatibility for any systems already consuming `/v1/activities`.

### New Endpoint

```
GET /v2/activities?lat={latitude}&lon={longitude}
```

### Design Rationale

1. **Versioned path** (`/v2/`) avoids breaking existing consumers of `/v1/activities`.
2. The `/v1/weather` endpoint already returns daily data (7 entries), so the new endpoint can process weather day-by-day instead of aggregating.
3. The `score` (0–1) from v1 can be linearly mapped to `rank` (1–10) via `rank = Math.round(score * 9) + 1`.
4. The `reasoning` field can be generated from the daily weather metrics (temperature, precipitation, snowfall, wind, cloud cover) using rule-based templates.

### Expected Response Contract

```json
{
  "location": {
    "latitude": -20.71889,
    "longitude": -46.60972
  },
  "rankings": [
    {
      "date": "2026-06-18",
      "activities": [
        {
          "activity": "Outdoor Sightseeing",
          "rank": 9,
          "reasoning": "Clear skies with max temperature of 22.3°C and no precipitation — excellent conditions for outdoor activities"
        },
        {
          "activity": "Surfing",
          "rank": 3,
          "reasoning": "No significant wave-generating wind (16.7 km/h max) and inland location — poor surfing conditions"
        },
        {
          "activity": "Indoor Sightseeing",
          "rank": 2,
          "reasoning": "Low cloud cover (26%) and pleasant temperatures — outdoor activities preferred over indoor"
        },
        {
          "activity": "Skiing",
          "rank": 1,
          "reasoning": "No snowfall and minimum temperature of 9.9°C — skiing not viable"
        }
      ]
    },
    {
      "date": "2026-06-19",
      "activities": [
        {
          "activity": "Outdoor Sightseeing",
          "rank": 9,
          "reasoning": "Clear skies with max temperature of 22.5°C and no precipitation"
        }
      ]
    }
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

### Key Differences from v1

| Aspect | v1 (Current) | v2 (Proposed) |
|--------|-------------|---------------|
| Structure | Flat array of 4 activities | Nested: 7 days, each with 4 activities |
| Ranking | `score` (float 0–1) | `rank` (integer 1–10) |
| Reasoning | Not present | Required string per activity |
| Date | Not present | ISO date string per day |
| Location | Not present | Echoed back in response |
| Snapshot | Present | Retained for backward compatibility |

### Ranking Algorithm

For each day, use the daily weather data from `/v1/weather` to compute a suitability score per activity:

| Activity | Favorable Conditions | Unfavorable Conditions |
|----------|---------------------|----------------------|
| **Skiing** | High snowfall, low temperature (< 0°C), snow depth > 0 | No snow, warm temperatures |
| **Surfing** | High wind speed (> 20 km/h), moderate temperature, coastal location | Low wind, inland location |
| **Outdoor Sightseeing** | Low precipitation, moderate temperature (15–28°C), low wind, low cloud cover | Rain, extreme temperatures, high wind |
| **Indoor Sightseeing** | High precipitation, extreme temperatures, high cloud cover | Clear skies (inverse of outdoor) |

The raw score (0–1) is then mapped: `rank = Math.round(score * 9) + 1`

### Reasoning Templates

```
Skiing:
  High:  "Snowfall of {X}cm expected with temperatures below 0°C — excellent skiing conditions"
  Low:   "No snowfall and minimum temperature of {X}°C — skiing not viable"

Surfing:
  High:  "Strong winds ({X} km/h) generating good wave conditions"
  Low:   "Low wind speed ({X} km/h) and inland location — poor surfing conditions"

Outdoor Sightseeing:
  High:  "Clear skies with max temperature of {X}°C and no precipitation — excellent for outdoor activities"
  Low:   "Precipitation of {X}mm expected with {Y}% cloud cover — outdoor activities not recommended"

Indoor Sightseeing:
  High:  "Precipitation of {X}mm and {Y}% cloud cover — indoor activities recommended"
  Low:   "Low cloud cover ({X}%) and pleasant temperatures — outdoor activities preferred"
```

### Error Responses

The error contract remains unchanged from v1:

| Scenario | Status | Response |
|----------|--------|----------|
| Missing lat/lon | 400 | `{"error": "lat & lon required"}` |
| Invalid coordinates | 400 | `{"error": "activities_failed"}` |
| Server error | 500 | `{"error": "internal_server_error"}` |

### Migration Path

1. Deploy `/v2/activities` alongside `/v1/activities`.
2. Update frontend to consume `/v2/activities`.
3. Monitor `/v1/activities` usage; deprecate when traffic drops to zero.
4. Eventually sunset `/v1/activities` with a deprecation notice.
