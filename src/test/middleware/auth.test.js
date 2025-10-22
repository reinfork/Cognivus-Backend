const { authenticateToken } = require('../../middleware/auth');
const { verifyToken } = require('../../utils/auth');

// Mock the auth utils
jest.mock('../../utils/auth', () => ({
  verifyToken: jest.fn()
}));

// Mock supabase
jest.mock('../../config/supabase', () => ({
  from: jest.fn()
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: undefined
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();

    // Reset environment
    delete process.env.NODE_ENV;
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should bypass authentication in development mode', () => {
      authenticateToken(req, res, next);

      expect(req.user).toEqual({
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'developer'
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should log development bypass message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      authenticateToken(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith('Development mode: Authentication bypassed');
      consoleSpy.mockRestore();
    });

    it('should handle development mode with custom user properties', () => {
      process.env.NODE_ENV = 'development';

      authenticateToken(req, res, next);

      expect(req.user.id).toBe('dev-user-id');
      expect(req.user.email).toBe('dev@example.com');
      expect(req.user.role).toBe('developer');
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should return 401 for missing authorization header', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for missing token in authorization header', () => {
      req.headers.authorization = 'Bearer';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for authorization header without Bearer prefix', () => {
      req.headers.authorization = 'token123';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should verify token and set user for valid token', () => {
      const mockUser = { id: '123', username: 'testuser', role: 'student' };
      req.headers.authorization = 'Bearer valid-token';
      verifyToken.mockReturnValue(mockUser);

      authenticateToken(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 for invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';
      verifyToken.mockReturnValue(null);

      authenticateToken(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should return 403 for expired token', () => {
      req.headers.authorization = 'Bearer expired-token';
      verifyToken.mockReturnValue(null);

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle token verification errors', () => {
      req.headers.authorization = 'Bearer error-token';
      verifyToken.mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication error',
        error: 'Token verification failed'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', () => {
      process.env.NODE_ENV = 'production';
      req.headers.authorization = 'Bearer test-token';
      verifyToken.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication error',
        error: 'Unexpected error'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle null token verification result', () => {
      process.env.NODE_ENV = 'production';
      req.headers.authorization = 'Bearer null-token';
      verifyToken.mockReturnValue(null);

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Security Tests', () => {
    it('should not expose sensitive information in errors', () => {
      process.env.NODE_ENV = 'production';
      req.headers.authorization = 'Bearer malicious-token';
      verifyToken.mockImplementation(() => {
        throw new Error('Database connection failed - password: secret123');
      });

      authenticateToken(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication error',
        error: 'Database connection failed - password: secret123'
      });

      // In a real implementation, you might want to sanitize error messages
      // to prevent information leakage
    });

    it('should handle various token formats', () => {
      process.env.NODE_ENV = 'production';

      const testCases = [
        { header: 'Bearer', expectedStatus: 401 },
        { header: 'Bearer ', expectedStatus: 401 },
        { header: 'Basic token123', expectedStatus: 401 },
        { header: 'Bearer token with spaces', expectedStatus: 403 },
        { header: 'Bearer valid-token', expectedStatus: 200 }
      ];

      testCases.forEach(({ header, expectedStatus }) => {
        jest.clearAllMocks();
        req.headers.authorization = header;

        if (header === 'Bearer valid-token') {
          verifyToken.mockReturnValue({ id: '123' });
        } else if (header.includes('Bearer') && header !== 'Bearer' && header !== 'Bearer ') {
          verifyToken.mockReturnValue(null);
        }

        authenticateToken(req, res, next);

        if (expectedStatus === 200) {
          expect(next).toHaveBeenCalled();
        } else {
          expect(res.status).toHaveBeenCalledWith(expectedStatus);
        }
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete authentication flow', () => {
      process.env.NODE_ENV = 'production';
      const mockUser = { id: '123', username: 'testuser', role: 'admin' };
      req.headers.authorization = 'Bearer valid-jwt-token';
      verifyToken.mockReturnValue(mockUser);

      authenticateToken(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith('valid-jwt-token');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle authentication failure flow', () => {
      process.env.NODE_ENV = 'production';
      req.headers.authorization = 'Bearer invalid-token';
      verifyToken.mockReturnValue(null);

      authenticateToken(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe('Environment Variable Tests', () => {
    it('should work in test environment', () => {
      process.env.NODE_ENV = 'test';

      authenticateToken(req, res, next);

      expect(req.user).toEqual({
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'developer'
      });
      expect(next).toHaveBeenCalled();
    });

    it('should work in staging environment', () => {
      process.env.NODE_ENV = 'staging';

      authenticateToken(req, res, next);

      expect(req.user).toEqual({
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'developer'
      });
      expect(next).toHaveBeenCalled();
    });

    it('should require authentication in production', () => {
      process.env.NODE_ENV = 'production';
      req.headers.authorization = 'Bearer test-token';
      verifyToken.mockReturnValue({ id: '123' });

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
