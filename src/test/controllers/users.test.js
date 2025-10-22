const usersController = require('../../controllers/users');
const supabase = require('../../config/supabase');

// Mock dependencies

describe('Users Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all users successfully', async () => {
      const mockData = [{ userid: 1, username: 'user1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await usersController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });

    it('should handle error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } })
      });

      await usersController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching user',
        error: 'Error'
      });
    });
  });

  describe('getById', () => {
    it('should get user by id successfully', async () => {
      req.params.id = '1';
      const mockData = { userid: 1, username: 'user1' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await usersController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      req.body = { username: 'newuser' };
      const mockData = [{ userid: 2, username: 'newuser' }];
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await usersController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      req.params.id = '1';
      req.body = { username: 'updated' };
      const mockData = [{ userid: 1, username: 'updated' }];
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await usersController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await usersController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found.'
      });
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ userid: 1 }], error: null })
      });

      await usersController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'user deleted successfully'
      });
    });
  });
});
