import * as fs from 'fs';
import * as path from 'path';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_REPORT = path.join(REPORTS_DIR, 'cucumber-report.json');
const MD_REPORT = path.join(REPORTS_DIR, 'test-summary.md');

interface CucumberScenario {
  name: string;
  tags?: { name: string }[];
  steps: { result?: { status: string; duration?: number } }[];
}

interface CucumberFeature {
  name: string;
  uri: string;
  elements?: CucumberScenario[];
}

/**
 * Reads the Cucumber JSON report and generates:
 *  1. An HTML report via multiple-cucumber-html-reporter
 *  2. A markdown summary with pass/fail metrics and response times
 */
export async function generateReport(): Promise<void> {
  if (!fs.existsSync(JSON_REPORT)) {
    throw new Error(`JSON report not found at ${JSON_REPORT}. Run tests with --format json first.`);
  }

  await generateHtmlReport();
  generateMarkdownSummary();
}

// -- HTML Report ---------------------------------------------------------------

async function generateHtmlReport(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const reporter = require('multiple-cucumber-html-reporter');

    reporter.generate({
      jsonDir: REPORTS_DIR,
      reportPath: REPORTS_DIR,
      reportName: 'Activity Ranking API — Test Report',
      pageTitle: 'Activity Ranking API Tests',
      displayDuration: true,
      displayReportTime: true,
      metadata: {
        device: 'CI / Local',
        platform: { name: 'Node.js' },
      },
      customData: {
        title: 'Run Info',
        data: [
          { label: 'Project', value: 'Activity Ranking API QA' },
          { label: 'Execution Date', value: new Date().toISOString() },
        ],
      },
    });

    console.log(`  [REPORT] HTML report generated at ${REPORTS_DIR}`);
  } catch (err) {
    console.warn('  [WARN] HTML report generation failed:', (err as Error).message);
  }
}

// -- Markdown Summary ----------------------------------------------------------

function generateMarkdownSummary(): void {
  const raw = fs.readFileSync(JSON_REPORT, 'utf-8');
  const features: CucumberFeature[] = JSON.parse(raw);

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const durations: number[] = [];
  const knownFailures: string[] = [];
  const featureStats: { name: string; passed: number; failed: number; skipped: number }[] = [];

  for (const feature of features) {
    let fPassed = 0;
    let fFailed = 0;
    let fSkipped = 0;

    for (const scenario of feature.elements ?? []) {
      total++;
      const tags = (scenario.tags ?? []).map((t) => t.name);
      const isKnownFailure = tags.includes('@known-failure');

      const scenarioStatus = getScenarioStatus(scenario);

      if (scenarioStatus === 'passed') {
        passed++;
        fPassed++;
      } else if (scenarioStatus === 'failed') {
        failed++;
        fFailed++;
        if (isKnownFailure) knownFailures.push(scenario.name);
      } else {
        skipped++;
        fSkipped++;
      }

      const scenarioDuration = getScenarioDuration(scenario);
      if (scenarioDuration > 0) durations.push(scenarioDuration);
    }

    featureStats.push({ name: feature.name, passed: fPassed, failed: fFailed, skipped: fSkipped });
  }

  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  const avgDuration = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0) : 'N/A';
  const minDuration = durations.length > 0 ? Math.min(...durations).toFixed(0) : 'N/A';
  const maxDuration = durations.length > 0 ? Math.max(...durations).toFixed(0) : 'N/A';

  const lines: string[] = [
    '# Test Summary Report',
    '',
    `**Generated:** ${new Date().toISOString()}`,
    '',
    '## Overall Metrics',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Total Scenarios | ${total} |`,
    `| Passed | ${passed} |`,
    `| Failed | ${failed} |`,
    `| Skipped | ${skipped} |`,
    `| Pass Rate | ${passRate}% |`,
    `| Avg Response Time | ${avgDuration}ms |`,
    `| Min Response Time | ${minDuration}ms |`,
    `| Max Response Time | ${maxDuration}ms |`,
    '',
    '## Results by Feature',
    '',
    '| Feature | Passed | Failed | Skipped |',
    '|---------|--------|--------|---------|',
  ];

  for (const fs of featureStats) {
    lines.push(`| ${fs.name} | ${fs.passed} | ${fs.failed} | ${fs.skipped} |`);
  }

  if (knownFailures.length > 0) {
    lines.push('', '## Known Failures (@known-failure)', '');
    lines.push('These scenarios are **expected to fail** due to divergences between the ticket acceptance criteria and the actual API behavior. See [Divergence Report](../docs/divergence-report.md) for details.', '');
    for (const name of knownFailures) {
      lines.push(`- ${name}`);
    }
  }

  lines.push('', '---', '', '*Report generated automatically by the test suite.*', '');

  fs.writeFileSync(MD_REPORT, lines.join('\n'), 'utf-8');
  console.log(`  [REPORT] Markdown summary generated at ${MD_REPORT}`);
}

// -- Helpers -------------------------------------------------------------------

function getScenarioStatus(scenario: CucumberScenario): string {
  for (const step of scenario.steps) {
    if (step.result?.status === 'failed') return 'failed';
    if (step.result?.status === 'skipped') return 'skipped';
  }
  return 'passed';
}

/** Returns total scenario duration in milliseconds (Cucumber reports nanoseconds) */
function getScenarioDuration(scenario: CucumberScenario): number {
  let total = 0;
  for (const step of scenario.steps) {
    if (step.result?.duration) {
      total += step.result.duration / 1_000_000; // ns → ms
    }
  }
  return total;
}
