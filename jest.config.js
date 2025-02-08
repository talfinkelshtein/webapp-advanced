/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    rootDir: ".",
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    setupFiles: ["<rootDir>/src/jest.setup.ts"],
};

