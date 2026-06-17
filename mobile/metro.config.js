// Metro config.
// `markdown-it` (via react-native-markdown-display) imports Node's core
// `punycode` module, which doesn't exist in the React Native runtime. We alias
// it to the userland `punycode` npm package so the Android/iOS bundle resolves.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  punycode: require.resolve("punycode/"),
};

module.exports = config;
