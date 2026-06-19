@suggest @positive
Feature: City Suggestion API — Successful Requests
  As a user searching for a city,
  I want to receive autocomplete suggestions as I type,
  So that I can quickly find and select the correct city.

  Background:
    Given the Activity Ranking API is available

  # Validates that an exact city name returns at least one matching suggestion
  @smoke
  Scenario: Search with exact city name returns matching results
    When I search for city suggestions with query "Votuporanga"
    Then the response status should be 200
    And the suggestions list should not be empty
    And at least one suggestion should have the name "Votuporanga"

  # Validates the autocomplete behavior with partial input
  Scenario: Partial query returns autocomplete suggestions
    When I search for city suggestions with query "lon"
    Then the response status should be 200
    And the suggestions list should not be empty
    And at least one suggestion should have the name "London"

  # Validates that every returned suggestion contains all required fields
  Scenario: Each suggestion contains all required fields
    When I search for city suggestions with query "Paris"
    Then the response status should be 200
    And each suggestion should have the fields: id, name, country, admin1, lat, lon, timezone

  # Validates field types and value ranges for coordinate fields
  Scenario: Suggestion coordinates are within valid geographic ranges
    When I search for city suggestions with query "Tokyo"
    Then the response status should be 200
    And each suggestion latitude should be between -90 and 90
    And each suggestion longitude should be between -180 and 180

  # Validates that the response is a non-empty array for a valid query
  Scenario: Valid query returns a non-empty array of suggestions
    When I search for city suggestions with query "New"
    Then the response status should be 200
    And the suggestions list should not be empty

  # Parameterized test to verify multiple well-known cities
  Scenario Outline: Multiple valid cities return results
    When I search for city suggestions with query "<city>"
    Then the response status should be 200
    And the suggestions list should not be empty

    Examples:
      | city       |
      | London     |
      | São Paulo  |
      | New York   |
      | Berlin     |
      | Sydney     |
