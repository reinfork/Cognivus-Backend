const studentsController = require('../../controllers/students');
const supabase = require('../../config/supabase');
const { hashPassword } = require('../../utils/auth');

// Mock dependencies
jest.mock('../../utils/auth');

// Mock supabase using global setup pattern

describe('Students Controller', () => {
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
    it('should get all students successfully', async () => {
      const mockData = [{ userid: 1, username: 'student1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await studentsController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get student by id successfully', async () => {
      req.params.id = '1';
      const mockData = { userid: 1, username: 'student1' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await studentsController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create student successfully', async () => {
      req.body = { username: 'newstudent', email: 'test@example.com', password: 'password' };
      hashPassword.mockResolvedValue('hashed');
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { userid: 1 }, error: null })
      });
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { userid: 1, username: 'newstudent' }, error: null })
      });

      await studentsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { userid: 1, username: 'newstudent' }
      });
    });

    it('should return error for missing fields', async () => {
      req.body = { username: 'newstudent' };

      await studentsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username, email, and password are required for the user account.'
      });
    });
  });

  describe('update', () => {
    it('should update student successfully', async () => {
      req.params.id = '1';
      req.body = { username: 'updated' };
      const mockData = { userid: 1, username: 'updated' };
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await studentsController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('delete', () => {
    it('should delete student successfully', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ userid: 1 }], error: null })
      });

      await studentsController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Student deleted successfully'
      });
    });
  });
});
