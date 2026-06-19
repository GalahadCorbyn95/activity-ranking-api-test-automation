// ============================================================================
// API Response Interfaces
// These types map the REAL responses returned by the Activity Ranking API.
// ============================================================================

// -- /v1/suggest ---------------------------------------------------------------
// The suggest endpoint returns a plain JSON array of SuggestItem objects.
// PowerShell's Invoke-RestMethod wraps arrays in {value, Count} — Axios does not.

export type SuggestResponse = SuggestItem[];

export interface SuggestItem {
  id: string;
  name: string;
  country: string;
  admin1: string;
  lat: number;
  lon: number;
  timezone: string;
}

// -- /v1/weather ---------------------------------------------------------------

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: HourlyUnits;
  hourly: HourlyData;
  daily_units: DailyUnits;
  daily: DailyData;
}

export interface HourlyUnits {
  time: string;
  temperature_2m: string;
  precipitation: string;
  weathercode: string;
  windspeed_10m: string;
  cloudcover: string;
  snowfall: string;
  snow_depth: string;
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  precipitation: number[];
  weathercode: number[];
  windspeed_10m: number[];
  cloudcover: number[];
  snowfall: number[];
  snow_depth: number[];
}

export interface DailyUnits {
  time: string;
  sunrise: string;
  sunset: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  precipitation_sum: string;
}

export interface DailyData {
  time: string[];
  sunrise: string[];
  sunset: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
}

// -- /v1/activities ------------------------------------------------------------

export interface ActivitiesResponse {
  activities: ActivityItem[];
  snapshot: WeatherSnapshot;
}

export interface ActivityItem {
  activity: string;
  score: number;
}

export interface WeatherSnapshot {
  avg_temp: number;
  max_precip: number;
  total_snowfall: number;
  avg_cloud: number;
  max_wind: number;
}

// -- Expected contract from acceptance criteria (NOT what the API returns) ------
// These interfaces represent what the ticket DESCRIBES but the API does NOT match.

export interface ExpectedActivityRanking {
  date: string;
  activity: string;
  rank: number;
  reasoning: string;
}

export interface ExpectedActivitiesResponse {
  rankings: ExpectedActivityRanking[];
}

// -- Error responses -----------------------------------------------------------

export interface ApiErrorResponse {
  error: string;
}

// -- Test result tracking ------------------------------------------------------

export interface TestResult {
  scenarioName: string;
  featureFile: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  tags: string[];
  errorMessage?: string;
}

export interface TestMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
}

// -- Known activity names (used for validation) --------------------------------

export const EXPECTED_ACTIVITIES = [
  'Skiing',
  'Surfing',
  'Outdoor Sightseeing',
  'Indoor Sightseeing',
] as const;

export type ActivityName = (typeof EXPECTED_ACTIVITIES)[number];
