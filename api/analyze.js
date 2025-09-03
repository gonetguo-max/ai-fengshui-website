// Vercel无服务器函数 - 风水分析API
const multer = require('multer');
const FengShuiAnalyzer = require('../src/api/fengshui-analyzer.js');
const UserManager = require('../src/utils/user-manager.js');

// 配置multer用于处理文件上传
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB限制
});

// 创建分析器和用户管理器实例
const analyzer = new FengShuiAnalyzer();
const userManager = new UserManager();

// 处理文件上传的中间件
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    console.log('🚀 Vercel API函数启动，处理风水分析请求');
    console.log('📡 环境变量检查:');
    console.log(`   - DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? '✅ 已设置' : '❌ 未设置'}`);
    console.log(`   - QWEN3_API_KEY: ${process.env.QWEN3_API_KEY ? '✅ 已设置' : '❌ 未设置'}`);

    // 处理文件上传
    await runMiddleware(req, res, upload.single('photo'));

    console.log('📋 收到的表单数据:', {
      houseType: req.body.houseType,
      direction: req.body.direction,
      area: req.body.area,
      hasFile: !!req.file
    });

    // 生成用户指纹
    const fingerprint = userManager.generateFingerprint(req);
    console.log('👤 用户指纹:', fingerprint);

    // 获取分析参数
    const formData = {
      houseType: req.body.houseType || '住宅',
      direction: req.body.direction || '不确定',
      area: req.body.area || '不详',
      floorLevel: req.body.floorLevel || '不详',
      roomCount: req.body.roomCount || '不详',
      familySize: req.body.familySize || '不详',
      description: req.body.description || '',
      hasImage: !!req.file
    };

    const language = req.body.language || 'zh';
    const userTier = 'FREE'; // 目前所有用户都是免费版

    console.log('🔍 开始风水分析...');

    let analysisResult;
    try {
      // 调用AI分析
      analysisResult = await analyzer.analyzeWithAI(formData, req.file, language);
      console.log('✅ AI分析完成');
    } catch (error) {
      console.error('❌ AI分析失败:', error.message);
      console.log('🎭 使用样例分析模式');
      analysisResult = analyzer.generateSampleAnalysis(formData, language, userTier);
    }

    // 记录用户使用统计
    userManager.recordUsage(fingerprint, {
      hasImage: !!req.file,
      region: req.headers['cf-ipcountry'] || 'unknown',
      language: language
    });

    // 根据用户等级返回相应报告
    const finalResult = userManager.generateTieredReport(analysisResult, userTier);
    console.log(`🎉 返回${userTier}版分析报告`);

    // 添加用户统计信息
    finalResult.userStatus = userManager.getUserStats(fingerprint);

    res.status(200).json({
      success: true,
      data: finalResult
    });

  } catch (error) {
    console.error('❌ API函数执行失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      debug: {
        hasDeepSeekKey: !!(process.env.DEEPSEEK_API_KEY),
        hasQwen3Key: !!(process.env.QWEN3_API_KEY),
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        vercelFunction: true
      }
    });
  }
};