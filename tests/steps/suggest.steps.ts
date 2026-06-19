import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';
import {
  expectStatus,
  expectErrorMessage,
  assertSuggestItem,
  assertLatitude,
  assertLongitude,
} from '../support/assertions';
import { SuggestResponse } from '../support/types';

// =============================================================================
// Shared step: confirms the API is reachable (used across all feature files)
// =============================================================================

Given('the Activity Ranking API is available', async function (this: CustomWorld) {
  // No-op: the API is a public AWS endpoint. If it's down, individual
  // requests will fail with clear errors. This step exists for Gherkin
  // readability and could be extended with a health-check call if needed.
});

// =============================================================================
// WHEN steps — call the /v1/suggest endpoint with various inputs
// =============================================================================

// Calls suggest with a provided query string (happy path and edge cases)
When(
  'I search for city suggestions with query {string}',
  async function (this: CustomWorld, query: string) {
    this.response = await this.api.suggest(query);
    this.trackResponseTime('/v1/suggest', this.response.responseTime);
  },
);

// Calls suggest with an explicitly empty query parameter (?query=)
When(
  'I search for city suggestions with an empty query',
  async function (this: CustomWorld) {
    this.response = await this.api.suggest('');
    this.trackResponseTime('/v1/suggest', this.response.responseTime);
  },
);

// Calls suggest without the query parameter at all
When(
  'I search for city suggestions without query parameter',
  async function (this: CustomWorld) {
    this.response = await this.api.suggest(undefined);
    this.trackResponseTime('/v1/suggest', this.response.responseTime);
  },
);

// =============================================================================
// THEN steps — assertions on /v1/suggest responses
// The suggest API returns a plain JSON array (not wrapped in {value, Count}).
// =============================================================================

// Asserts the HTTP status code matches the expected value
Then(
  'the response status should be {int}',
  async function (this: CustomWorld, expectedStatus: number) {
    expectStatus(this.response.status, expectedStatus);
  },
);

// Asserts the suggestions array is not empty
Then(
  'the suggestions list should not be empty',
  async function (this: CustomWorld) {
    const body: SuggestResponse = this.response.body;
    expect(body).to.be.an('array').that.is.not.empty;
  },
);

// Asserts the suggestions array is empty
Then(
  'the suggestions list should be empty',
  async function (this: CustomWorld) {
    const body: SuggestResponse = this.response.body;
    expect(body).to.be.an('array').that.is.empty;
  },
);

// Asserts the array length matches the expected count
Then(
  'the suggestions count should be {int}',
  async function (this: CustomWorld, expectedCount: number) {
    const body: SuggestResponse = this.response.body;
    expect(body).to.have.lengthOf(expectedCount);
  },
);

// Asserts at least one suggestion has the expected city name
Then(
  'at least one suggestion should have the name {string}',
  async function (this: CustomWorld, expectedName: string) {
    const body: SuggestResponse = this.response.body;
    const match = body.some(
      (item) => item.name.toLowerCase() === expectedName.toLowerCase(),
    );
    expect(match).to.be.true;
  },
);

// Asserts every suggestion object contains the required fields with valid types
Then(
  'each suggestion should have the fields: id, name, country, admin1, lat, lon, timezone',
  async function (this: CustomWorld) {
    const body: SuggestResponse = this.response.body;
    for (const item of body) {
      assertSuggestItem(item);
    }
  },
);

// Asserts all latitude values are geographically valid
Then(
  'each suggestion latitude should be between {int} and {int}',
  async function (this: CustomWorld, _min: number, _max: number) {
    const body: SuggestResponse = this.response.body;
    for (const item of body) {
      assertLatitude(item.lat);
    }
  },
);

// Asserts all longitude values are geographically valid
Then(
  'each suggestion longitude should be between {int} and {int}',
  async function (this: CustomWorld, _min: number, _max: number) {
    const body: SuggestResponse = this.response.body;
    for (const item of body) {
      assertLongitude(item.lon);
    }
  },
);

// Asserts the error field in the response body matches the expected message
Then(
  'the response error message should be {string}',
  async function (this: CustomWorld, expectedMessage: string) {
    expectErrorMessage(this.response.body, expectedMessage);
  },
);
