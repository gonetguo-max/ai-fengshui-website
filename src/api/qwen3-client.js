// Qwen3 API 客户端 - 备选AI模型
const { config } = require('../../config.js');
const OpenAI = require('openai');

class Qwen3Client {
  constructor() {
    // 检查API密钥是否配置
    if (config.qwen3.apiKey && config.qwen3.apiKey !== 'sk-your-api-key-here') {
      this.client = new OpenAI({
        baseURL: config.qwen3.baseURL,
        apiKey: config.qwen3.apiKey
      });
      this.hasValidClient = true;
      console.log('🚀 Qwen3 客户端初始化成功');
    } else {
      this.client = null;
      this.hasValidClient = false;
      console.log('⚠️ Qwen3 API密钥未配置');
    }
  }

  /**
   * 智能分析 - Qwen3模型分析
   * @param {string} prompt - 分析提示
   * @param {object} options - 配置选项
   * @returns {Promise<object>} 分析结果
   */
  async analyze(prompt, options = {}) {
    if (!this.hasValidClient) {
      throw new Error('Qwen3 API客户端未正确配置');
    }

    const {
      model = config.qwen3.defaultModel,
      temperature = 0.7,
      maxTokens = 2000,
      enableThinking = true // Qwen3的思考模式
    } = options;

    try {
      console.log(`🧠 使用Qwen3模型: ${model}`);
      
      const startTime = Date.now();
      
      const response = await this.client.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: false
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        content: response.choices[0].message.content,
        model: response.model,
        usage: response.usage,
        finishReason: response.choices[0].finish_reason,
        responseTime: responseTime,
        provider: 'qwen3'
      };

    } catch (error) {
      console.error('❌ Qwen3 API调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 风水专家分析 - 专门用于风水相关分析
   * @param {string} query - 风水问题
   * @param {object} context - 分析上下文
   * @returns {Promise<object>} 风水分析结果
   */
  async analyzeFengshui(query, context = {}) {
    const prompt = this.buildFengshuiPrompt(query, context);
    
    return await this.analyze(prompt, {
      model: config.qwen3.defaultModel,
      temperature: 0.8,
      maxTokens: 6000,
      enableThinking: true
    });
  }

  /**
   * 构建风水分析提示词
   * @param {string} query - 用户查询
   * @param {object} context - 分析上下文
   * @returns {string} 完整的提示词
   */
  buildFengshuiPrompt(query, context) {
    const hasImage = context.hasImage || false;
    const language = context.language || 'zh';
    
    const basePrompt = language === 'en' ? `
You are a professional Feng Shui master with deep expertise in traditional Chinese metaphysics, geomancy, and spatial energy analysis. Please provide a comprehensive Feng Shui analysis based on the following information.

**Analysis Request**: ${query}

**Context Information**:
- Analysis Type: ${context.houseType || context.roomType || 'General'}
- Direction: ${context.direction || 'Not specified'}
- Layout Features: ${JSON.stringify(context.layoutFeatures || [])}
- Concern Areas: ${JSON.stringify(context.concernAreas || [])}
- Has Image: ${hasImage ? 'Yes' : 'No'}

**Required Analysis Format**:
Please structure your analysis using the following 6-color block system with HTML markup:

1. **[SCORE_BLOCK]** - Overall Score (0-100) and Grade Level
2. **[DIRECTION_BLOCK]** - Directional Analysis and Recommendations  
3. **[LAYOUT_BLOCK]** - Layout and Spatial Analysis
4. **[OPTIMIZATION_BLOCK]** - Improvement Suggestions
5. **[TIMING_BLOCK]** - Optimal Timing for Changes
6. **[WARNING_BLOCK]** - Important Precautions and Taboos

Each block should be detailed, professional, and based on traditional Feng Shui principles.
` : `
你是一位资深的风水大师，精通传统中国玄学、风水学和空间能量分析。请基于以下信息提供专业的风水分析。

**分析请求**: ${query}

**背景信息**:
- 分析类型: ${context.houseType || context.roomType || '通用分析'}
- 入户朝向: ${context.direction || '未指定'}
- 布局特征: ${JSON.stringify(context.layoutFeatures || [])}
- 关注区域: ${JSON.stringify(context.concernAreas || [])}
- 是否有图片: ${hasImage ? '是' : '否'}

**分析要求**:
请使用以下六色区块系统进行结构化分析，并使用HTML标记：

1. **[分数区块]** - 整体评分(0-100分)及等级评定
2. **[朝向区块]** - 方位分析及建议
3. **[布局区块]** - 格局及空间分析  
4. **[优化区块]** - 改善建议
5. **[时机区块]** - 最佳改善时机
6. **[禁忌区块]** - 重要注意事项及禁忌

每个区块都应详细、专业，基于传统风水理论。
`;

    return basePrompt;
  }

  /**
   * 获取系统提示词
   * @returns {string} 系统提示词
   */
  getSystemPrompt() {
    return `你是一位专业的AI风水大师，具备深厚的传统中国风水学知识。你的分析基于：

🏺 **经典理论基础**：
- 三元九运玄空风水学
- 八卦方位理论
- 五行相生相克
- 峦头理气综合分析

🎯 **分析特点**：
- 科学理性的传统智慧解读
- 实用性强的改善建议
- 结合现代生活的风水应用
- 避免迷信色彩，注重居住舒适度

🌟 **服务原则**：
- 提供准确的风水分析
- 给出可操作的改善方案
- 尊重不同文化背景
- 保持专业和负责任的态度

请始终以专业、客观、实用的方式进行风水分析。`;
  }

  /**
   * 测试API连接
   * @returns {Promise<boolean>} 连接是否成功
   */
  async testConnection() {
    if (!this.hasValidClient) {
      return false;
    }

    try {
      const response = await this.analyze('测试连接', {
        model: 'qwen-turbo',
        maxTokens: 50
      });
      
      console.log('✅ Qwen3 API连接测试成功');
      return true;
    } catch (error) {
      console.error('❌ Qwen3 API连接测试失败:', error.message);
      return false;
    }
  }
}

module.exports = Qwen3Client; 