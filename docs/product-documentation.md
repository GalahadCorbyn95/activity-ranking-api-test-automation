# Product Documentation — Activity Ranking API

## Overview

The Activity Ranking API helps travelers decide what activities to do in a given city over the next 7 days. Users search for a city, and the system provides weather-aware activity recommendations ranked by suitability.

### Supported Activities

| Activity | Description |
|----------|-------------|
| **Skiing** | Snow-dependent winter sport; requires snowfall and low temperatures |
| **Surfing** | Ocean/wave-dependent sport; requires wind and suitable coastal conditions |
| **Outdoor Sightseeing** | General outdoor exploration; favored by clear skies, mild temperatures, low wind |
| **Indoor Sightseeing** | Museums, galleries, indoor attractions; recommended when outdoor conditions are poor |

---

## User Flow

### 1. Search for a City

The user begins typing a city or town name into a search box. As they type, the system provides autocomplete suggestions with matching cities worldwide.

**What the user sees:**
- A dropdown of matching city names with country and region information
- Selecting a suggestion automatically triggers the activity ranking

**Example:** Typing "Lon" shows suggestions including "London (England, GB)", "Loni (Uttar Pradesh, IN)", etc.

### 2. View 7-Day Activity Rankings

After selecting a city, the system fetches the 7-day weather forecast for that location and ranks each activity for each day.

**What the user sees for each day:**

| Field | Description |
|-------|-------------|
| **Date** | The forecast date (e.g., "June 18, 2026") |
| **Activity** | One of the four supported activities |
| **Rank** | A score from 1 (worst) to 10 (best) indicating suitability |
| **Reasoning** | A human-readable explanation of why the activity received that rank |

**Example output for a sunny day:**

| Activity | Rank | Reasoning |
|----------|------|-----------|
| Outdoor Sightseeing | 9 | Clear skies with 22°C and no precipitation |
| Indoor Sightseeing | 2 | Weather favors outdoor activities |
| Surfing | 3 | Low wind speed; poor wave conditions |
| Skiing | 1 | No snowfall; temperatures well above freezing |

---

## How Rankings Work

Rankings are calculated from weather data provided by [Open-Meteo](https://open-meteo.com/). The system evaluates the following weather factors for each day:

- **Temperature** (min, max, average)
- **Precipitation** (rain, in mm)
- **Snowfall** (in cm)
- **Cloud cover** (percentage)
- **Wind speed** (in km/h)

Each activity has its own suitability model. For example, skiing ranks highly when snowfall is expected and temperatures are below freezing, while outdoor sightseeing ranks highest on clear, mild days.

---

## Data Sources

| Source | Purpose |
|--------|---------|
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | City search and coordinate lookup |
| [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | 7-day weather forecast data |

---

## Current Status and Known Limitations

> **Important:** The current API implementation (`/v1/activities`) does not fully match this product specification. Specifically:
>
> - Rankings are **aggregated** across all 7 days instead of shown per-day
> - The ranking uses a **score (0–1)** instead of a **rank (1–10)**
> - The **reasoning** field is **not included** in the response
>
> A corrected version (`/v2/activities`) has been proposed to address these gaps. See the [Proposed Solution](./proposed-solution.md) and [Technical Documentation](./technical-documentation.md) for details.

### Limitations

1. **Activity types are fixed** — the system supports only 4 activities and does not allow custom activities.
2. **Weather data is forecast-based** — accuracy decreases for days further in the future.
3. **No user preferences** — the system does not account for personal preferences or skill levels.
4. **Location-agnostic activities** — surfing may be ranked for inland cities where no ocean exists. The ranking reflects weather suitability only, not geographic feasibility.
