// AI管理器 - 智能模型选择和切换系统
const { config } = require('../../config.js');
const DeepSeekClient = require('./deepseek-client.js');
const Qwen3Client = require('./qwen3-client.js');

class AIManager {
  constructor() {
    // 初始化所有AI客户端
    this.deepseekClient = new DeepSeekClient();
    this.qwen3Client = new Qwen3Client();
    
    // 性能统计
    this.performanceStats = {
      deepseek: { calls: 0, totalTime: 0, errors: 0, avgTime: 0 },
      qwen3: { calls: 0, totalTime: 0, errors: 0, avgTime: 0 }
    };

    // 可用性状态
    this.availability = {
      deepseek: this.deepseekClient.hasValidClient,
      qwen3: this.qwen3Client.hasValidClient
    };

    console.log('🎯 AI管理器初始化完成');
    console.log(`✅ 可用模型: DeepSeek=${this.availability.deepseek}, Qwen3=${this.availability.qwen3}`);
  }

  /**
   * 智能风水分析 - 自动选择最佳模型
   * @param {string} query - 分析查询
   * @param {object} context - 分析上下文
   * @param {object} options - 配置选项
   * @returns {Promise<object>} 分析结果
   */
  async analyzeFengshui(query, context = {}, options = {}) {
    const {
      forceProvider = null,      // 强制使用指定提供商
      enableFallback = config.aiStrategy.enableFallback,
      enableSpeedTest = config.aiStrategy.speedTestMode,
      enableParallel = config.aiStrategy.parallelAnalysis
    } = options;

    // 如果启用并行分析模式
    if (enableParallel && this.availability.deepseek && this.availability.qwen3) {
      return await this.parallelAnalysis(query, context);
    }

    // 如果启用速度测试模式
    if (enableSpeedTest && this.availability.deepseek && this.availability.qwen3) {
      return await this.speedTestAnalysis(query, context);
    }

    // 选择最佳提供商
    const provider = forceProvider || this.selectBestProvider();
    
    try {
      console.log(`🎯 选择AI提供商: ${provider.toUpperCase()}`);
      
      const startTime = Date.now();
      let result;

      if (provider === 'deepseek') {
        result = await this.deepseekClient.analyzeFengshui(query, context);
      } else if (provider === 'qwen3') {
        result = await this.qwen3Client.analyzeFengshui(query, context);
      } else {
        throw new Error(`未知的AI提供商: ${provider}`);
      }

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 更新性能统计
      this.updateStats(provider, responseTime, false);

      return {
        ...result,
        provider: provider,
        responseTime: responseTime,
        fallbackUsed: false
      };

    } catch (error) {
      console.error(`❌ ${provider} 分析失败:`, error.message);
      
      // 更新错误统计
      this.updateStats(provider, 0, true);

      // 如果启用回退且有备选方案
      if (enableFallback) {
        const fallbackProvider = this.getFallbackProvider(provider);
        if (fallbackProvider && this.availability[fallbackProvider]) {
          console.log(`🔄 自动切换到备选模型: ${fallbackProvider.toUpperCase()}`);
          
          try {
            const startTime = Date.now();
            let fallbackResult;

            if (fallbackProvider === 'deepseek') {
              fallbackResult = await this.deepseekClient.analyzeFengshui(query, context);
            } else {
              fallbackResult = await this.qwen3Client.analyzeFengshui(query, context);
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            this.updateStats(fallbackProvider, responseTime, false);

            return {
              ...fallbackResult,
              provider: fallbackProvider,
              responseTime: responseTime,
              fallbackUsed: true,
              originalProvider: provider
            };

          } catch (fallbackError) {
            console.error(`❌ 备选模型 ${fallbackProvider} 也失败:`, fallbackError.message);
            this.updateStats(fallbackProvider, 0, true);
          }
        }
      }

      // 所有模型都失败，抛出错误
      throw new Error(`所有AI模型都不可用: ${error.message}`);
    }
  }

  /**
   * 并行分析 - 同时调用两个模型进行对比
   * @param {string} query - 分析查询
   * @param {object} context - 分析上下文
   * @returns {Promise<object>} 并行分析结果
   */
  async parallelAnalysis(query, context) {
    console.log('🚀 启动并行分析模式 (DeepSeek + Qwen3)');

    const promises = [];
    
    if (this.availability.deepseek) {
      promises.push(
        this.deepseekClient.analyzeFengshui(query, context)
          .then(result => ({ ...result, provider: 'deepseek' }))
          .catch(error => ({ error: error.message, provider: 'deepseek' }))
      );
    }

    if (this.availability.qwen3) {
      promises.push(
        this.qwen3Client.analyzeFengshui(query, context)
          .then(result => ({ ...result, provider: 'qwen3' }))
          .catch(error => ({ error: error.message, provider: 'qwen3' }))
      );
    }

    const results = await Promise.all(promises);
    
    // 处理并行结果
    const successResults = results.filter(r => !r.error);
    const errorResults = results.filter(r => r.error);

    if (successResults.length === 0) {
      throw new Error('所有模型在并行分析中都失败了');
    }

    // 选择最快的成功结果作为主要结果
    const primaryResult = successResults.reduce((fastest, current) => {
      return (current.responseTime || 0) < (fastest.responseTime || Infinity) ? current : fastest;
    });

    return {
      ...primaryResult,
      analysisMode: 'parallel',
      allResults: results,
      successCount: successResults.length,
      errorCount: errorResults.length
    };
  }

  /**
   * 速度测试分析 - 对比两个模型的性能
   * @param {string} query - 分析查询
   * @param {object} context - 分析上下文
   * @returns {Promise<object>} 速度测试结果
   */
  async speedTestAnalysis(query, context) {
    console.log('⚡ 启动速度测试模式');

    // 简化的测试查询
    const testQuery = '请简要分析这个住宅的风水情况';
    const testContext = { ...context, speedTest: true };

    const results = {};
    
    // 测试DeepSeek
    if (this.availability.deepseek) {
      try {
        const startTime = Date.now();
        await this.deepseekClient.analyzeFengshui(testQuery, testContext);
        results.deepseek = Date.now() - startTime;
      } catch (error) {
        results.deepseek = null;
      }
    }

    // 测试Qwen3
    if (this.availability.qwen3) {
      try {
        const startTime = Date.now();
        await this.qwen3Client.analyzeFengshui(testQuery, testContext);
        results.qwen3 = Date.now() - startTime;
      } catch (error) {
        results.qwen3 = null;
      }
    }

    // 选择更快的模型进行实际分析
    const fasterProvider = this.selectFasterProvider(results);
    console.log(`⚡ 速度测试结果: ${JSON.stringify(results)}ms, 选择: ${fasterProvider}`);

    // 使用更快的模型进行实际分析
    return await this.analyzeFengshui(query, context, { 
      forceProvider: fasterProvider,
      enableFallback: true 
    });
  }

  /**
   * 选择最佳提供商
   * @returns {string} 提供商名称
   */
  selectBestProvider() {
    const primary = config.aiStrategy.primaryProvider;
    const fallback = config.aiStrategy.fallbackProvider;

    // 首选主力模型
    if (this.availability[primary]) {
      return primary;
    }

    // 回退到备选模型
    if (this.availability[fallback]) {
      console.log(`🔄 主力模型不可用，使用备选模型: ${fallback}`);
      return fallback;
    }

    // 查找任何可用的模型
    for (const [provider, available] of Object.entries(this.availability)) {
      if (available) {
        console.log(`🔄 使用可用模型: ${provider}`);
        return provider;
      }
    }

    throw new Error('没有可用的AI模型');
  }

  /**
   * 获取备选提供商
   * @param {string} currentProvider - 当前提供商
   * @returns {string|null} 备选提供商
   */
  getFallbackProvider(currentProvider) {
    if (currentProvider === 'deepseek') return 'qwen3';
    if (currentProvider === 'qwen3') return 'deepseek';
    return null;
  }

  /**
   * 选择更快的提供商
   * @param {object} speedResults - 速度测试结果
   * @returns {string} 更快的提供商
   */
  selectFasterProvider(speedResults) {
    const validResults = Object.entries(speedResults).filter(([_, time]) => time !== null);
    
    if (validResults.length === 0) {
      return this.selectBestProvider();
    }

    // 返回耗时最短的提供商
    return validResults.reduce((fastest, [provider, time]) => {
      return time < speedResults[fastest] ? provider : fastest;
    }, validResults[0][0]);
  }

  /**
   * 更新性能统计
   * @param {string} provider - 提供商
   * @param {number} responseTime - 响应时间
   * @param {boolean} isError - 是否出错
   */
  updateStats(provider, responseTime, isError) {
    const stats = this.performanceStats[provider];
    if (!stats) return;

    stats.calls++;
    
    if (isError) {
      stats.errors++;
    } else {
      stats.totalTime += responseTime;
      stats.avgTime = stats.totalTime / (stats.calls - stats.errors);
    }
  }

  /**
   * 获取性能统计
   * @returns {object} 性能统计数据
   */
  getPerformanceStats() {
    return {
      ...this.performanceStats,
      availability: this.availability,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 测试所有模型连接
   * @returns {Promise<object>} 连接测试结果
   */
  async testAllConnections() {
    const results = {};
    
    console.log('🔍 测试所有AI模型连接...');
    
    // 测试DeepSeek
    if (this.availability.deepseek) {
      try {
        await this.deepseekClient.analyze('测试', { maxTokens: 10 });
        results.deepseek = { status: 'success', message: '连接正常' };
      } catch (error) {
        results.deepseek = { status: 'error', message: error.message };
        this.availability.deepseek = false;
      }
    } else {
      results.deepseek = { status: 'unavailable', message: 'API密钥未配置' };
    }

    // 测试Qwen3
    if (this.availability.qwen3) {
      try {
        await this.qwen3Client.testConnection();
        results.qwen3 = { status: 'success', message: '连接正常' };
      } catch (error) {
        results.qwen3 = { status: 'error', message: error.message };
        this.availability.qwen3 = false;
      }
    } else {
      results.qwen3 = { status: 'unavailable', message: 'API密钥未配置' };
    }

    return results;
  }
}

module.exports = AIManager; 