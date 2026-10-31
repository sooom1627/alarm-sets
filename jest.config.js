module.exports = {
  preset: "jest-expo",
  passWithNoTests: true,
  // Tests that render the whole router (and the 240-minute wheel) take up to
  // ~3 s locally and went past the 5 s default on CI.
  testTimeout: 15000,
  // On GitHub Actions, failed tests also show as annotations on the PR.
  reporters: process.env.GITHUB_ACTIONS
    ? ["default", "github-actions"]
    : ["default"],
  setupFilesAfterEnv: ["./jest-setup.ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    ".cursor/",
    ".claude/",
    ".agents/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "\\.css$": "<rootDir>/__mocks__/style-mock.ts",
    // The package resolves to ES modules (.mjs) that Jest does not transform.
    "^lucide-react-native$":
      "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
  },
};
