module.exports = {
    // preset: 'ts-jest', // use this if you are using TypeScript
    globalSetup: './jest.global-setup.js', // optional: will be called once before all tests are executed
    globalTeardown: './jest.global-teardown.js', // optional: will be called once after all tests are executed
    // coverageThreshold: {
    //     global: {
    //         branches: 80,
    //         functions: 80,
    //         lines: 80,
    //         statements: 80
    //     }
    // } // optional: let Jest fail if thresholds are not met
    "roots": [
        "."
    ],
    "testMatch": [
        "**/*.test.ts"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
};
