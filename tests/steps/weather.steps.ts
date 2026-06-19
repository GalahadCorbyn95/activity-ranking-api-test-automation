import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';
import { WeatherResponse } from '../support/types';

// =============================================================================
// WHEN steps — call the /v1/weather endpoint
// =============================================================================

// Calls weather with both valid latitude and longitude
When(
  'I request weather data for latitude {float} and longitude {float}',
  async function (this: CustomWorld, lat: number, lon: number) {
    this.response = await this.api.weather(lat, lon);
    this.trackResponseTime('/v1/weather', this.response.responseTime);
  },
);

// Calls weather without any query parameters to trigger a 400 error
When(
  'I request weather data without any parameters',
  async function (this: CustomWorld) {
    this.response = await this.api.weather(undefined, undefined);
    this.trackResponseTime('/v1/weather', this.response.responseTime);
  },
);

// Calls weather with only longitude (missing lat) to test partial params
When(
  'I request weather data with only longitude {float}',
  async function (this: CustomWorld, lon: number) {
    this.response = await this.api.weather(undefined, lon);
    this.trackResponseTime('/v1/weather', this.response.responseTime);
  },
);

// Calls weather with only latitude (missing lon) to test partial params
When(
  'I request weather data with only latitude {float}',
  async function (this: CustomWorld, lat: number) {
    this.response = await this.api.weather(lat, undefined);
    this.trackResponseTime('/v1/weather', this.response.responseTime);
  },
);

// =============================================================================
// THEN steps — assertions on /v1/weather responses
// =============================================================================

// Asserts the daily data array has exactly the expected number of entries (7 days)
Then(
  'the daily data should contain exactly {int} entries',
  async function (this: CustomWorld, expectedCount: number) {
    const body: WeatherResponse = this.response.body;
    expect(body.daily).to.have.property('time').that.is.an('array');
    expect(body.daily.time).to.have.lengthOf(
      expectedCount,
      `Expected ${expectedCount} daily entries but got ${body.daily.time.length}`,
    );
  },
);

// Asserts hourly data has 168 entries (7 days x 24 hours)
Then(
  'the hourly data should contain exactly {int} entries',
  async function (this: CustomWorld, expectedCount: number) {
    const body: WeatherResponse = this.response.body;
    expect(body.hourly).to.have.property('time').that.is.an('array');
    expect(body.hourly.time).to.have.lengthOf(
      expectedCount,
      `Expected ${expectedCount} hourly entries but got ${body.hourly.time.length}`,
    );
  },
);

// Asserts all expected hourly fields are present in the response
Then(
  'the hourly data should include fields: time, temperature_2m, precipitation, weathercode, windspeed_10m, cloudcover, snowfall, snow_depth',
  async function (this: CustomWorld) {
    const body: WeatherResponse = this.response.body;
    const expectedFields = [
      'time', 'temperature_2m', 'precipitation', 'weathercode',
      'windspeed_10m', 'cloudcover', 'snowfall', 'snow_depth',
    ];
    for (const field of expectedFields) {
      expect(body.hourly).to.have.property(field).that.is.an('array').and.is.not.empty;
    }
  },
);

// Asserts all expected daily fields are present in the response
Then(
  'the daily data should include fields: time, sunrise, sunset, temperature_2m_max, temperature_2m_min, precipitation_sum',
  async function (this: CustomWorld) {
    const body: WeatherResponse = this.response.body;
    const expectedFields = [
      'time', 'sunrise', 'sunset', 'temperature_2m_max',
      'temperature_2m_min', 'precipitation_sum',
    ];
    for (const field of expectedFields) {
      expect(body.daily).to.have.property(field).that.is.an('array').and.is.not.empty;
    }
  },
);

// Asserts the response contains timezone metadata
Then(
  'the response should include timezone information',
  async function (this: CustomWorld) {
    const body: WeatherResponse = this.response.body;
    expect(body).to.have.property('timezone').that.is.a('string').and.is.not.empty;
    expect(body).to.have.property('timezone_abbreviation').that.is.a('string').and.is.not.empty;
  },
);

// Asserts the response contains a numeric elevation value
Then(
  'the response should include an elevation value',
  async function (this: CustomWorld) {
    const body: WeatherResponse = this.response.body;
    expect(body).to.have.property('elevation').that.is.a('number');
  },
);

// Asserts the hourly time unit is ISO 8601 format
Then(
  'the hourly time unit should be {string}',
  async function (this: CustomWorld, expectedUnit: string) {
    const body: WeatherResponse = this.response.body;
    expect(body.hourly_units).to.have.property('time', expectedUnit);
  },
);

// Asserts each daily time entry is a parseable date string (YYYY-MM-DD format)
Then(
  'each daily time entry should be a valid date string',
  async function (this: CustomWorld) {
    const body: WeatherResponse = this.response.body;
    for (const dateStr of body.daily.time) {
      const parsed = Date.parse(dateStr);
      expect(parsed).to.not.be.NaN;
    }
  },
);
