@activities @negative
Feature: Activity Ranking API — Error Handling and Edge Cases
  As a QA engineer,
  I want to verify the activities API handles invalid inputs correctly,
  So that consumers receive meaningful error responses.

  Background:
    Given the Activity Ranking API is available

  # Validates that omitting both parameters returns a 400 error
  @edge-case
  Scenario: Missing lat and lon returns 400 error
    When I request activity rankings without any parameters
    Then the response status should be 400
    And the response error message should be "lat & lon required"

  # Validates error handling for geographically impossible coordinates
  @edge-case
  Scenario: Invalid coordinates return an error
    When I request activity rankings for latitude 999.0 and longitude 999.0
    Then the response should indicate an activities failure

  # Validates error when only longitude is provided
  @edge-case
  Scenario: Missing lat parameter returns error
    When I request activity rankings with only longitude -46.60972
    Then the response status should be 400

  # Validates error when only latitude is provided
  @edge-case
  Scenario: Missing lon parameter returns error
    When I request activity rankings with only latitude -20.71889
    Then the response status should be 400
