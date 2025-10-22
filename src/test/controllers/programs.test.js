const programsController = require('../../controllers/programs');
const supabase = require('../../config/supabase');

// Mock dependencies

describe('Programs Controller', () => {
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
    it('should get all programs successfully', async () => {
      const mockData = [{ programid: 1, program_name: 'Program1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await programsController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get program by id successfully', async () => {
      req.params.id = '1';
      const mockData = { programid: 1, program_name: 'Program1' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await programsController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create program successfully', async () => {
      req.body = { program_name: 'New Program' };
      const mockData = [{ programid: 1, program_name: 'New Program' }];
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await programsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });
  });

  describe('update', () => {
    it('should update program successfully', async () => {
      req.params.id = '1';
      req.body = { program_name: 'Updated Program' };
      const mockData = [{ programid: 1, program_name: 'Updated Program' }];
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await programsController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });

    it('should return 404 if program not found', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await programsController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Program not found.'
      });
    });
  });

  describe('delete', () => {
    it('should delete program successfully', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ programid: 1 }], error: null })
      });

      await programsController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'program deleted successfully'
      });
    });
  });
});
