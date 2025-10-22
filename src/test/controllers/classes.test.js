const classesController = require('../../controllers/classes');
const supabase = require('../../config/supabase');

// Mock dependencies
jest.mock('../../config/supabase');

describe('Classes Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
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
    it('should get all classes successfully', async () => {
      const mockData = [{ classid: 1, class_code: 'C1' }];
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await classesController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });

    it('should filter by lecturerid', async () => {
      req.query.lecturerid = '1';
      const mockData = [{ classid: 1, class_code: 'C1' }];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await classesController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get class by id successfully', async () => {
      req.params.id = '1';
      const mockData = { classid: 1, class_code: 'C1' };
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await classesController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create class successfully', async () => {
      req.body = { class_code: 'C1', levelid: 1 };
      const mockData = { classid: 1 };
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await classesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });

    it('should return error for missing fields', async () => {
      req.body = { class_code: 'C1' };

      await classesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Class Code and Level are required for a new class'
      });
    });
  });

  describe('update', () => {
    it('should update class successfully', async () => {
      req.params.id = '1';
      req.body = { class_code: 'Updated' };
      const mockData = [{ classid: 1, class_code: 'Updated' }];
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await classesController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('delete', () => {
    it('should delete class successfully', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ classid: 1 }], error: null })
      });

      await classesController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'class id: 1 deleted successfully'
      });
    });
  });
});
