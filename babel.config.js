module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
        [
            'module-resolver',
            {
                // Keep these in sync with tsconfig.json "paths"
                alias: {
                    '@': './app',
                    '@assets': './assets',
                    '@components': './components',
                    '@constants': './constants',
                    '@features': './features',
                    '@types': './types',
                    '@utils': './utils',
                },
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
            },
        ],
    ],
};
