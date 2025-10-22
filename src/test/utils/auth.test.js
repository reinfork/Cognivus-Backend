const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
} = require('../../utils/auth');

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

// Mock JWT config
jest.mock('../../config/jwt', () => ({
  JWT_SECRET: 'test-secret-key'
}));

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const mockHash = 'hashed-password-123';
      bcrypt.hash.mockResolvedValue(mockHash);

      const result = await hashPassword('password123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result).toBe(mockHash);
    });

    it('should handle bcrypt errors', async () => {
      const error = new Error('Hashing failed');
      bcrypt.hash.mockRejectedValue(error);

      await expect(hashPassword('password123')).rejects.toThrow('Hashing failed');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword('password123', 'hashed-password');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword('wrong-password', 'hashed-password');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
      expect(result).toBe(false);
    });

    it('should handle bcrypt comparison errors', async () => {
      const error = new Error('Comparison failed');
      bcrypt.compare.mockRejectedValue(error);

      await expect(comparePassword('password123', 'hashed-password')).rejects.toThrow('Comparison failed');
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token successfully', () => {
      const mockToken = 'jwt-token-123';
      const payload = { id: '123', username: 'testuser', role: 'student' };

      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, 'test-secret-key', { expiresIn: '12h' });
      expect(result).toBe(mockToken);
    });

    it('should handle JWT signing errors', () => {
      const error = new Error('JWT signing failed');
      jwt.sign.mockImplementation(() => {
        throw error;
      });

      expect(() => generateToken({ id: '123' })).toThrow('JWT signing failed');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid JWT token successfully', () => {
      const payload = { id: '123', username: 'testuser', role: 'student' };
      jwt.verify.mockReturnValue(payload);

      const result = verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret-key');
      expect(result).toEqual(payload);
    });

    it('should return null for invalid JWT token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired JWT token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = verifyToken('expired-token');

      expect(result).toBeNull();
    });

    it('should handle malformed tokens', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Malformed token');
      });

      const result = verifyToken('malformed-token');

      expect(result).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full authentication flow', async () => {
      // Mock successful hashing
      const hashedPassword = 'hashed-password-123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Mock successful comparison
      bcrypt.compare.mockResolvedValue(true);

      // Mock successful token generation
      const mockToken = 'jwt-token-123';
      jwt.sign.mockReturnValue(mockToken);

      // Mock successful token verification
      const payload = { id: '123', username: 'testuser' };
      jwt.verify.mockReturnValue(payload);

      // Test full flow
      const password = 'password123';

      // 1. Hash password
      const hash = await hashPassword(password);
      expect(hash).toBe(hashedPassword);

      // 2. Compare password
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);

      // 3. Generate token
      const token = generateToken(payload);
      expect(token).toBe(mockToken);

      // 4. Verify token
      const decoded = verifyToken(token);
      expect(decoded).toEqual(payload);
    });

    it('should handle authentication failure scenarios', async () => {
      // Mock failed comparison
      bcrypt.compare.mockResolvedValue(false);

      // Mock failed token verification
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Test failed comparison
      const isValid = await comparePassword('wrong-password', 'hashed-password');
      expect(isValid).toBe(false);

      // Test failed verification
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });
});
