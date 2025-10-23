module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1',
        '^@assets/(.*)$': '<rootDir>/assets/$1',
        '^@components/(.*)$': '<rootDir>/components/$1',
        '^@constants/(.*)$': '<rootDir>/constants/$1',
        '^@features/(.*)$': '<rootDir>/features/$1',
        '^@types/(.*)$': '<rootDir>/types/$1',
        '^@utils/(.*)$': '<rootDir>/utils/$1',
        '^expo-crypto$': '<rootDir>/__mocks__/expo-crypto.ts',
    },
};
