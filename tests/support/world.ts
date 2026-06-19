import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { ApiClient, ApiResponse } from './api-client';

/**
 * Custom Cucumber World — shared state available to every step definition.
 *
 * Holds the API client singleton and the last response received,
 * so Given/When steps can call the API and Then steps can assert on the result.
 */
export class CustomWorld extends World {
  public api: ApiClient;
  public response!: ApiResponse;

  /** Coordinates extracted from a suggest result for chained requests */
  public selectedLat!: number;
  public selectedLon!: number;

  /** Collected response times per endpoint (used for report metrics) */
  public responseTimes: { endpoint: string; time: number }[] = [];

  constructor(options: IWorldOptions) {
    super(options);
    this.api = new ApiClient();
  }

  /** Track response time for the metrics report */
  trackResponseTime(endpoint: string, time: number): void {
    this.responseTimes.push({ endpoint, time });
  }
}

setWorldConstructor(CustomWorld);
