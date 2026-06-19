import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';
import { SuggestResponse } from '../support/types';

// =============================================================================
// Integration steps — chain suggest → weather → activities
// These steps use stored coordinates to simulate the real user flow:
//   1. Search for a city
//   2. Pick the first suggestion
//   3. Use its lat/lon for weather and activities
// =============================================================================

// Extracts lat/lon from the first suggestion and stores them in World state
When(
  'I select the first suggestion and store its coordinates',
  async function (this: CustomWorld) {
    const body: SuggestResponse = this.response.body;
    expect(body).to.be.an('array').that.is.not.empty;

    const first = body[0];
    this.selectedLat = first.lat;
    this.selectedLon = first.lon;
  },
);

// Calls the weather endpoint using previously stored coordinates
When(
  'I request weather data using the stored coordinates',
  async function (this: CustomWorld) {
    expect(this.selectedLat).to.be.a('number', 'No stored latitude — did you select a suggestion first?');
    expect(this.selectedLon).to.be.a('number', 'No stored longitude — did you select a suggestion first?');

    this.response = await this.api.weather(this.selectedLat, this.selectedLon);
    this.trackResponseTime('/v1/weather', this.response.responseTime);
  },
);

// Calls the activities endpoint using previously stored coordinates
When(
  'I request activity rankings using the stored coordinates',
  async function (this: CustomWorld) {
    expect(this.selectedLat).to.be.a('number', 'No stored latitude — did you select a suggestion first?');
    expect(this.selectedLon).to.be.a('number', 'No stored longitude — did you select a suggestion first?');

    this.response = await this.api.activities(this.selectedLat, this.selectedLon);
    this.trackResponseTime('/v1/activities', this.response.responseTime);
  },
);

// Asserts the stored latitude is within the valid geographic range
Then(
  'the stored latitude should be between {int} and {int}',
  async function (this: CustomWorld, min: number, max: number) {
    expect(this.selectedLat).to.be.at.least(min).and.at.most(max);
  },
);

// Asserts the stored longitude is within the valid geographic range
Then(
  'the stored longitude should be between {int} and {int}',
  async function (this: CustomWorld, min: number, max: number) {
    expect(this.selectedLon).to.be.at.least(min).and.at.most(max);
  },
);
