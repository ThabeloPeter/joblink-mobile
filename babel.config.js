module.exports = function(api) {
  api.cache(true);
  
  const isWeb = process.env.EXPO_PUBLIC_PLATFORM === 'web';
  
  // For web builds, use a simpler config without reanimated
  if (isWeb) {
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [],
    };
  }
  
  // For native builds, include reanimated
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin", // Must be last
    ],
  };
};

