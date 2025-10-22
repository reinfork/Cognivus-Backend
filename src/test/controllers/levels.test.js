const levelsController = require('../../controllers/levels');
const supabase = require('../../config/supabase');

// Mock dependencies

describe('Levels Controller', () => {
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
    it('should get all levels successfully', async () => {
      const mockData = [{ levelid: 1, level_name: 'Level1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await levelsController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get level by id successfully', async () => {
      req.params.id = '1';
      const mockData = { levelid: 1, level_name: 'Level1' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await levelsController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create level successfully', async () => {
      req.body = { level_name: 'New Level' };
      const mockData = [{ levelid: 1, level_name: 'New Level' }];
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await levelsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });
  });

  describe('update', () => {
    it('should update level successfully', async () => {
      req.params.id = '1';
      req.body = { level_name: 'Updated Level' };
      const mockData = [{ levelid: 1, level_name: 'Updated Level' }];
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await levelsController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });

    it('should return 404 if level not found', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await levelsController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Level not found.'
      });
    });
  });

  describe('delete', () => {
    it('should delete level successfully', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ levelid: 1 }], error: null })
      });

      await levelsController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'user deleted successfully'
      });
    });
  });
});
