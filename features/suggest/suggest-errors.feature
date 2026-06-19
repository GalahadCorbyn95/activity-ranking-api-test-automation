@suggest @negative
Feature: City Suggestion API — Error Handling and Edge Cases
  As a QA engineer,
  I want to verify the API handles invalid inputs gracefully,
  So that the system remains robust under unexpected usage.

  Background:
    Given the Activity Ranking API is available

  # Validates that an empty query parameter returns a 400 error
  @edge-case
  Scenario: Empty query parameter returns 400 error
    When I search for city suggestions with an empty query
    Then the response status should be 400
    And the response error message should be "query required"

  # Validates that omitting the query parameter entirely returns a 400 error
  @edge-case
  Scenario: Missing query parameter returns 400 error
    When I search for city suggestions without query parameter
    Then the response status should be 400
    And the response error message should be "query required"

  # Validates that a gibberish/non-existent city returns an empty result set
  Scenario: Non-existent city returns empty results
    When I search for city suggestions with query "xyznonexistent99"
    Then the response status should be 200
    And the suggestions list should be empty

  # Validates minimum query length behavior (single character returns empty)
  @edge-case
  Scenario: Single character query returns empty results
    When I search for city suggestions with query "a"
    Then the response status should be 200
    And the suggestions list should be empty

  # Validates that special characters do not cause server errors
  @edge-case
  Scenario: Special characters in query are handled gracefully
    When I search for city suggestions with query "!@#$%"
    Then the response status should be 200
    And the suggestions list should be empty
