# System Flowchart — Activity Ranking API

## 1. Current System Architecture

```mermaid
flowchart TB
  subgraph client [Client Layer]
    User[User]
    SearchBox[Search Box]
  end

  subgraph apiGateway [AWS API Gateway]
    SuggestEndpoint["/v1/suggest"]
    WeatherEndpoint["/v1/weather"]
    ActivitiesEndpoint["/v1/activities"]
  end

  subgraph external [External Services]
    GeocodingAPI["Open-Meteo Geocoding API"]
    ForecastAPI["Open-Meteo Forecast API"]
  end

  User -->|"types city name"| SearchBox
  SearchBox -->|"GET /v1/suggest?query=..."| SuggestEndpoint
  SuggestEndpoint -->|"geocoding lookup"| GeocodingAPI
  GeocodingAPI -->|"city suggestions with lat/lon"| SuggestEndpoint
  SuggestEndpoint -->|"suggestions list"| SearchBox

  SearchBox -->|"user selects city"| User
  User -->|"GET /v1/weather?lat=...&lon=..."| WeatherEndpoint
  User -->|"GET /v1/activities?lat=...&lon=..."| ActivitiesEndpoint

  WeatherEndpoint -->|"fetch forecast"| ForecastAPI
  ForecastAPI -->|"7-day hourly + daily data"| WeatherEndpoint
  WeatherEndpoint -->|"weather response"| User

  ActivitiesEndpoint -->|"fetch forecast"| ForecastAPI
  ForecastAPI -->|"weather data"| ActivitiesEndpoint
  ActivitiesEndpoint -->|"aggregated scores + snapshot"| User
```

## 2. Data Flow per Request

```mermaid
sequenceDiagram
  participant U as User
  participant S as /v1/suggest
  participant W as /v1/weather
  participant A as /v1/activities
  participant OM as Open-Meteo

  U->>S: GET /v1/suggest?query=London
  S->>OM: Geocoding lookup
  OM-->>S: City matches with coordinates
  S-->>U: Suggestions (name, lat, lon, country...)

  U->>U: Select "London" (lat=51.508, lon=-0.125)

  par Parallel requests
    U->>W: GET /v1/weather?lat=51.508&lon=-0.125
    W->>OM: Forecast request
    OM-->>W: 7-day hourly + daily data
    W-->>U: Weather response (168 hourly + 7 daily entries)
  and
    U->>A: GET /v1/activities?lat=51.508&lon=-0.125
    A->>OM: Forecast request
    OM-->>A: Weather data
    A->>A: Aggregate & compute scores
    A-->>U: Activities (4 scores + snapshot)
  end
```

## 3. Test Coverage Map

This diagram shows which test suites cover which parts of the system.

```mermaid
flowchart TB
  subgraph tests [Test Suites]
    SuggestTests["Suggest Tests\n@suggest"]
    WeatherTests["Weather Tests\n@weather"]
    ActivitiesTests["Activities Tests\n@activities @positive"]
    AcceptanceTests["Acceptance Criteria Tests\n@known-failure @divergence"]
    IntegrationTests["E2E Integration Tests\n@integration"]
  end

  subgraph endpoints [API Endpoints]
    SuggestAPI["/v1/suggest"]
    WeatherAPI["/v1/weather"]
    ActivitiesAPI["/v1/activities"]
  end

  subgraph coverage [What Each Suite Validates]
    SuggestCoverage["Field validation\nAutocomplete behavior\nError handling\nEmpty/invalid queries"]
    WeatherCoverage["7-day data structure\n168 hourly entries\nField presence\nError handling"]
    ActivitiesCoverage["4 activities present\nScore range 0-1\nSnapshot fields\nSort order\nError handling"]
    AcceptanceCoverage["date field - MISSING\nrank 1-10 - MISSING\nreasoning - MISSING\n7-day granularity - MISSING"]
    IntegrationCoverage["Suggest to Weather\nSuggest to Activities\nCoordinate consistency\nFull user flow"]
  end

  SuggestTests --> SuggestAPI
  SuggestTests --> SuggestCoverage

  WeatherTests --> WeatherAPI
  WeatherTests --> WeatherCoverage

  ActivitiesTests --> ActivitiesAPI
  ActivitiesTests --> ActivitiesCoverage

  AcceptanceTests --> ActivitiesAPI
  AcceptanceTests --> AcceptanceCoverage

  IntegrationTests --> SuggestAPI
  IntegrationTests --> WeatherAPI
  IntegrationTests --> ActivitiesAPI
  IntegrationTests --> IntegrationCoverage
```

## 4. Proposed v2 Architecture Change

```mermaid
flowchart LR
  subgraph current [Current - v1]
    WeatherData1["7-day hourly data"]
    Aggregator["Aggregate all days"]
    ScoreCalc1["Compute scores 0-1"]
    V1Response["4 activities + snapshot"]

    WeatherData1 --> Aggregator --> ScoreCalc1 --> V1Response
  end

  subgraph proposed [Proposed - v2]
    WeatherData2["7-day daily data"]
    DayLoop["Process each day"]
    ScoreCalc2["Compute score per day"]
    RankMap["Map score to rank 1-10"]
    ReasonGen["Generate reasoning text"]
    V2Response["7 days x 4 activities\nwith rank + reasoning"]

    WeatherData2 --> DayLoop --> ScoreCalc2 --> RankMap --> ReasonGen --> V2Response
  end
```

## 5. Error Handling Flowchart

```mermaid
flowchart TD
  Request["Incoming API Request"]

  Request --> CheckParams{"Required\nparams present?"}
  CheckParams -->|No| Return400["400: parameter required"]
  CheckParams -->|Yes| ValidateParams{"Parameters\nvalid?"}

  ValidateParams -->|No - suggest| ReturnEmpty["200: empty results"]
  ValidateParams -->|"No - weather/activities"| ReturnError["4xx: error message"]
  ValidateParams -->|Yes| CallOpenMeteo["Call Open-Meteo API"]

  CallOpenMeteo --> OpenMeteoOk{"Open-Meteo\nresponse OK?"}
  OpenMeteoOk -->|No| Return500["5xx: upstream failure"]
  OpenMeteoOk -->|Yes| ProcessData["Process & return data"]
  ProcessData --> Return200["200: success response"]
```
