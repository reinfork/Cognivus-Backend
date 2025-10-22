const authController = require('../../controllers/auth');
const supabase = require('../../config/supabase');
const { comparePassword, hashPassword, generateToken } = require('../../utils/auth');

// Mock dependencies
jest.mock('../../utils/auth');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password', full_name: 'Test User' };
      supabase.auth.signUp.mockResolvedValue({ data: { user: { id: 1 } }, error: null });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        user: { id: 1 }
      });
    });

    it('should return error for missing fields', async () => {
      req.body = { email: 'test@example.com' };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email, password, and full name are required'
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      req.body = { username: 'testuser', password: 'password' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { userid: 1, username: 'testuser', password: 'hashed', roleid: 1 },
          error: null
        })
      });
      comparePassword.mockResolvedValue(true);
      generateToken.mockReturnValue('token');

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login berhasil',
        token: 'token',
        user: { id: 1, username: 'testuser', email: undefined },
        role: 'student'
      });
    });

    it('should return error for invalid credentials', async () => {
      req.body = { username: 'testuser', password: 'wrong' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'User not found' } })
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid Username'
      });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { userid: 1, username: 'testuser' },
          error: null
        })
      });

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, profile: { userid: 1, username: 'testuser' } }
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful'
      });
    });
  });
});
