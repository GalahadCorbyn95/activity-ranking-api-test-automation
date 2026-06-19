@integration @e2e
Feature: End-to-End Flow — City Search to Activity Ranking
  As a user of the Activity Ranking system,
  I want to search for a city, get its weather, and see ranked activities,
  So that the full user journey works seamlessly from search to results.

  Background:
    Given the Activity Ranking API is available

  # Validates the complete happy path: suggest → weather → activities
  @smoke
  Scenario: Full flow from city search to activity ranking
    When I search for city suggestions with query "London"
    Then the response status should be 200
    And the suggestions list should not be empty
    When I select the first suggestion and store its coordinates
    And I request weather data using the stored coordinates
    Then the response status should be 200
    And the daily data should contain exactly 7 entries
    When I request activity rankings using the stored coordinates
    Then the response status should be 200
    And the response should contain exactly 4 activities

  # Validates that coordinates from suggest are accepted by weather and activities
  Scenario: Suggest result coordinates are valid for downstream APIs
    When I search for city suggestions with query "Berlin"
    And I select the first suggestion and store its coordinates
    Then the stored latitude should be between -90 and 90
    And the stored longitude should be between -180 and 180
    When I request weather data using the stored coordinates
    Then the response status should be 200
    When I request activity rankings using the stored coordinates
    Then the response status should be 200
