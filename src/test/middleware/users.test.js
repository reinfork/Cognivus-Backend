const authorizeUser = require('../../middleware/users');

describe('User Authorization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: undefined,
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Student Role', () => {
    beforeEach(() => {
      req.user = {
        id: 'student-id',
        role: 'student'
      };
    });

    it('should allow student to access their own data', () => {
      req.params.id = 'student-id';
      
      authorizeUser(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should deny student access to other user data', () => {
      req.params.id = 'other-id';
      
      authorizeUser(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: you can only access your own data.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with query parameters instead of route parameters', () => {
      req.query.id = 'student-id';
      
      authorizeUser(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Teacher Role', () => {
    beforeEach(() => {
      req.user = {
        id: 'teacher-id',
        role: 'teacher'
      };
    });

    it('should allow teacher to access any user data', () => {
      req.params.id = 'student-id';
      
      authorizeUser(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      req.user = {
        id: 'admin-id',
        role: 'admin'
      };
    });

    it('should allow admin to access any user data', () => {
      req.params.id = 'student-id';
      
      authorizeUser(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Default Access', () => {
    beforeEach(() => {
      req.user = {
        id: 'user-id',
        role: 'unknown'
      };
    });

    it('should deny access for unknown roles accessing other users', () => {
      req.params.id = 'other-id';
      
      authorizeUser(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow access to own data regardless of role', () => {
      req.params.id = 'user-id';
      
      authorizeUser(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});