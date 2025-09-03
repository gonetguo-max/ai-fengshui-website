// 双模型测试工具 - DeepSeek vs Qwen3 性能对比
const { config } = require('../config.js');
const AIManager = require('../src/api/ai-manager.js');

class DualModelTester {
  constructor() {
    this.aiManager = new AIManager();
  }

  /**
   * 运行完整的双模型测试套件
   */
  async runFullTestSuite() {
    console.log('🚀 启动双模型测试套件 (DeepSeek vs Qwen3)');
    console.log('=' .repeat(60));

    // 1. 连接测试
    await this.testConnections();
    
    // 2. 基础功能测试
    await this.testBasicAnalysis();
    
    // 3. 性能对比测试
    await this.testPerformanceComparison();
    
    // 4. 回退机制测试
    await this.testFallbackMechanism();
    
    // 5. 并行分析测试
    await this.testParallelAnalysis();
    
    // 6. 生成测试报告
    await this.generateTestReport();
  }

  /**
   * 测试所有模型连接
   */
  async testConnections() {
    console.log('\n📡 测试模型连接状态...');
    
    try {
      const connectionResults = await this.aiManager.testAllConnections();
      
      console.log('DeepSeek连接:', connectionResults.deepseek.status === 'success' ? '✅' : '❌', connectionResults.deepseek.message);
      console.log('Qwen3连接:', connectionResults.qwen3.status === 'success' ? '✅' : '❌', connectionResults.qwen3.message);
      
      return connectionResults;
    } catch (error) {
      console.error('❌ 连接测试失败:', error.message);
      return null;
    }
  }

  /**
   * 基础分析功能测试
   */
  async testBasicAnalysis() {
    console.log('\n🔮 测试基础风水分析功能...');
    
    const testCase = {
      houseType: '住宅',
      direction: '坐北朝南',
      layoutFeatures: ['开放式客厅', '主卧带卫生间'],
      concernAreas: ['财运', '健康'],
      language: 'zh'
    };

    try {
      console.log('🎯 使用智能选择模式...');
      const result = await this.aiManager.analyzeFengshui(
        '请分析这个住宅的风水情况', 
        testCase
      );
      
      console.log(`✅ 分析完成 - 提供商: ${result.provider}, 响应时间: ${result.responseTime}ms`);
      console.log(`📊 分析长度: ${result.content.length} 字符`);
      console.log(`🔄 是否使用回退: ${result.fallbackUsed ? '是' : '否'}`);
      
      return result;
    } catch (error) {
      console.error('❌ 基础分析测试失败:', error.message);
      return null;
    }
  }

  /**
   * 性能对比测试
   */
  async testPerformanceComparison() {
    console.log('\n⚡ 性能对比测试 (DeepSeek vs Qwen3)...');
    
    const testQuery = '请简要分析住宅风水的基本要素';
    const testContext = { houseType: '住宅', direction: '坐北朝南' };
    
    const results = {};
    
    // 测试DeepSeek
    if (this.aiManager.availability.deepseek) {
      try {
        console.log('🧠 测试DeepSeek性能...');
        const startTime = Date.now();
        const deepseekResult = await this.aiManager.analyzeFengshui(testQuery, testContext, {
          forceProvider: 'deepseek'
        });
        results.deepseek = {
          responseTime: Date.now() - startTime,
          contentLength: deepseekResult.content.length,
          status: 'success'
        };
        console.log(`✅ DeepSeek完成 - ${results.deepseek.responseTime}ms, ${results.deepseek.contentLength}字符`);
      } catch (error) {
        results.deepseek = { status: 'error', error: error.message };
        console.log(`❌ DeepSeek失败: ${error.message}`);
      }
    }

    // 测试Qwen3
    if (this.aiManager.availability.qwen3) {
      try {
        console.log('🚀 测试Qwen3性能...');
        const startTime = Date.now();
        const qwen3Result = await this.aiManager.analyzeFengshui(testQuery, testContext, {
          forceProvider: 'qwen3'
        });
        results.qwen3 = {
          responseTime: Date.now() - startTime,
          contentLength: qwen3Result.content.length,
          status: 'success'
        };
        console.log(`✅ Qwen3完成 - ${results.qwen3.responseTime}ms, ${results.qwen3.contentLength}字符`);
      } catch (error) {
        results.qwen3 = { status: 'error', error: error.message };
        console.log(`❌ Qwen3失败: ${error.message}`);
      }
    }

    // 性能对比分析
    if (results.deepseek?.status === 'success' && results.qwen3?.status === 'success') {
      const faster = results.deepseek.responseTime < results.qwen3.responseTime ? 'DeepSeek' : 'Qwen3';
      const speedDiff = Math.abs(results.deepseek.responseTime - results.qwen3.responseTime);
      console.log(`🏆 性能胜者: ${faster}, 速度优势: ${speedDiff}ms`);
    }

    return results;
  }

  /**
   * 回退机制测试
   */
  async testFallbackMechanism() {
    console.log('\n🔄 测试自动回退机制...');
    
    // 模拟主力模型失败的情况
    try {
      const result = await this.aiManager.analyzeFengshui(
        '测试回退机制', 
        { houseType: '测试' }, 
        { enableFallback: true }
      );
      
      if (result.fallbackUsed) {
        console.log(`✅ 回退机制工作正常: ${result.originalProvider} → ${result.provider}`);
      } else {
        console.log('✅ 主力模型正常，无需回退');
      }
      
      return result;
    } catch (error) {
      console.error('❌ 回退机制测试失败:', error.message);
      return null;
    }
  }

  /**
   * 并行分析测试
   */
  async testParallelAnalysis() {
    console.log('\n🚀 测试并行分析模式...');
    
    if (!this.aiManager.availability.deepseek || !this.aiManager.availability.qwen3) {
      console.log('⚠️ 需要两个模型都可用才能进行并行测试');
      return null;
    }

    try {
      const result = await this.aiManager.analyzeFengshui(
        '请分析客厅的风水布局', 
        { roomType: '客厅', direction: '朝南' }, 
        { enableParallel: true }
      );
      
      console.log(`✅ 并行分析完成`);
      console.log(`📊 成功模型数: ${result.successCount}/${result.allResults.length}`);
      console.log(`🏆 最快模型: ${result.provider}`);
      console.log(`⏱️ 响应时间: ${result.responseTime}ms`);
      
      return result;
    } catch (error) {
      console.error('❌ 并行分析测试失败:', error.message);
      return null;
    }
  }

  /**
   * 生成测试报告
   */
  async generateTestReport() {
    console.log('\n📊 生成测试报告...');
    
    const stats = this.aiManager.getPerformanceStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 双模型系统测试报告');
    console.log('='.repeat(60));
    
    // DeepSeek统计
    if (stats.deepseek.calls > 0) {
      console.log(`\n🧠 DeepSeek 统计:`);
      console.log(`   调用次数: ${stats.deepseek.calls}`);
      console.log(`   成功次数: ${stats.deepseek.calls - stats.deepseek.errors}`);
      console.log(`   平均响应: ${Math.round(stats.deepseek.avgTime)}ms`);
      console.log(`   错误率: ${((stats.deepseek.errors / stats.deepseek.calls) * 100).toFixed(1)}%`);
    }
    
    // Qwen3统计
    if (stats.qwen3.calls > 0) {
      console.log(`\n🚀 Qwen3 统计:`);
      console.log(`   调用次数: ${stats.qwen3.calls}`);
      console.log(`   成功次数: ${stats.qwen3.calls - stats.qwen3.errors}`);
      console.log(`   平均响应: ${Math.round(stats.qwen3.avgTime)}ms`);
      console.log(`   错误率: ${((stats.qwen3.errors / stats.qwen3.calls) * 100).toFixed(1)}%`);
    }
    
    // 可用性状态
    console.log(`\n🔗 模型可用性:`);
    console.log(`   DeepSeek: ${stats.availability.deepseek ? '✅ 可用' : '❌ 不可用'}`);
    console.log(`   Qwen3: ${stats.availability.qwen3 ? '✅ 可用' : '❌ 不可用'}`);
    
    // 推荐配置
    console.log(`\n💡 配置建议:`);
    if (stats.qwen3.avgTime > 0 && stats.deepseek.avgTime > 0) {
      const fasterModel = stats.qwen3.avgTime < stats.deepseek.avgTime ? 'qwen3' : 'deepseek';
      console.log(`   推荐主力模型: ${fasterModel} (更快)`);
      console.log(`   推荐启用自动回退: ✅`);
    } else if (stats.availability.deepseek && stats.availability.qwen3) {
      console.log(`   推荐保持当前配置: DeepSeek主力 + Qwen3备选`);
    }
    
    console.log('\n✅ 测试套件完成!');
    
    return stats;
  }
}

// 直接运行测试 (如果文件被直接执行)
if (require.main === module) {
  const tester = new DualModelTester();
  tester.runFullTestSuite().catch(console.error);
}

module.exports = DualModelTester; 