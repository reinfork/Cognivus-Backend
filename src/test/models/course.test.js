const courseModel = require('../../models/course');

// Mock storage middleware
jest.mock('../../middleware/storage', () => ({
  upload: jest.fn(),
  getPublicUrl: jest.fn()
}));

describe('Course Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create course file successfully', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test file content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';
      // The path will be generated based on the mocked Date.now values
      const expectedPath = '1/1234567891'; // Date.now mock returns incrementing values starting from 1234567891
      const mockUrl = 'https://example.com/files/1/1234567891';

      // Mock storage upload
      require('../../middleware/storage').upload.mockResolvedValue();

      // Mock storage getPublicUrl
      require('../../middleware/storage').getPublicUrl.mockResolvedValue(mockUrl);

      // Mock supabase insert
      const mockInsertResult = {
        data: [{
          cfid: '1',
          courseid: '1',
          path: expectedPath,
          url: mockUrl
        }],
        error: null
      };

      require('../../config/supabase').from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockInsertResult)
      });

      const result = await courseModel.create(mockData, mockFile, bucket);

      expect(require('../../middleware/storage').upload).toHaveBeenCalledWith(expectedPath, mockFile, bucket);
      expect(require('../../middleware/storage').getPublicUrl).toHaveBeenCalledWith(expectedPath, bucket);
      expect(require('../../config/supabase').from).toHaveBeenCalledWith('tbcourse_files');
      expect(result).toEqual(mockInsertResult.data);
    });

    it('should handle storage upload errors', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test file content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';
      const uploadError = new Error('Upload failed');

      require('../../middleware/storage').upload.mockRejectedValue(uploadError);

      await expect(courseModel.create(mockData, mockFile, bucket)).rejects.toThrow('Upload failed');
    });

    it('should handle public URL generation errors', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test file content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';
      const mockPath = '1/1234567890';

      // Mock successful upload
      require('../../middleware/storage').upload.mockResolvedValue();

      // Mock failed public URL generation
      const urlError = new Error('Failed to get public URL');
      require('../../middleware/storage').getPublicUrl.mockRejectedValue(urlError);

      await expect(courseModel.create(mockData, mockFile, bucket)).rejects.toThrow('Failed to get public URL');
    });

    it('should handle database insertion errors', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test file content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';
      const mockPath = '1/1234567890';
      const mockUrl = 'https://example.com/files/1/1234567890';

      // Mock successful storage operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue(mockUrl);

      // Mock database error
      const dbError = { error: { message: 'Database insertion failed' } };
      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(dbError)
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      await expect(courseModel.create(mockData, mockFile, bucket)).rejects.toEqual(dbError.error);
    });

    it('should generate unique paths for different files', async () => {
      const mockData1 = { courseid: '1', classid: '1' };
      const mockData2 = { courseid: '2', classid: '2' };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{}], error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      // Create two files
      await courseModel.create(mockData1, mockFile, bucket);
      await courseModel.create(mockData2, mockFile, bucket);

      // Should have been called twice with different paths
      expect(require('../../middleware/storage').upload).toHaveBeenCalledTimes(2);
      expect(require('../../middleware/storage').upload.mock.calls[0][0]).not.toBe(
        require('../../middleware/storage').upload.mock.calls[1][0]
      );
    });
  });

  describe('delete', () => {
    it('should delete course file successfully', async () => {
      const mockFile = {
        path: '1/1234567890'
      };

      const bucket = 'courses';

      // Mock successful deletion
      const mockSupabaseStorage = {
        remove: jest.fn().mockResolvedValue({ error: null })
      };

      require('../../config/supabase').storage.from.mockReturnValue(mockSupabaseStorage);

      await courseModel.delete(mockFile, bucket);

      expect(require('../../config/supabase').storage.from).toHaveBeenCalledWith(bucket);
      expect(mockSupabaseStorage.remove).toHaveBeenCalledWith(mockFile.path);
    });

    it('should handle deletion errors', async () => {
      const mockFile = {
        path: '1/1234567890'
      };

      const bucket = 'courses';

      const deleteError = { error: { message: 'Delete failed' } };
      const mockSupabaseStorage = {
        remove: jest.fn().mockResolvedValue(deleteError)
      };

      require('../../config/supabase').storage.from.mockReturnValue(mockSupabaseStorage);

      // Model function doesn't throw on error, it just calls the storage function
      await courseModel.delete(mockFile, bucket);

      expect(mockSupabaseStorage.remove).toHaveBeenCalledWith(mockFile.path);
    });

    it('should handle missing file path', async () => {
      const mockFile = {};
      const bucket = 'courses';

      const mockSupabaseStorage = {
        remove: jest.fn().mockResolvedValue({ error: null })
      };

      require('../../config/supabase').storage.from.mockReturnValue(mockSupabaseStorage);

      await courseModel.delete(mockFile, bucket);

      expect(mockSupabaseStorage.remove).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete course file lifecycle', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test course content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';
      const mockPath = '1/1234567890';
      const mockUrl = 'https://example.com/files/1/1234567890';

      // Mock successful storage operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue(mockUrl);

      // Mock successful database operations
      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{
            cfid: '1',
            courseid: '1',
            path: mockPath,
            url: mockUrl
          }],
          error: null
        })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      // 1. Create course file
      const createResult = await courseModel.create(mockData, mockFile, bucket);
      expect(createResult[0].courseid).toBe('1');
      expect(createResult[0].path).toBe(mockPath);
      expect(createResult[0].url).toBe(mockUrl);

      // 2. Delete course file
      const mockSupabaseStorage = {
        remove: jest.fn().mockResolvedValue({ error: null })
      };

      require('../../config/supabase').storage.from.mockReturnValue(mockSupabaseStorage);

      await courseModel.delete(createResult[0], bucket);
      expect(mockSupabaseStorage.remove).toHaveBeenCalledWith(mockPath);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during file operations', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';

      // Mock network error during upload
      require('../../middleware/storage').upload.mockRejectedValue(new Error('Network error'));

      await expect(courseModel.create(mockData, mockFile, bucket)).rejects.toThrow('Network error');
    });

    it('should handle database connection errors', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';

      // Mock successful storage operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      // Mock database connection error
      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      await expect(courseModel.create(mockData, mockFile, bucket)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Data Validation', () => {
    it('should handle missing course data', async () => {
      const mockData = {}; // Missing courseid and classid

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{}], error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      const result = await courseModel.create(mockData, mockFile, bucket);

      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        courseid: undefined,
        path: expect.any(String),
        url: 'https://example.com/file.pdf'
      });
    });

    it('should handle missing file data', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {}; // Missing buffer and mimetype

      const bucket = 'courses';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{}], error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      const result = await courseModel.create(mockData, mockFile, bucket);

      expect(require('../../middleware/storage').upload).toHaveBeenCalledWith(
        expect.any(String),
        mockFile,
        bucket
      );
    });
  });

  describe('Path Generation', () => {
    it('should generate paths based on classid and timestamp', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{}], error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      await courseModel.create(mockData, mockFile, bucket);

      const uploadedPath = require('../../middleware/storage').upload.mock.calls[0][0];
      expect(uploadedPath).toMatch(/^1\/\d+$/); // Should start with classid and timestamp
    });

    it('should generate unique paths for concurrent uploads', async () => {
      const mockData = {
        courseid: '1',
        classid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'courses';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{}], error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      // Create multiple files concurrently
      const promises = Array.from({ length: 3 }, () =>
        courseModel.create(mockData, mockFile, bucket)
      );

      await Promise.all(promises);

      const uploadedPaths = require('../../middleware/storage').upload.mock.calls.map(call => call[0]);
      const uniquePaths = new Set(uploadedPaths);

      expect(uniquePaths.size).toBe(3); // All paths should be unique
    });
  });
});
