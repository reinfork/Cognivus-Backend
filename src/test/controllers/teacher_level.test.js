const teacherLevelController = require('../../controllers/teacher_level');
const supabase = require('../../config/supabase');

// Mock dependencies - use global supabase mock

describe('Teacher Level Controller', () => {
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
    it('should get all teacher levels successfully', async () => {
      const mockData = [{ tlid: 1, classid: 1 }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await teacherLevelController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get teacher level by id successfully', async () => {
      req.params.id = '1';
      const mockData = { tlid: 1, classid: 1 };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await teacherLevelController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create teacher level successfully', async () => {
      req.body = { classid: 1, userid: 1 };
      const mockData = [{ tlid: 1, classid: 1 }];
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await teacherLevelController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });
  });

  describe('update', () => {
    it('should update teacher level successfully', async () => {
      req.params.id = '1';
      req.body = { classid: 2 };
      const mockData = [{ tlid: 1, classid: 2 }];
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await teacherLevelController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });

    it('should return 404 if teacher level not found', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await teacherLevelController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Lecturer not found on level.'
      });
    });
  });

  describe('delete', () => {
    it('should delete teacher level successfully', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{ tlid: 1 }], error: null })
      });

      await teacherLevelController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'lecturer unassigned from level successfully'
      });
    });
  });
});
