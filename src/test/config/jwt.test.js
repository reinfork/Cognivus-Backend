const { JWT_SECRET } = require('../../config/jwt');

describe('JWT Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {};
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should use environment variable when JWT_SECRET is set', () => {
    process.env.JWT_SECRET = 'test-secret-key';
    const config = require('../../config/jwt');
    expect(config.JWT_SECRET).toBe('test-secret-key');
  });

  test('should use default secret when JWT_SECRET is not set', () => {
    const config = require('../../config/jwt');
    expect(config.JWT_SECRET).toBeDefined();
    expect(typeof config.JWT_SECRET).toBe('string');
  });
});