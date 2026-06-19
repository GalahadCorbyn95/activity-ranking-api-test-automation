@activities @positive
Feature: Activity Ranking API — Successful Requests (Real Behavior)
  As a user viewing activity rankings,
  I want to receive a ranked list of activities based on weather conditions,
  So that I can plan my trip accordingly.

  Note: These tests validate the ACTUAL API behavior (aggregated scores),
  which differs from the acceptance criteria in the feature ticket.
  See docs/divergence-report.md for details.

  Background:
    Given the Activity Ranking API is available

  # Validates that the API returns exactly 4 activity types
  @smoke
  Scenario: Valid coordinates return exactly 4 activities
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the response should contain exactly 4 activities

  # Validates that all expected activity names are present in the response
  Scenario: Activities include all expected types
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the activities should include "Skiing"
    And the activities should include "Surfing"
    And the activities should include "Outdoor Sightseeing"
    And the activities should include "Indoor Sightseeing"

  # Validates that each activity score falls within the valid range
  Scenario: Each activity has a score between 0 and 1
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And each activity score should be between 0 and 1

  # Validates that the snapshot object contains all expected weather summary fields
  Scenario: Response includes snapshot with weather summary fields
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the snapshot should contain avg_temp, max_precip, total_snowfall, avg_cloud, max_wind

  # Validates that activities are returned in descending score order
  Scenario: Activities are sorted by score in descending order
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And activities should be sorted by score in descending order

  # Validates that snapshot temperature values are plausible
  Scenario: Snapshot values are numerically plausible
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the snapshot avg_temp should be between -60 and 60
    And the snapshot max_wind should be a non-negative number
