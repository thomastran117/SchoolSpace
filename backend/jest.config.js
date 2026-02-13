const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  modulePaths: ["<rootDir>/tests"],
  transformIgnorePatterns: ["/node_modules/(?!uuid)/"],
  moduleFileExtensions: ["ts", "js", "json"],
};
