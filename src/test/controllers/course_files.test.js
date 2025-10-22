const courseFilesController = require('../../controllers/course_files');
const supabase = require('../../config/supabase');

// Mock dependencies - use global supabase mock

describe('Course Files Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {}
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
    it('should get all course files successfully', async () => {
      const mockData = [{ cfid: 1, filename: 'course1.pdf' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await courseFilesController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get course file by id successfully', async () => {
      req.params.id = '1';
      const mockData = { cfid: 1, filename: 'course1.pdf' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await courseFilesController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });
});
