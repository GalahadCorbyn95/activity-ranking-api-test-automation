const common = {
  requireModule: ['ts-node/register'],
  require: ['tests/steps/**/*.ts', 'tests/support/**/*.ts'],
  paths: ['features/**/*.feature'],
  format: [
    'progress-bar',
    'json:reports/cucumber-report.json',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  worldParameters: {
    stepTimeout: 30000,
  },
};

module.exports = {
  default: {
    ...common,
  },
};
