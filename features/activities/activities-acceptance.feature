@activities @acceptance-criteria @known-failure @divergence
Feature: Activity Ranking API — Acceptance Criteria Validation
  As a QA engineer reviewing the feature ticket,
  I want to verify whether the API response matches the acceptance criteria,
  So that any contract divergences are formally identified and documented.

  IMPORTANT: These scenarios test the contract described in the feature ticket.
  The current API implementation does NOT meet these criteria.
  All scenarios in this file are tagged @known-failure and are EXPECTED TO FAIL.
  See docs/divergence-report.md for the full divergence analysis.

  Acceptance Criteria from Ticket:
    - The response includes: Date, Activity name, Rank (1–10), Reasoning
    - It ranks each day for each activity based on weather suitability

  Background:
    Given the Activity Ranking API is available

  # EXPECTED FAIL: The API returns aggregated data, not per-day entries.
  # The ticket requires 7 days of data, but the response has no date field.
  Scenario: Response contains entries for each of the 7 forecast days
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And the response should contain activity entries for 7 days

  # EXPECTED FAIL: The API uses "score" (0–1 float) instead of "rank" (1–10 integer).
  # The acceptance criteria explicitly state Rank (1–10).
  Scenario: Each activity has a rank between 1 and 10
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And each activity should have a "rank" field
    And each activity rank should be an integer between 1 and 10

  # EXPECTED FAIL: The API response does not include a "reasoning" field.
  # The ticket requires explanations like "High snowfall expected" or "Clear skies and 22°C".
  Scenario: Each activity includes a reasoning field
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And each activity should have a "reasoning" field
    And each reasoning should be a non-empty string

  # EXPECTED FAIL: The API has no "date" field — data is aggregated across all 7 days.
  Scenario: Response includes date field for each activity ranking
    When I request activity rankings for latitude -20.71889 and longitude -46.60972
    Then the response status should be 200
    And each activity entry should have a "date" field
    And each date should be a valid ISO date string
