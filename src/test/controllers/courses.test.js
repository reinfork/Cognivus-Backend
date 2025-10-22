const coursesController = require('../../controllers/courses');
const supabase = require('../../config/supabase');
const coursesModel = require('../../models/course');

// Mock dependencies
jest.mock('../../models/course');

describe('Courses Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      files: null
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
    it('should get all courses successfully', async () => {
      const mockData = [{ courseid: 1, title: 'Course 1' }];
      // Mock the chain for this specific test
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await coursesController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });

    it('should handle error', async () => {
      // Mock the chain for this specific test
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } })
      });

      await coursesController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching course',
        error: 'Error'
      });
    });
  });

  describe('getById', () => {
    it('should get course by id successfully', async () => {
      req.params.id = '1';
      const mockData = { courseid: 1, title: 'Course 1' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await coursesController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create course successfully', async () => {
      req.body = { title: 'New Course' };
      const mockData = [{ courseid: 1, title: 'New Course' }];
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await coursesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        files: []
      });
    });

    it('should return error for missing title', async () => {
      req.body = {};

      await coursesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title are required for a new course'
      });
    });
  });

  describe('update', () => {
    it('should update course successfully', async () => {
      req.params.id = '1';
      req.body = { title: 'Updated Course' };
      const mockData = [{ courseid: 1, title: 'Updated Course' }];
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await coursesController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        files: []
      });
    });

    it('should return 404 if course not found', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await coursesController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Course not found.'
      });
    });
  });

  describe('delete', () => {
    it('should delete course successfully', async () => {
      req.params.id = '1';
      const mockData = [{ courseid: 1, tbcourse_files: [] }];
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await coursesController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course id: 1 hard deleted successfully'
      });
    });
  });
});
