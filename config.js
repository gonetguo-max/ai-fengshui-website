// AI风水网站配置文件
// 用于管理API密钥和环境变量

require('dotenv').config();

const config = {
  // DeepSeek API配置 (主力模型)
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-your-api-key-here',
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    models: {
      chat: 'deepseek-chat',        // DeepSeek-V3-0324 - 日常对话和快速分析
      reasoner: 'deepseek-reasoner' // DeepSeek-R1-0528 - 深度思考和复杂推理
    },
    // 默认使用深度思考模型
    defaultModel: process.env.DEEPSEEK_DEFAULT_MODEL || 'deepseek-reasoner'
  },

  // Qwen3 API配置 (备选模型)
  qwen3: {
    apiKey: process.env.QWEN3_API_KEY || 'sk-d1b092b7a3b943eda549cffb0f0e4f20',
    baseURL: process.env.QWEN3_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: {
      turbo: 'qwen-turbo',          // Qwen3-Turbo - 快速响应
      plus: 'qwen-plus',            // Qwen3-Plus - 平衡性能
      max: 'qwen-max'               // Qwen3-Max - 最强性能
    },
    defaultModel: process.env.QWEN3_DEFAULT_MODEL || 'qwen-max'
  },

  // AI模型选择策略
  aiStrategy: {
    primaryProvider: 'qwen3',       // 🚀 调整为主力模型 (性能优势48%)
    fallbackProvider: 'deepseek',  // DeepSeek作为备选
    enableFallback: true,          // 启用自动回退
    speedTestMode: false,          // 速度测试模式
    parallelAnalysis: false,       // 并行分析模式 (同时调用两个模型对比)
    performanceOptimized: true     // 性能优化模式 (优先选择更快的模型)
  },

  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development'
  },

  // 风水分析配置
  fengshui: {
    maxAnalysisLength: 2000,  // 最大分析文本长度
    maxApiCalls: 100,         // 每日API调用限制
    cacheTimeout: 3600        // 缓存超时时间(秒)
  }
};

// 验证必需的配置
function validateConfig() {
  const deepseekValid = config.deepseek.apiKey && config.deepseek.apiKey !== 'sk-your-api-key-here';
  const qwen3Valid = config.qwen3.apiKey && config.qwen3.apiKey !== 'sk-your-api-key-here';

  if (!deepseekValid && !qwen3Valid) {
    console.warn('⚠️  警告: 所有AI模型API密钥未设置');
    console.log('📝 请按照以下步骤设置至少一个API密钥:');
    console.log('1. 创建 .env 文件在项目根目录');
    console.log('2. 添加 DeepSeek: DEEPSEEK_API_KEY=你的密钥');
    console.log('3. 或添加 Qwen3: QWEN3_API_KEY=你的密钥');
    console.log('4. 重启应用程序');
    return false;
  }

  if (deepseekValid) {
    console.log('✅ DeepSeek API 配置有效 (主力模型)');
  }
  
  if (qwen3Valid) {
    console.log('✅ Qwen3 API 配置有效 (备选模型)');
  }

  return true;
}

module.exports = {
  config,
  validateConfig
}; 