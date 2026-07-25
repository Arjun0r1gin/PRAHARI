module.exports = {
  testEnvironment: "node",
  testMatch: [
    "**/functions/**/tests/**/*.test.js"
  ],
  // Exclude the Catalyst build output directory entirely — it contains stale
  // copies of function source files and must never be scanned by Jest.
  testPathIgnorePatterns: [
    "<rootDir>/.build/"
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/.build/"
  ],
  moduleNameMapper: {
    "^@prahari/shared/(.*)$": "<rootDir>/shared/$1"
  }
};
