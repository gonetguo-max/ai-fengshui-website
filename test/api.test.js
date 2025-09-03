const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
  describe('POST /api/analyze', () => {
    it('should analyze house feng shui', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .field('houseType', '住宅')
        .field('direction', '坐北朝南')
        .attach('image', 'test/fixtures/house.jpg');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('grade');
      expect(response.body).toHaveProperty('analysis');
    });

    it('should handle missing image', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .field('houseType', '住宅')
        .field('direction', '坐北朝南');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('grade');
    });
  });

  describe('GET /api/user-status', () => {
    it('should return user status', async () => {
      const response = await request(app).get('/api/user-status');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fingerprint');
      expect(response.body).toHaveProperty('requestCount');
    });
  });

  describe('GET /api/system-stats', () => {
    it('should return system statistics', async () => {
      const response = await request(app).get('/api/system-stats');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('requests');
    });
  });

  describe('GET /api/ai-stats', () => {
    it('should return AI performance stats', async () => {
      const response = await request(app).get('/api/ai-stats');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deepseek');
      expect(response.body).toHaveProperty('qwen3');
      expect(response.body).toHaveProperty('switchCount');
    });
  });
});