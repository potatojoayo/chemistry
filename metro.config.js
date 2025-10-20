const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Ensure package exports resolve to browser/CJS/react-native where available
config.resolver = {
  ...(config.resolver || {}),
  unstable_conditionNames: ["browser", "require", "react-native"],
};

module.exports = withNativeWind(config, { input: "./global.css" });
