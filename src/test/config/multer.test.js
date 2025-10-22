const multer = require('multer');

jest.mock('multer', () => {
  const mockMemoryStorage = jest.fn();
  const mockMulter = jest.fn(() => 'multer-instance');
  mockMulter.memoryStorage = jest.fn(() => mockMemoryStorage);
  return mockMulter;
});

describe('Multer Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should configure multer with memory storage', () => {
    const config = require('../../config/multer');
    
    expect(multer.memoryStorage).toHaveBeenCalled();
    expect(multer).toHaveBeenCalledWith({
      storage: multer.memoryStorage()
    });
    expect(config).toBe('multer-instance');
  });
});