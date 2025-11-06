module.exports = function(api) {
  api.cache(true);
  
  const presets = [
    ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    "nativewind/babel",
  ];
  
  const plugins = [];
  
  // Only add reanimated plugin for native platforms (not web)
  // Skip for web builds to avoid worklets dependency
  // When building for web, EXPO_PUBLIC_PLATFORM will be 'web'
  const isWeb = process.env.EXPO_PUBLIC_PLATFORM === 'web';
  
  if (!isWeb) {
    plugins.push("react-native-reanimated/plugin"); // Must be last
  }
  
  return {
    presets,
    plugins,
  };
};

