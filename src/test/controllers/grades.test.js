const gradesController = require('../../controllers/grades');
const supabase = require('../../config/supabase');
const reportsModel = require('../../models/reports');

// Mock dependencies
jest.mock('../../models/reports');

describe('Grades Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      file: null
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
    it('should get all grades successfully', async () => {
      const mockData = [{ gradeid: 1, test_type: 'Test1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await gradesController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get grades by student id successfully', async () => {
      req.params.id = '1';
      const mockData = [{ gradeid: 1, test_type: 'Test1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await gradesController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create grade successfully', async () => {
      req.body = { test_type: 'Test1' };
      const mockData = [{ gradeid: 1 }];
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await gradesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        uploaded: []
      });
    });

    it('should return error for missing test_type', async () => {
      req.body = {};

      await gradesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test type are required for a new grade'
      });
    });
  });

  describe('update', () => {
    it('should update grade successfully', async () => {
      req.params.id = '1';
      req.body = { test_type: 'Updated' };
      const mockData = [{ gradeid: 1 }];
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await gradesController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        uploaded: []
      });
    });
  });

  describe('delete', () => {
    it('should delete grade successfully', async () => {
      req.params.id = '1';
      const mockData = [{ gradeid: 1, tbreport_files: [{ fileid: 1 }] }];
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await gradesController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'students grade id: 1 hard deleted successfully'
      });
    });
  });
});
