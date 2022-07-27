const esModules = ['@cloudflare/opaque-ts', '@cloudflare/voprf-ts'].join('|');

module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
    moduleDirectories: ['node_modules', '<rootDir>/src'],
};
