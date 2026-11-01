// Reanimated 4.7 and Worklets 0.13 (SDK 58) run their web build in Jest, so
// their own files must resolve without the native extensions. Their bundled
// resolvers match the package name anywhere in the path, which under pnpm also
// hits other packages (.pnpm/expo-modules-core@…_react-native-worklets@…), so
// this one matches the package directory instead.
const reactNativeResolver = require(require("jest-expo/jest-preset").resolver);

const WEB_ONLY_IN_REANIMATED = new Set([
  "initializers",
  "mutables",
  "mappers",
  "ConfigHelper",
  "UpdateLayoutAnimations",
  "useAnimatedRef",
  "useAnimatedStyle",
  "WorkletEventHandler",
  "JSPropsUpdater",
  "updateProps",
  "util",
  "css/component/AnimatedComponent",
]);

const isInPackage = (dir, name) =>
  dir.includes(`/node_modules/${name}/`) ||
  dir.endsWith(`/node_modules/${name}`);

const isWebOnlyInReanimated = (request, basedir) => {
  if (!request.startsWith(".")) return false;
  if (!isInPackage(basedir, "react-native-reanimated")) return false;
  const basename = request.split("/").pop();
  return [...WEB_ONLY_IN_REANIMATED].some((entry) =>
    entry.includes("/") ? request.endsWith(entry) : basename === entry,
  );
};

const usesWebBuild = (request, basedir) =>
  isWebOnlyInReanimated(request, basedir) ||
  isInPackage(basedir, "react-native-worklets") ||
  request === "react-native-worklets" ||
  request.startsWith("react-native-worklets/");

module.exports = (request, options) => {
  if (!usesWebBuild(request, options.basedir)) {
    return reactNativeResolver(request, options);
  }
  return reactNativeResolver(request, {
    ...options,
    extensions: options.extensions?.filter((ext) => !ext.includes("native")),
  });
};
