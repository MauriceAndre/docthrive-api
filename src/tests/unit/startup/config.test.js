// startup functions
const config = require('../../../startup/config');

describe('server startup', () => {

    it('should throw if required environment variables are not defined', () => {
        const env = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        expect(config).toThrow();

        process.env.NODE_ENV = env;
    });
});