import { expect } from 'chai';
import { EXPECTED_ACTIVITIES, ActivityItem, SuggestItem } from './types';

// =============================================================================
// Reusable assertion helpers
// Keep step definitions concise by extracting repetitive checks here.
// =============================================================================

/** Assert that the HTTP status matches the expected code */
export function expectStatus(actual: number, expected: number): void {
  expect(actual).to.equal(expected, `Expected HTTP ${expected} but got ${actual}`);
}

/** Assert that the response body contains an error field with the expected message */
export function expectErrorMessage(body: any, expectedMessage: string): void {
  expect(body).to.have.property('error');
  expect(body.error).to.equal(expectedMessage);
}

/** Assert that a suggest item contains all required fields with correct types */
export function assertSuggestItem(item: SuggestItem): void {
  expect(item).to.have.property('id').that.is.a('string').and.is.not.empty;
  expect(item).to.have.property('name').that.is.a('string').and.is.not.empty;
  expect(item).to.have.property('country').that.is.a('string').and.is.not.empty;
  expect(item).to.have.property('admin1').that.is.a('string');
  expect(item).to.have.property('lat').that.is.a('number');
  expect(item).to.have.property('lon').that.is.a('number');
  expect(item).to.have.property('timezone').that.is.a('string').and.is.not.empty;
}

/** Assert that an activity item has a valid name and a score in the 0–1 range */
export function assertActivityItem(item: ActivityItem): void {
  expect(item).to.have.property('activity').that.is.a('string');
  expect(EXPECTED_ACTIVITIES).to.include(
    item.activity,
    `Unexpected activity name: "${item.activity}"`,
  );
  expect(item).to.have.property('score').that.is.a('number');
  expect(item.score).to.be.at.least(0, 'Score must be >= 0');
  expect(item.score).to.be.at.most(1, 'Score must be <= 1');
}

/** Assert the snapshot object contains all expected weather summary fields */
export function assertSnapshot(snapshot: any): void {
  const requiredFields = ['avg_temp', 'max_precip', 'total_snowfall', 'avg_cloud', 'max_wind'];
  for (const field of requiredFields) {
    expect(snapshot).to.have.property(field).that.is.a('number', `snapshot.${field} must be a number`);
  }
}

/** Assert that an ISO-8601 date string is valid */
export function assertISODate(value: string): void {
  const parsed = Date.parse(value);
  expect(parsed).to.not.be.NaN;
}

/** Assert latitude is within valid range (-90 to 90) */
export function assertLatitude(lat: number): void {
  expect(lat).to.be.at.least(-90).and.at.most(90);
}

/** Assert longitude is within valid range (-180 to 180) */
export function assertLongitude(lon: number): void {
  expect(lon).to.be.at.least(-180).and.at.most(180);
}
