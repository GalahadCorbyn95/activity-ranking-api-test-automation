import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Wraps the raw Axios response with timing metadata so every step
 * definition can assert on status, body, AND latency in a uniform way.
 */
export interface ApiResponse<T = any> {
  status: number;
  body: T;
  responseTime: number;
  headers: Record<string, string>;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.BASE_URL;
    const timeout = Number(process.env.REQUEST_TIMEOUT_MS) || 30_000;

    if (!baseURL) {
      throw new Error('BASE_URL is not set. Check your .env file.');
    }

    this.client = axios.create({
      baseURL,
      timeout,
      validateStatus: () => true, // never throw on HTTP status — let tests assert
    });
  }

  // -- /v1/suggest -------------------------------------------------------------

  async suggest(query?: string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (query !== undefined) params.query = query;
    return this.get('/v1/suggest', params);
  }

  // -- /v1/weather -------------------------------------------------------------

  async weather(lat?: number | string, lon?: number | string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (lat !== undefined) params.lat = String(lat);
    if (lon !== undefined) params.lon = String(lon);
    return this.get('/v1/weather', params);
  }

  // -- /v1/activities ----------------------------------------------------------

  async activities(lat?: number | string, lon?: number | string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (lat !== undefined) params.lat = String(lat);
    if (lon !== undefined) params.lon = String(lon);
    return this.get('/v1/activities', params);
  }

  // -- Generic GET helper ------------------------------------------------------

  private async get(path: string, params: Record<string, string>): Promise<ApiResponse> {
    const start = Date.now();

    try {
      const response: AxiosResponse = await this.client.get(path, { params });
      const responseTime = Date.now() - start;

      return {
        status: response.status,
        body: response.data,
        responseTime,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      const axiosErr = error as AxiosError;

      // Network-level failures (timeout, DNS, etc.)
      return {
        status: axiosErr.response?.status ?? 0,
        body: axiosErr.response?.data ?? { error: axiosErr.message },
        responseTime,
        headers: (axiosErr.response?.headers as Record<string, string>) ?? {},
      };
    }
  }
}
