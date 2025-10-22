const reportsModel = require('../../models/reports');

// Mock supabase
jest.mock('../../config/supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    eq: jest.fn()
  })),
  storage: {
    from: jest.fn()
  }
}));

// Mock storage middleware
jest.mock('../../middleware/storage', () => ({
  upload: jest.fn(),
  delete: jest.fn(),
  getPublicUrl: jest.fn()
}));

// Mock Date.now() for consistent timestamps
const mockTimestamp = 1234567890;
jest.spyOn(Date, 'now').mockImplementation(() => mockTimestamp);

describe('Reports Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrReplace', () => {
    it('should create new report file when no existing file found', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('test report content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';
      const mockPath = '1/Midterm_1234567890';
      const mockUrl = 'https://example.com/reports/1/Midterm_1234567890';

      // Mock finding no existing file
      const mockSelectResult = {
        data: [],
        error: null
      };

      // Mock storage operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue(mockUrl);

      // Mock database insert
      const mockInsertResult = {
        data: {
          rfid: '1',
          gradeid: '1',
          studentid: '1',
          path: mockPath,
          url: mockUrl
        },
        error: null
      };

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSelectResult)
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockInsertResult)
      };

      require('../../config/supabase').from
        .mockReturnValueOnce(mockSupabaseQuery) // First call for select
        .mockReturnValueOnce(mockInsertQuery); // Second call for insert

      const result = await reportsModel.createOrReplace(mockData, mockFile, bucket);

      expect(require('../../config/supabase').from).toHaveBeenCalledWith('tbreport_files');
      expect(mockSupabaseQuery.select).toHaveBeenCalled();
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('gradeid', '1');
      expect(require('../../middleware/storage').upload).toHaveBeenCalledWith(mockPath, mockFile.buffer, bucket);
      expect(require('../../middleware/storage').getPublicUrl).toHaveBeenCalledWith(mockPath, bucket);
      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        gradeid: '1',
        studentid: '1',
        path: mockPath,
        url: mockUrl
      });
      expect(result).toEqual(mockInsertResult.data);
    });

    it('should replace existing report file when file exists', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('new report content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';
      const oldPath = `1/Midterm_${mockTimestamp}`;
      const newPath = `1/Midterm_${mockTimestamp}`;
      const newUrl = `https://example.com/reports/1/Midterm_${mockTimestamp}`;

      // Mock finding existing file
      const mockSelectResult = {
        data: [{
          rfid: '1',
          path: oldPath,
          url: 'https://example.com/reports/1/Midterm_1234567890'
        }],
        error: null
      };

      // Mock storage operations
      require('../../middleware/storage').delete.mockResolvedValue();
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue(newUrl);

      // Mock database update
      const mockUpdateResult = {
        data: {
          rfid: '1',
          gradeid: '1',
          studentid: '1',
          path: newPath,
          url: newUrl
        },
        error: null
      };

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSelectResult)
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockUpdateResult)
      };

      require('../../config/supabase').from
        .mockReturnValueOnce(mockSelectQuery) // First call for select
        .mockReturnValueOnce(mockUpdateQuery); // Second call for update

      const result = await reportsModel.createOrReplace(mockData, mockFile, bucket);

      expect(require('../../middleware/storage').delete).toHaveBeenCalledWith(oldPath, bucket);
      expect(require('../../middleware/storage').upload).toHaveBeenCalledWith(newPath, mockFile.buffer, bucket);
      expect(require('../../middleware/storage').getPublicUrl).toHaveBeenCalledWith(newPath, bucket);
      expect(mockUpdateQuery.update).toHaveBeenCalledWith({
        path: newPath,
        url: newUrl
      });
      expect(mockUpdateQuery.eq).toHaveBeenCalledWith('gradeid', '1');
      expect(result).toEqual(mockUpdateResult.data);
    });

    it('should handle storage deletion errors during replacement', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('new content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';

      // Mock finding existing file
      const mockSelectResult = {
        data: [{
          path: '1/Midterm_1234567890'
        }],
        error: null
      };

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSelectResult)
      };

      require('../../config/supabase').from.mockReturnValue(mockSelectQuery);

      // Mock deletion error
      const deleteError = new Error('Delete failed');
      require('../../middleware/storage').delete.mockRejectedValue(deleteError);

      await expect(reportsModel.createOrReplace(mockData, mockFile, bucket)).rejects.toThrow('Delete failed');
    });

    it('should handle database errors during select', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';

      // Mock database error during select
      const selectError = { error: { message: 'Database select failed' } };
      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(selectError)
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      await expect(reportsModel.createOrReplace(mockData, mockFile, bucket)).rejects.toEqual(selectError.error);
    });
  });

  describe('create', () => {
    it('should create new report file successfully', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('test report content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';
      const mockPath = '1/Midterm_1234567890';
      const mockUrl = 'https://example.com/reports/1/Midterm_1234567890';

      // Mock storage operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue(mockUrl);

      // Mock database insert
      const mockInsertResult = {
        data: {
          rfid: '1',
          gradeid: '1',
          studentid: '1',
          path: mockPath,
          url: mockUrl
        },
        error: null
      };

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockInsertResult)
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      const result = await reportsModel.create(mockData, mockFile, bucket);

      expect(require('../../middleware/storage').upload).toHaveBeenCalledWith(mockPath, mockFile.buffer, bucket);
      expect(require('../../middleware/storage').getPublicUrl).toHaveBeenCalledWith(mockPath, bucket);
      expect(require('../../config/supabase').from).toHaveBeenCalledWith('tbreport_files');
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        studentid: '1',
        gradeid: '1',
        path: mockPath,
        url: mockUrl
      });
      expect(result).toEqual(mockInsertResult.data);
    });

    it('should handle storage upload errors', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';

      const uploadError = new Error('Upload failed');
      require('../../middleware/storage').upload.mockRejectedValue(uploadError);

      await expect(reportsModel.create(mockData, mockFile, bucket)).rejects.toThrow('Upload failed');
    });

    it('should handle database insertion errors', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';
      const mockPath = `1/Midterm_${mockTimestamp}`;
      const mockUrl = `https://example.com/reports/1/Midterm_${mockTimestamp}`;

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue(mockUrl);

      // Mock database error
      const dbError = { error: { message: 'Database insertion failed' } };
      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(dbError)
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      await expect(reportsModel.create(mockData, mockFile, bucket)).rejects.toEqual(dbError.error);
    });
  });

  describe('delete', () => {
    it('should delete report file successfully', async () => {
      const mockFile = {
        path: '1/Midterm_1234567890'
      };

      const bucket = 'reports';

      // Mock successful deletion
      const mockSupabaseStorage = {
        remove: jest.fn().mockResolvedValue({ error: null })
      };

      require('../../config/supabase').storage.from.mockReturnValue(mockSupabaseStorage);

      const result = await reportsModel.delete(mockFile, bucket);

      expect(require('../../config/supabase').storage.from).toHaveBeenCalledWith(bucket);
      expect(mockSupabaseStorage.remove).toHaveBeenCalledWith(mockFile.path);
      expect(result).toBeUndefined(); // Function doesn't return anything on success
    });

    it('should handle deletion errors', async () => {
      const mockFile = {
        path: '1/Midterm_1234567890'
      };

      const bucket = 'reports';

      const deleteError = { error: { message: 'Delete failed' } };
      const mockSupabaseStorage = {
        remove: jest.fn().mockResolvedValue(deleteError)
      };

      require('../../config/supabase').storage.from.mockReturnValue(mockSupabaseStorage);

      await expect(reportsModel.delete(mockFile, bucket)).rejects.toEqual(deleteError.error);
    });

    it('should handle missing file path gracefully', async () => {
      const mockFile = {};
      const bucket = 'reports';

      const mockSupabaseStorage = {
        remove: jest.fn().mockResolvedValue({ error: null })
      };

      require('../../config/supabase').storage.from.mockReturnValue(mockSupabaseStorage);

      await expect(reportsModel.delete(mockFile, bucket)).rejects.toThrow('File path is required');
    });
  });

  describe('Path Generation', () => {
    it('should generate paths based on studentid and test_type', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      await reportsModel.create(mockData, mockFile, bucket);

      const uploadedPath = require('../../middleware/storage').upload.mock.calls[0][0];
      expect(uploadedPath).toMatch(/^1\/Midterm_\d+$/); // Should start with studentid/test_type_timestamp
    });

    it('should generate unique paths for different test types', async () => {
      const testTypes = ['Midterm', 'Final', 'Quiz'];
      const mockData = {
        gradeid: '1',
        studentid: '1'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      // Create files for different test types
      for (const testType of testTypes) {
        await reportsModel.create({ ...mockData, test_type: testType }, mockFile, bucket);
      }

      const uploadedPaths = require('../../middleware/storage').upload.mock.calls.map(call => call[0]);

      // All paths should be unique
      const uniquePaths = new Set(uploadedPaths);
      expect(uniquePaths.size).toBe(3);

      // All paths should contain the correct test type
      uploadedPaths.forEach((path, index) => {
        expect(path).toContain(testTypes[index]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during file operations', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';

      // Mock network error during upload
      require('../../middleware/storage').upload.mockRejectedValue(new Error('Network error'));

      await expect(reportsModel.create(mockData, mockFile, bucket)).rejects.toThrow('Network error');
    });

    it('should handle database connection errors', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';

      // Mock successful storage operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      // Mock database connection error
      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      await expect(reportsModel.create(mockData, mockFile, bucket)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Data Validation', () => {
    it('should handle missing data gracefully', async () => {
      const mockData = {}; // Missing all required fields

      const mockFile = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      };

      const bucket = 'reports';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      const result = await reportsModel.create(mockData, mockFile, bucket);

      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        studentid: undefined,
        gradeid: undefined,
        path: expect.any(String),
        url: 'https://example.com/file.pdf'
      });
    });

    it('should handle missing file buffer', async () => {
      const mockData = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm'
      };

      const mockFile = {
        mimetype: 'application/pdf'
        // Missing buffer
      };

      const bucket = 'reports';

      // Mock successful operations
      require('../../middleware/storage').upload.mockResolvedValue();
      require('../../middleware/storage').getPublicUrl.mockResolvedValue('https://example.com/file.pdf');

      const mockSupabaseQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };

      require('../../config/supabase').from.mockReturnValue(mockSupabaseQuery);

      await expect(reportsModel.create(mockData, mockFile, bucket))
        .rejects.toThrow('File buffer is required');
    });
  });
});
