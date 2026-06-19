@weather @negative
Feature: Weather Forecast API — Error Handling and Edge Cases
  As a QA engineer,
  I want to verify the weather API handles missing or invalid parameters correctly,
  So that consumers receive clear error messages.

  Background:
    Given the Activity Ranking API is available

  # Validates that omitting both parameters returns a 400 error
  @edge-case
  Scenario: Missing lat and lon returns 400 error
    When I request weather data without any parameters
    Then the response status should be 400
    And the response error message should be "lat & lon required"

  # Validates error when only longitude is provided
  @edge-case
  Scenario: Missing lat parameter returns error
    When I request weather data with only longitude -46.60972
    Then the response status should be 400

  # Validates error when only latitude is provided
  @edge-case
  Scenario: Missing lon parameter returns error
    When I request weather data with only latitude -20.71889
    Then the response status should be 400
