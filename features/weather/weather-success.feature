@weather @positive
Feature: Weather Forecast API — Successful Requests
  As a user who selected a city,
  I want to receive a 7-day weather forecast for that location,
  So that the system can rank activities based on weather conditions.

  Background:
    Given the Activity Ranking API is available

  # Validates that a valid coordinate pair returns a 7-day forecast
  @smoke
  Scenario: Valid coordinates return a 7-day weather forecast
    When I request weather data for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the daily data should contain exactly 7 entries
    And the hourly data should contain exactly 168 entries

  # Validates that all expected hourly metric fields are present
  Scenario: Response includes all expected hourly data fields
    When I request weather data for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the hourly data should include fields: time, temperature_2m, precipitation, weathercode, windspeed_10m, cloudcover, snowfall, snow_depth

  # Validates that all expected daily summary fields are present
  Scenario: Response includes all expected daily data fields
    When I request weather data for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the daily data should include fields: time, sunrise, sunset, temperature_2m_max, temperature_2m_min, precipitation_sum

  # Validates timezone, elevation, and geographic metadata are present
  Scenario: Response includes geographic metadata
    When I request weather data for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the response should include timezone information
    And the response should include an elevation value

  # Validates that hourly units describe the correct measurement systems
  Scenario: Hourly units describe correct measurement types
    When I request weather data for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the hourly time unit should be "iso8601"

  # Validates that daily time entries are valid ISO date strings
  Scenario: Daily time entries are valid ISO date strings
    When I request weather data for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And each daily time entry should be a valid date string
