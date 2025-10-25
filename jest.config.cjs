module.exports = {
    // Use the Expo Jest preset which is configured for React Native / Expo
    // apps. This replaces ts-jest and works with babel-jest + babel-preset-expo.
    preset: 'jest-expo',
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    // Explicit transforms so Jest will compile TS/TSX and JS/JSX files
    // This resolves "Unexpected token '<'" when importing .tsx components in tests.
    transform: {
        // Use babel-jest to transform both JS and TS files so the project's
        // Babel config (babel-preset-expo) is applied to .tsx React Native
        // components as well. This keeps transforms consistent for Expo.
        '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1',
        '^@assets/(.*)$': '<rootDir>/assets/$1',
        '^@components/(.*)$': '<rootDir>/components/$1',
        '^@constants/(.*)$': '<rootDir>/constants/$1',
        '^@features/(.*)$': '<rootDir>/features/$1',
        '^@types/(.*)$': '<rootDir>/types/$1',
        '^@utils/(.*)$': '<rootDir>/utils/$1',
        '^expo-crypto$': '<rootDir>/__mocks__/expo-crypto.ts',
        '^@expo/vector-icons$': '<rootDir>/__mocks__/@expo/vector-icons.js',
    },
};
