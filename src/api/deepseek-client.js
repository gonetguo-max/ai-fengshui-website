// DeepSeek API 客户端 - 支持智能模型选择
const { config } = require('../../config.js');
const OpenAI = require('openai');

class DeepSeekClient {
  constructor() {
    // 只有在API密钥有效时才初始化客户端
    if (config.deepseek.apiKey && config.deepseek.apiKey !== 'sk-your-api-key-here') {
      this.client = new OpenAI({
        baseURL: config.deepseek.baseURL,
        apiKey: config.deepseek.apiKey
      });
      this.hasValidClient = true;
    } else {
      this.client = null;
      this.hasValidClient = false;
      console.log('⚠️ DeepSeek API密钥未配置，将使用演示模式');
    }
  }

  /**
   * 智能分析 - 根据任务复杂度自动选择模型
   * @param {string} prompt - 分析提示
   * @param {object} options - 配置选项
   * @returns {Promise<string>} 分析结果
   */
  async analyze(prompt, options = {}) {
    // 如果没有有效的客户端，返回演示模式响应
    if (!this.hasValidClient) {
      console.log('🎭 使用演示模式生成分析结果');
      return this.generateDemoAnalysis(prompt, options);
    }

    const {
      model = config.deepseek.defaultModel, // 默认使用深度思考模型
      temperature = 0.7,
      maxTokens = 2000,
      forceDeepThinking = true // 强制使用深度思考
    } = options;

    // 根据任务类型选择最佳模型
    const selectedModel = this.selectOptimalModel(prompt, model, forceDeepThinking);

    try {
      console.log(`🧠 使用模型: ${selectedModel} ${selectedModel === 'deepseek-reasoner' ? '(深度思考模式)' : '(快速响应模式)'}`);
      
      const response = await this.client.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(selectedModel)
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      });

      return {
        content: response.choices[0].message.content,
        model: response.model,
        usage: response.usage,
        finishReason: response.choices[0].finish_reason
      };

    } catch (error) {
      console.error('❌ DeepSeek API调用失败:', error.message);
      
      // API失败时自动回退到演示模式
      if (error.status === 401 || error.status === 403) {
        console.log('🔄 API认证失败，自动切换到演示模式');
        this.hasValidClient = false; // 标记为无效，后续请求直接使用演示模式
        return this.generateDemoAnalysis(prompt, options);
      }
      
      // 其他错误也尝试使用演示模式
      console.log('🔄 API调用异常，使用演示模式继续服务');
      return this.generateDemoAnalysis(prompt, options);
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
      model: 'deepseek-reasoner', // 风水分析强制使用深度思考
      temperature: 0.8,
      maxTokens: 2000, // 降低token限制避免terminated错误
      forceDeepThinking: true
    });
  }

  /**
   * 选择最佳模型
   * @param {string} prompt - 提示内容
   * @param {string} preferredModel - 首选模型
   * @param {boolean} forceDeepThinking - 强制深度思考
   * @returns {string} 选定的模型
   */
  selectOptimalModel(prompt, preferredModel, forceDeepThinking) {
    // 如果强制深度思考，直接返回reasoner模型
    if (forceDeepThinking) {
      return config.deepseek.models.reasoner;
    }

    // 检测是否需要复杂推理
    const complexityKeywords = [
      '分析', '计算', '推理', '评估', '建议', '方案',
      '风水', '五行', '八卦', '命理', '布局', '调整'
    ];

    const isComplex = complexityKeywords.some(keyword => 
      prompt.includes(keyword)
    ) || prompt.length > 200;

    return isComplex ? 
      config.deepseek.models.reasoner : 
      (preferredModel || config.deepseek.models.chat);
  }

  /**
   * 获取系统提示
   * @param {string} model - 模型名称
   * @returns {string} 系统提示
   */
  getSystemPrompt(model) {
    const basePrompt = `你是一位专业的AI风水分析师，具备深厚的中华传统文化底蕴和现代建筑学知识。`;
    
    if (model === config.deepseek.models.reasoner) {
      return `${basePrompt}

请进行深度思考和详细分析：
1. 仔细分析问题的各个维度
2. 结合传统风水理论和现代实用性
3. 提供具体可行的解决方案
4. 考虑不同情况下的多种可能性
5. 给出充分的理论依据和实践建议

请用中文回答，语言专业但易懂。`;
    } else {
      return `${basePrompt}

请提供准确、简洁的风水分析建议。用中文回答，语言专业但易懂。`;
    }
  }

  /**
   * 构建风水分析提示
   * @param {string} query - 用户问题
   * @param {object} context - 分析上下文
   * @returns {string} 完整的分析提示
   */
  buildFengshuiPrompt(query, context) {
    let prompt = `风水分析：${query}`;

    if (context.houseType) {
      prompt += `\n类型：${context.houseType}`;
    }
    if (context.direction) {
      prompt += `\n朝向：${context.direction}`;
    }
    if (context.area) {
      prompt += `\n面积：${context.area}平米`;
    }

    prompt += `\n\n请简要分析：\n1.方位五行\n2.布局建议\n3.改善措施\n\n提供简洁实用的建议，控制在500字内。`;

    return prompt;
  }

  /**
   * 演示模式分析（当API密钥未配置时使用）
   * @param {string} prompt - 分析提示
   * @param {object} options - 配置选项
   * @returns {Promise<object>} 演示分析结果
   */
  async generateDemoAnalysis(prompt, options = {}) {
    // 模拟分析延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 随机生成合理的风水评分（50-85分）
    const score = 65 + Math.floor(Math.random() * 20);

    const demoAnalysis = `根据您提供的房屋信息，我为您进行了全面的风水分析：

【方位分析】
正西朝向属兑卦，五行属金，适合从事金融、艺术相关行业的居住者。虽然下午会有西晒问题，但整体格局尚可接受。兑卦在八卦理论中代表口才与交际能力，居住在此朝向的房屋有利于人际关系的发展和事业中的沟通协调。西方属金，与秋季收获的季节相应，象征着成果和财富的积累。

【布局优化建议】
针对当前的户型布局进行分析，四室两厅两卫的配置较为理想，空间分配合理。120平方米的面积属于中等偏上的户型规模，适合三口至四口之家居住。各功能区域的分布得当，符合现代家庭生活的实际需求。建议客厅设置在采光最好的区域，卧室要注意隐私性和安静程度。

【具体改善措施】
为了进一步优化居住环境的风水效果，可以采取以下几个方面的改善措施。首先在东南角财位区域摆放生机勃勃的绿色植物，比如发财树、富贵竹或者金钱树，这些植物不仅能够净化空气，更能够催旺财运。其次要保持玄关区域的明亮整洁，确保财气能够顺利进入室内。第三要避免在财位摆放垃圾桶或者堆放杂物，保持此区域的清洁和良好通风。第四可以在客厅适当增加一些金色或者黄色的装饰元素，与西方的金属性相呼应。

【时间建议】
进行风水调整的最佳时机建议选择在农历三月或者八月，这两个月份金气最旺，有利于西方朝向房屋的气场调整。需要避免在农历六月进行大规模的空间调整，因为此时火气旺盛容易与金形成冲克。日常的小幅调整可以选择在上午8点到10点之间进行，此时阳气渐盛，有利于新布局的稳定和气场的和谐。

【注意事项】
在日常居住和装饰过程中需要注意以下几个重要方面。要避免在正西方向摆放过多的红色装饰物品，因为红色五行属火，容易与西方的金形成火克金的不利格局。要特别注意下午时段的西晒问题，可以适当进行遮挡或者选用淡蓝色系的窗帘来调和过强的阳光。建议定期进行居住空间的净化工作，保持良好的室内气场流动。

本次分析完全基于传统风水理论，同时结合了现代生活的实际需求，以上建议仅供您参考使用。需要明确的是，任何居住环境都有持续改善的空间，关键在于循序渐进的优化过程。`;

    return {
      content: demoAnalysis,
      model: 'demo-analysis-v1.0',
      usage: { prompt_tokens: 150, completion_tokens: 350, total_tokens: 500 },
      finishReason: 'stop'
    };
  }

  /**
   * 获取模型信息
   * @returns {object} 当前配置的模型信息
   */
  getModelInfo() {
    return {
      defaultModel: config.deepseek.defaultModel,
      availableModels: config.deepseek.models,
      modelDescriptions: {
        'deepseek-chat': 'DeepSeek-V3-0324 - 快速响应，适合日常对话',
        'deepseek-reasoner': 'DeepSeek-R1-0528 - 深度思考，适合复杂分析'
      },
      hasValidClient: this.hasValidClient
    };
  }
}

module.exports = DeepSeekClient; 