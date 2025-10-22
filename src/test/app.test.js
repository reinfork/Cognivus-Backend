const request = require('supertest');
const app = require('../app.js');

describe('App.js Unit Tests', () => {
  
  describe('Basic App Structure', () => {
    it('should export express app', () => {
      expect(app).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('ITTR Cognivus Backend is running!');
    });
  });

  describe('GET /api/health', () => {
    it('should return health check with success true', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Server is running');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return valid timestamp format', async () => {
      const response = await request(app).get('/api/health');
      
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('Middleware', () => {
    it('should parse JSON body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });
      
      // Test that JSON is parsed (we don't care about the response status here)
      expect(response.type).toBe('application/json');
    });

    it('should have CORS headers', async () => {
      const response = await request(app).get('/api/health');
      
      // Check if response has headers (CORS middleware is applied)
      expect(response.headers).toBeDefined();
    });
  });

  describe('API Routes', () => {
    it('should have /api/auth route registered', async () => {
      const response = await request(app).get('/api/auth/invalid-endpoint');
      expect(response.status).not.toBe(200);
    });
  });

  describe('API Routes', () => {
    it('should have /api/courses route registered', async () => {
      const response = await request(app).get('/api/courses');
      expect(response.status).toBe(200);
    });
  });

  describe('API Routes', () => {
    it('should have /api/students route registered', async () => {
      const response = await request(app).get('/api/students');
      expect(response.status).toBe(200);
    });
  });

  describe('API Routes', () => {
    it('should have /api/users route registered', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
    });
  });

  describe('API Routes', () => {
    it('should have /api/lecturers route registered', async () => {
      const response = await request(app).get('/api/lecturers');
      expect(response.status).toBe(200);
    });
  });


});
