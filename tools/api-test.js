// DeepSeek API 测试和诊断工具
require('dotenv').config();
const { config } = require('../config.js');
const OpenAI = require('openai');

class APITester {
  constructor() {
    console.log('🔧 API诊断工具启动...\n');
  }

  async runDiagnostics() {
    console.log('📋 API配置检查:');
    console.log(`   API密钥: ${config.deepseek.apiKey ? '已设置 (' + config.deepseek.apiKey.substring(0, 8) + '...)' : '❌ 未设置'}`);
    console.log(`   Base URL: ${config.deepseek.baseURL}`);
    console.log(`   默认模型: ${config.deepseek.defaultModel}\n`);

    if (!config.deepseek.apiKey || config.deepseek.apiKey === 'sk-your-api-key-here') {
      console.log('❌ API密钥未正确配置');
      return false;
    }

    console.log('🧪 测试API连接...');
    
    try {
      const client = new OpenAI({
        baseURL: config.deepseek.baseURL,
        apiKey: config.deepseek.apiKey
      });

      // 尝试简单的API调用
      const response = await client.chat.completions.create({
        model: 'deepseek-chat', // 使用快速模型进行测试
        messages: [
          {
            role: "user",
            content: "Hello, this is a test message. Please respond with 'API connection successful'."
          }
        ],
        max_tokens: 50
      });

      console.log('✅ API连接成功!');
      console.log(`📝 响应内容: ${response.choices[0].message.content}`);
      console.log(`🤖 使用模型: ${response.model}`);
      console.log(`💰 Token使用: ${JSON.stringify(response.usage)}`);
      
      return true;

    } catch (error) {
      console.log('❌ API连接失败:');
      console.log(`   错误类型: ${error.constructor.name}`);
      console.log(`   错误代码: ${error.status || '未知'}`);
      console.log(`   错误信息: ${error.message}`);
      
      if (error.status === 401) {
        console.log('\n🔍 401错误分析:');
        console.log('   - API密钥可能无效或已过期');
        console.log('   - 请检查DeepSeek账户状态');
        console.log('   - 确认密钥是否正确复制');
      } else if (error.status === 429) {
        console.log('\n🔍 429错误分析:');
        console.log('   - API调用频率过高');
        console.log('   - 账户可能超出限额');
      } else if (error.status === 403) {
        console.log('\n🔍 403错误分析:');
        console.log('   - 账户权限不足');
        console.log('   - 可能需要充值或升级');
      }
      
      return false;
    }
  }

  async testFengshuiAnalysis() {
    console.log('\n🏠 测试风水分析功能...');
    
    const testData = {
      houseType: '住宅',
      direction: '正南',
      area: '100',
      layout: '三室两厅',
      purpose: '居住',
      concerns: '测试分析'
    };

    try {
      const client = new OpenAI({
        baseURL: config.deepseek.baseURL,
        apiKey: config.deepseek.apiKey
      });

      const response = await client.chat.completions.create({
        model: config.deepseek.defaultModel,
        messages: [
          {
            role: "system",
            content: "你是一位专业的风水分析师。"
          },
          {
            role: "user",
            content: `请简要分析这套房屋的风水：${JSON.stringify(testData)}`
          }
        ],
        max_tokens: 200
      });

      console.log('✅ 风水分析测试成功!');
      console.log(`📊 分析预览: ${response.choices[0].message.content.substring(0, 100)}...`);
      
      return true;

    } catch (error) {
      console.log('❌ 风水分析测试失败:', error.message);
      return false;
    }
  }

  async suggestSolutions() {
    console.log('\n💡 解决方案建议:');
    console.log('1. 检查API密钥格式 (应以sk-开头)');
    console.log('2. 登录DeepSeek控制台验证账户状态');
    console.log('3. 确认账户余额充足');
    console.log('4. 检查网络连接是否正常');
    console.log('5. 尝试重新生成API密钥');
    console.log('\n🔗 DeepSeek控制台: https://platform.deepseek.com/');
  }
}

// 运行诊断
async function runTest() {
  const tester = new APITester();
  
  const basicTest = await tester.runDiagnostics();
  
  if (basicTest) {
    await tester.testFengshuiAnalysis();
    console.log('\n🎉 所有测试通过！系统准备就绪。');
  } else {
    await tester.suggestSolutions();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = APITester; 