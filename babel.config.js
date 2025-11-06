module.exports = function(api) {
  api.cache(true);
  
  const isWeb = process.env.EXPO_PUBLIC_PLATFORM === 'web';
  
  const presets = [
    [
      "babel-preset-expo",
      {
        jsxImportSource: "nativewind",
        // Disable reanimated for web builds
        web: {
          transform: {
            reactNativeReanimated: false,
          },
        },
      },
    ],
    "nativewind/babel",
  ];
  
  const plugins = [];
  
  // Only add reanimated plugin for native platforms (not web)
  // Skip for web builds to avoid worklets dependency
  if (!isWeb) {
    plugins.push("react-native-reanimated/plugin"); // Must be last
  }
  
  return {
    presets,
    plugins,
  };
};

