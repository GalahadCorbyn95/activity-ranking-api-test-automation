import { Before, After, AfterAll, Status, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';
import { generateReport } from './report-generator';

// API calls can take 10+ seconds due to Lambda cold starts and network latency
setDefaultTimeout(30_000);

/**
 * Before each scenario: reset response state so no stale data leaks
 * between scenarios.
 */
Before(function () {
  this.response = undefined as any;
  this.selectedLat = undefined as any;
  this.selectedLon = undefined as any;
});

/**
 * After each scenario: log failures for debugging visibility.
 */
After(function (scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === Status.FAILED) {
    const tags = scenario.pickle.tags.map((t) => t.name).join(', ');
    console.log(
      `\n  [FAILED] ${scenario.pickle.name}` +
      (tags ? ` (${tags})` : '') +
      (this.response ? `\n    Status: ${this.response.status}` : '') +
      (this.response ? `\n    Response time: ${this.response.responseTime}ms` : ''),
    );
  }
});

/**
 * After all scenarios: generate HTML + markdown reports from the JSON output.
 * The JSON file may not be fully flushed yet when AfterAll fires, so the
 * markdown report is generated via the separate `test:report` npm script.
 * The HTML reporter reads the JSON directory directly and handles this.
 */
AfterAll(async function () {
  try {
    await generateReport();
  } catch (err) {
    // JSON not fully written yet — expected during live runs.
    // Run `npm run test:report` separately for the full markdown summary.
  }
});
