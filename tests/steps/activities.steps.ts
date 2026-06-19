import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';
import { ActivitiesResponse, EXPECTED_ACTIVITIES } from '../support/types';
import { assertActivityItem, assertSnapshot } from '../support/assertions';

// =============================================================================
// WHEN steps — call the /v1/activities endpoint
// =============================================================================

// Calls activities with both valid latitude and longitude
When(
  'I request activity rankings for latitude {float} and longitude {float}',
  async function (this: CustomWorld, lat: number, lon: number) {
    this.response = await this.api.activities(lat, lon);
    this.trackResponseTime('/v1/activities', this.response.responseTime);
  },
);

// Calls activities without any parameters to trigger a 400 error
When(
  'I request activity rankings without any parameters',
  async function (this: CustomWorld) {
    this.response = await this.api.activities(undefined, undefined);
    this.trackResponseTime('/v1/activities', this.response.responseTime);
  },
);

// Calls activities with only longitude (missing lat)
When(
  'I request activity rankings with only longitude {float}',
  async function (this: CustomWorld, lon: number) {
    this.response = await this.api.activities(undefined, lon);
    this.trackResponseTime('/v1/activities', this.response.responseTime);
  },
);

// Calls activities with only latitude (missing lon)
When(
  'I request activity rankings with only latitude {float}',
  async function (this: CustomWorld, lat: number) {
    this.response = await this.api.activities(lat, undefined);
    this.trackResponseTime('/v1/activities', this.response.responseTime);
  },
);

// =============================================================================
// THEN steps — Real API behavior (score-based, aggregated)
// =============================================================================

// Asserts the response contains exactly the expected number of activities
Then(
  'the response should contain exactly {int} activities',
  async function (this: CustomWorld, expectedCount: number) {
    const body: ActivitiesResponse = this.response.body;
    expect(body).to.have.property('activities').that.is.an('array');
    expect(body.activities).to.have.lengthOf(expectedCount);
  },
);

// Asserts a specific activity name exists in the response array
Then(
  'the activities should include {string}',
  async function (this: CustomWorld, activityName: string) {
    const body: ActivitiesResponse = this.response.body;
    const found = body.activities.some((a) => a.activity === activityName);
    expect(found).to.be.true;
  },
);

// Asserts every activity has a valid name and score in 0–1 range
Then(
  'each activity score should be between {int} and {int}',
  async function (this: CustomWorld, _min: number, _max: number) {
    const body: ActivitiesResponse = this.response.body;
    for (const item of body.activities) {
      assertActivityItem(item);
    }
  },
);

// Asserts the snapshot contains all required weather summary fields
Then(
  'the snapshot should contain avg_temp, max_precip, total_snowfall, avg_cloud, max_wind',
  async function (this: CustomWorld) {
    const body: ActivitiesResponse = this.response.body;
    expect(body).to.have.property('snapshot').that.is.an('object');
    assertSnapshot(body.snapshot);
  },
);

// Asserts activities are sorted by score descending (highest score first)
Then(
  'activities should be sorted by score in descending order',
  async function (this: CustomWorld) {
    const body: ActivitiesResponse = this.response.body;
    for (let i = 1; i < body.activities.length; i++) {
      expect(body.activities[i - 1].score).to.be.at.least(
        body.activities[i].score,
        `Activity at index ${i - 1} (score ${body.activities[i - 1].score}) should be >= activity at index ${i} (score ${body.activities[i].score})`,
      );
    }
  },
);

// Asserts the snapshot avg_temp falls within a plausible range
Then(
  'the snapshot avg_temp should be between {int} and {int}',
  async function (this: CustomWorld, min: number, max: number) {
    const body: ActivitiesResponse = this.response.body;
    expect(body.snapshot.avg_temp).to.be.at.least(min).and.at.most(max);
  },
);

// Asserts the snapshot max_wind is zero or positive
Then(
  'the snapshot max_wind should be a non-negative number',
  async function (this: CustomWorld) {
    const body: ActivitiesResponse = this.response.body;
    expect(body.snapshot.max_wind).to.be.a('number').and.to.be.at.least(0);
  },
);

// Asserts the response body has an error field indicating activities failure
Then(
  'the response should indicate an activities failure',
  async function (this: CustomWorld) {
    expect(this.response.body).to.have.property('error');
    expect(this.response.body.error).to.include('activities_failed');
  },
);

// =============================================================================
// THEN steps — Acceptance criteria (EXPECTED TO FAIL — divergence tests)
// These steps verify the contract described in the feature ticket.
// The current API does NOT return these fields, so these WILL FAIL.
// =============================================================================

// EXPECTED FAIL: checks if the response has entries grouped by day
Then(
  'the response should contain activity entries for {int} days',
  async function (this: CustomWorld, expectedDays: number) {
    const body = this.response.body;
    // The ticket expects a structure with per-day rankings.
    // The actual API returns an aggregated list with no date dimension.
    expect(body).to.have.property('rankings').that.is.an('array');
    const uniqueDates = new Set(body.rankings.map((r: any) => r.date));
    expect(uniqueDates.size).to.equal(expectedDays);
  },
);

// EXPECTED FAIL: checks if each activity has a "rank" field (not "score")
Then(
  'each activity should have a {string} field',
  async function (this: CustomWorld, fieldName: string) {
    const body = this.response.body;
    if (body.rankings) {
      for (const entry of body.rankings) {
        expect(entry).to.have.property(fieldName);
      }
    } else if (body.activities) {
      for (const entry of body.activities) {
        expect(entry).to.have.property(fieldName);
      }
    } else {
      expect.fail('Response has neither "rankings" nor "activities" array');
    }
  },
);

// EXPECTED FAIL: checks if rank is an integer in the 1–10 range
Then(
  'each activity rank should be an integer between {int} and {int}',
  async function (this: CustomWorld, min: number, max: number) {
    const body = this.response.body;
    const entries = body.rankings ?? body.activities ?? [];
    for (const entry of entries) {
      expect(entry).to.have.property('rank').that.is.a('number');
      expect(Number.isInteger(entry.rank)).to.be.true;
      expect(entry.rank).to.be.at.least(min).and.at.most(max);
    }
  },
);

// EXPECTED FAIL: checks if each reasoning is a non-empty string
Then(
  'each reasoning should be a non-empty string',
  async function (this: CustomWorld) {
    const body = this.response.body;
    const entries = body.rankings ?? body.activities ?? [];
    for (const entry of entries) {
      expect(entry).to.have.property('reasoning').that.is.a('string').and.is.not.empty;
    }
  },
);

// EXPECTED FAIL: checks if each entry has a "date" field
Then(
  'each activity entry should have a {string} field',
  async function (this: CustomWorld, fieldName: string) {
    const body = this.response.body;
    const entries = body.rankings ?? body.activities ?? [];
    for (const entry of entries) {
      expect(entry).to.have.property(fieldName);
    }
  },
);

// EXPECTED FAIL: checks if each date value is a valid ISO string
Then(
  'each date should be a valid ISO date string',
  async function (this: CustomWorld) {
    const body = this.response.body;
    const entries = body.rankings ?? body.activities ?? [];
    for (const entry of entries) {
      expect(entry).to.have.property('date').that.is.a('string');
      expect(Date.parse(entry.date)).to.not.be.NaN;
    }
  },
);
