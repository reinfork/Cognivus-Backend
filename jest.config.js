module.exports = {
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.js", "**/src/tests/**/*.test.js"],
  collectCoverage: true,
  coverageReporters: ["html", "text", "lcov"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/test/**", "!src/tests/**", "!src/migrations/**", "!src/seeders/**", "!src/config/**"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
}