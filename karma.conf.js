// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
  require('karma-jasmine'),
  require('karma-chrome-launcher'),
  require('karma-jasmine-html-reporter'),
  require('karma-coverage'),
  require('@angular-devkit/build-angular/plugins/karma')
],
    client: {
      jasmine: {
        // Jasmine options can go here
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
  dir: require('path').join(__dirname, './coverage'),
  subdir: '.',
  reporters: [
    { type: 'json', file: 'coverage-summary.json' },
    { type: 'text-summary' },
    { type: 'html' }
  ]
},
reporters: [ 'coverage'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,

    // In Docker/CI we don’t want autoWatch, we want single run
    autoWatch: false,
    singleRun: true,

    // Use headless Chromium with no-sandbox flags
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      }
    },

    restartOnFileChange: false
  });
};