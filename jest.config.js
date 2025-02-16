export default {
    preset: "ts-jest",
    testEnvironment: "node",
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
      },
    },
    roots: ["<rootDir>/src"],
    transform: {
      "^.+\\.ts$": "ts-jest"
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    setupFiles: ["<rootDir>/jest.setup.js"],
    globalTeardown: '<rootDir>/src/jest.teardown.ts',
};

