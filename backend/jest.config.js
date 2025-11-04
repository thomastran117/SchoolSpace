const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>/src"],
  transformIgnorePatterns: ["/node_modules/(?!uuid)/"],
  moduleFileExtensions: ["ts", "js", "json"],
};
