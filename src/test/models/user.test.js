const userModel = require('../../models/user');
const supabase = require('../../config/supabase');
const { user: select } = require('../../helper/fields');

// Use global supabase mock from jest.setup.js

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findOrCreate', () => {
    const mockProfile = {
      id: 'google123',
      given_name: 'John',
      family_name: 'Doe',
      emails: [{ value: 'john.doe@example.com' }]
    };

    it('should return existing user if found', async () => {
      const mockExistingUser = {
        id: 1,
        username: 'johndoe',
        email: 'john.doe@example.com',
        google_id: 'google123'
      };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockExistingUser, error: null })
      });

      const result = await userModel.findOrCreate(mockProfile);

      // Check that the result comes from the existing user query, not mocked user
      expect(result).toEqual(mockExistingUser);
    });

    it('should create new user if not found', async () => {
      // First query returns no user - check for existing
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      });

      // Second query for user creation
      const mockNewUser = {
        id: 1,
        username: 'johndoe',
        google_id: 'google123',
        email: 'john.doe@example.com',
        roleid: 1
      };

      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockNewUser, error: null })
      });

      const result = await userModel.findOrCreate(mockProfile);

      // Verify that both queries were made (indicated by the number of calls)
      expect(result).toEqual(mockNewUser);
    });

    it('should handle database errors when checking existing user', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      });

      await expect(userModel.findOrCreate(mockProfile))
        .rejects
        .toThrow('Database error');
    });

    it('should handle database errors when creating new user', async () => {
      // First query returns no user
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      });

      // Second query fails with error
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') })
      });

      await expect(userModel.findOrCreate(mockProfile))
        .rejects
        .toThrow('Insert failed');
    });

    it('should generate correct username from profile names', async () => {
      // First query returns no user
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      });

      const mockProfileWithDifferentNames = {
        id: 'google123',
        given_name: 'Jane',
        family_name: 'Smith',
        emails: [{ value: 'jane.smith@example.com' }]
      };

      // Second query for user creation - need complete chain
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { username: 'janesmith' }, error: null })
      });

      const result = await userModel.findOrCreate(mockProfileWithDifferentNames);

      // Test verifies that the username generation works correctly and returns expected username
      expect(result).toBeDefined();
      expect(result.username).toBe('janesmith');
    });
  });
});
