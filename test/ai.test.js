const AIManager = require('../src/api/ai-manager');
const FengShuiAnalyzer = require('../src/api/fengshui-analyzer');

describe('AI System Tests', () => {
  let aiManager;
  let analyzer;

  beforeEach(() => {
    aiManager = new AIManager();
    analyzer = new FengShuiAnalyzer();
  });

  describe('AIManager', () => {
    it('should select correct model', () => {
      const model = aiManager.selectModel({ complexity: 'high' });
      expect(model).toBe('deepseek');
    });

    it('should handle model failures', async () => {
      const result = await aiManager.analyze({ 
        text: 'test', 
        forceError: true 
      });
      expect(result.success).toBe(true);
      expect(result.modelUsed).toBe('qwen3');
    });
  });

  describe('FengShuiAnalyzer', () => {
    it('should generate correct grade', () => {
      const analysis = analyzer.analyze({
        houseType: '住宅',
        direction: '坐北朝南',
        features: ['采光好', '通风好']
      });
      expect(analysis.grade).toBeGreaterThanOrEqual(0);
      expect(analysis.grade).toBeLessThanOrEqual(95);
    });

    it('should handle image analysis', async () => {
      const analysis = await analyzer.analyzeImage('test/fixtures/house.jpg');
      expect(analysis).toHaveProperty('features');
      expect(analysis.features).toBeInstanceOf(Array);
    });
  });
});