const lecturersController = require('../../controllers/lecturers');
const supabase = require('../../config/supabase');
const { hashPassword } = require('../../utils/auth');

// Mock dependencies
jest.mock('../../utils/auth');

describe('Lecturers Controller', () => {
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
    it('should get all lecturers successfully', async () => {
      const mockData = [{ userid: 1, username: 'lecturer1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await lecturersController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get lecturer by id successfully', async () => {
      req.params.id = '1';
      const mockData = { userid: 1, username: 'lecturer1' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await lecturersController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create lecturer successfully', async () => {
      req.body = { username: 'newlecturer', email: 'test@example.com', password: 'password' };
      hashPassword.mockResolvedValue('hashed');
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { userid: 1 }, error: null })
      });
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { userid: 1, username: 'newlecturer' }, error: null })
      });

      await lecturersController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { userid: 1, username: 'newlecturer' }
      });
    });

    it('should return error for missing fields', async () => {
      req.body = { username: 'newlecturer' };

      await lecturersController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username, email, and password are required for the user account.'
      });
    });
  });

  describe('update', () => {
    it('should update lecturer successfully', async () => {
      req.params.id = '1';
      req.body = { username: 'updated' };
      const mockData = [{ userid: 1, username: 'updated' }];
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await lecturersController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });
  });

  describe('delete', () => {
    it('should delete lecturer successfully', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ userid: 1 }], error: null })
      });
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ userid: 1 }], error: null })
      });

      await lecturersController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Lecturer and associated user account deleted successfully'
      });
    });
  });
});
