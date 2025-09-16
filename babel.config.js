module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
        [
            'module-resolver',
            {
                alias: {
                    '@': './app',
                    '@assets': './assets',
                    '@components': './components',
                    '@constants': './constants',
                    '@features': './features',
                    '@types': './types',
                    '@utils': './utils',
                },
            },
        ],
    ],
};
