const { withAndroidManifest } = require('@expo/config-plugins');

const HEALTH_CONNECT_PACKAGE = 'com.google.android.apps.healthdata';

/**
 * Health Connect requires the app to declare a <queries> visibility entry for
 * its package, otherwise Android's package visibility rules (API 30+) hide it
 * from getSdkStatus()/initialize() even when it's installed.
 * https://developer.android.com/health-and-fitness/health-connect/get-started
 */
function withHealthConnectQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest.queries) {
      manifest.queries = [{}];
    }
    const queries = manifest.queries[0];
    if (!queries.package) {
      queries.package = [];
    }
    const alreadyDeclared = queries.package.some(
      (p) => p.$?.['android:name'] === HEALTH_CONNECT_PACKAGE
    );
    if (!alreadyDeclared) {
      queries.package.push({ $: { 'android:name': HEALTH_CONNECT_PACKAGE } });
    }
    return config;
  });
}

module.exports = withHealthConnectQueries;
