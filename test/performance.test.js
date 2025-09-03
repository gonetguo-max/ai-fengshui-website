const autocannon = require('autocannon');
const app = require('../server');

describe('Performance Tests', () => {
  let server;
  
  beforeAll((done) => {
    server = app.listen(3000, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should handle 100 concurrent requests', (done) => {
    const instance = autocannon({
      url: 'http://localhost:3000/api/analyze',
      connections: 100,
      duration: 10,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        houseType: '住宅',
        direction: '坐北朝南'
      })
    });

    instance.on('done', (result) => {
      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.latency.p99).toBeLessThan(2000);
      done();
    });
  });
});