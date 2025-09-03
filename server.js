// AI风水网站服务器
const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { config, validateConfig } = require('./config.js');
const FengshuiAnalyzer = require('./src/api/fengshui-analyzer.js');
const UserManager = require('./src/utils/user-manager.js');
const { UserAuth } = require('./src/auth/user-auth.js');
const StripeProcessor = require('./src/payment/stripe-processor.js');


const app = express();
const PORT = config.server.port;

// 初始化风水分析器、用户管理器、认证系统和支付处理器
const analyzer = new FengshuiAnalyzer();
const userManager = new UserManager();
const userAuth = new UserAuth();
const stripeProcessor = new StripeProcessor();

// 中间件配置（必须在路由之前）
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 认证中间件
function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    // 没有token，设置为匿名用户
    req.user = { tier: 'FREE', isAnonymous: true };
    return next();
  }
  
  const session = userAuth.validateSession(token);
  if (session) {
    req.user = { 
      id: session.userId, 
      email: session.email, 
      tier: session.tier,
      isAnonymous: false 
    };
  } else {
    req.user = { tier: 'FREE', isAnonymous: true };
  }
  
  next();
}

// 用户认证API

/**
 * 用户注册
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const fingerprint = userManager.generateFingerprint(req);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱和密码'
      });
    }
    
    const result = await userAuth.register(email, password, fingerprint);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 用户登录
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱和密码'
      });
    }
    
    const result = await userAuth.login(email, password);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取用户信息
 */
app.get('/api/user/profile', authenticateUser, (req, res) => {
  try {
    if (req.user.isAnonymous) {
      return res.status(401).json({
        success: false,
        error: '请先登录'
      });
    }
    
    const user = userAuth.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    const stats = userAuth.getUserStats(req.user.id);
    
    res.json({
      success: true,
      data: {
        user,
        stats
      }
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

/**
 * 创建支付会话
 */
app.post('/api/payment/create-session', authenticateUser, async (req, res) => {
  try {
    if (req.user.isAnonymous) {
      return res.status(401).json({
        success: false,
        error: '请先登录'
      });
    }
    
    const { targetTier } = req.body;
    
    if (!targetTier || !['PREMIUM', 'VIP'].includes(targetTier)) {
      return res.status(400).json({
        success: false,
        error: '无效的升级等级'
      });
    }
    
    const user = userAuth.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    const paymentSession = await stripeProcessor.createPaymentSession(
      req.user.id,
      targetTier,
      user.email
    );
    
    res.json({
      success: true,
      data: paymentSession
    });
    
  } catch (error) {
    console.error('创建支付会话失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 验证支付状态
 */
app.post('/api/payment/verify', authenticateUser, async (req, res) => {
  try {
    if (req.user.isAnonymous) {
      return res.status(401).json({
        success: false,
        error: '请先登录'
      });
    }
    
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: '缺少支付会话ID'
      });
    }
    
    const paymentResult = await stripeProcessor.verifyPayment(sessionId);
    
    if (paymentResult.success && paymentResult.userId === req.user.id) {
      // 支付成功，升级用户
      const upgradedUser = await userAuth.upgradeTier(
        req.user.id, 
        paymentResult.targetTier,
        {
          id: paymentResult.paymentId,
          amount: paymentResult.amount,
          sessionId: sessionId,
          completedAt: paymentResult.completedAt
        }
      );
      
      res.json({
        success: true,
        data: {
          payment: paymentResult,
          user: upgradedUser
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: paymentResult.error || '支付验证失败'
      });
    }
    
  } catch (error) {
    console.error('支付验证失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Stripe Webhook处理
 */
app.post('/api/payment/webhook', (req, res, next) => {
  // 只对webhook路径使用raw body parser
  express.raw({type: 'application/json'})(req, res, next);
}, async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    const webhookResult = await stripeProcessor.handleWebhook(req.body, signature);
    
    if (webhookResult.success && webhookResult.action === 'upgrade_user') {
      // 自动升级用户
      await userAuth.upgradeTier(
        webhookResult.userId,
        webhookResult.targetTier,
        webhookResult.paymentData
      );
      
      console.log('✅ Webhook自动升级用户完成:', webhookResult.userId);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook处理失败:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 升级用户等级 (手动升级，主要用于管理员)
 */
app.post('/api/user/upgrade', authenticateUser, async (req, res) => {
  try {
    if (req.user.isAnonymous) {
      return res.status(401).json({
        success: false,
        error: '请先登录'
      });
    }
    
    const { targetTier, paymentData } = req.body;
    
    if (!targetTier || !['PREMIUM', 'VIP'].includes(targetTier)) {
      return res.status(400).json({
        success: false,
        error: '无效的升级等级'
      });
    }
    
    const upgradedUser = await userAuth.upgradeTier(req.user.id, targetTier, paymentData);
    
    res.json({
      success: true,
      data: upgradedUser
    });
    
  } catch (error) {
    console.error('用户升级失败:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 用户管理API

/**
 * 检查用户状态
 */
app.get('/api/user-status', (req, res) => {
  try {
    const fingerprint = userManager.generateFingerprint(req);
    const stats = userManager.getUserStats(fingerprint);
    
    res.json({
      success: true,
      data: {
        ...stats,
        ip: userManager.getClientIP(req)
      }
    });
  } catch (error) {
    console.error('获取用户状态失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户状态失败'
    });
  }
});

/**
 * 系统统计信息
 */
app.get('/api/system-stats', (req, res) => {
  try {
    const systemStats = userManager.getSystemStats();
    const aiStats = analyzer.aiManager.getPerformanceStats();
    
    res.json({
      success: true,
      data: {
        user: systemStats,
        ai: aiStats,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('获取系统统计失败:', error);
    res.status(500).json({
      success: false,
      error: '获取系统统计失败'
    });
  }
});

// 用户反馈和分析API

/**
 * 提交用户反馈
 */
app.post('/api/feedback', (req, res) => {
  try {
    const { rating, comment } = req.body;
    const fingerprint = userManager.generateFingerprint(req);
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的评分（1-5分）'
      });
    }

    userManager.recordFeedback(fingerprint, {
      rating,
      comment: comment || '',
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: '感谢您的反馈！'
    });

  } catch (error) {
    console.error('提交反馈失败:', error);
    res.status(500).json({
      success: false,
      error: '提交反馈失败'
    });
  }
});

/**
 * 记录分享行为
 */
app.post('/api/share', (req, res) => {
  try {
    const { shareType } = req.body; // 'social', 'link', 'image'
    const fingerprint = userManager.generateFingerprint(req);
    
    userManager.recordShare(fingerprint, shareType);

    res.json({
      success: true,
      message: '分享记录成功'
    });

  } catch (error) {
    console.error('记录分享失败:', error);
    res.status(500).json({
      success: false,
      error: '记录分享失败'
    });
  }
});

/**
 * 获取今日分析统计
 */
app.get('/api/analytics', (req, res) => {
  try {
    const analytics = userManager.getTodayAnalytics();
    const feedbackSummary = userManager.getFeedbackSummary();
    const shareStats = userManager.getShareStats();
    
    res.json({
      success: true,
      data: {
        today: analytics,
        feedback: {
          total: feedbackSummary.length,
          recent: feedbackSummary.slice(0, 5),
          averageRating: feedbackSummary.length > 0 ? 
            (feedbackSummary.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackSummary.length).toFixed(1) : 0
        },
        sharing: shareStats
      }
    });

  } catch (error) {
    console.error('获取分析统计失败:', error);
    res.status(500).json({
      success: false,
      error: '获取分析统计失败'
    });
  }
});

// 新增：AI性能监控API
app.get('/api/ai-stats', (req, res) => {
  try {
    const stats = analyzer.aiManager.getPerformanceStats();
    res.json({
      success: true,
      data: {
        ...stats,
        recommendations: {
          fasterModel: stats.qwen3.avgTime < stats.deepseek.avgTime ? 'qwen3' : 'deepseek',
          speedImprovement: Math.abs(stats.qwen3.avgTime - stats.deepseek.avgTime),
          reliability: {
            deepseek: stats.deepseek.calls > 0 ? ((stats.deepseek.calls - stats.deepseek.errors) / stats.deepseek.calls * 100).toFixed(1) + '%' : 'N/A',
            qwen3: stats.qwen3.calls > 0 ? ((stats.qwen3.calls - stats.qwen3.errors) / stats.qwen3.calls * 100).toFixed(1) + '%' : 'N/A'
          }
        }
      }
    });
  } catch (error) {
    console.error('获取AI统计失败:', error);
    res.status(500).json({
      success: false,
      error: 'AI统计数据获取失败'
    });
  }
});

// 新增：解析统计API
app.get('/api/parsing-stats', (req, res) => {
  try {
    const parsingStats = analyzer.getParsingStats();
    res.json({
      success: true,
      data: parsingStats
    });
  } catch (error) {
    console.error('获取解析统计失败:', error);
    res.status(500).json({
      success: false,
      error: '解析统计数据获取失败'
    });
  }
});

// 新增：AI模型切换API
app.post('/api/ai-switch', (req, res) => {
  try {
    const { primaryProvider, enableFallback, speedTestMode, parallelAnalysis } = req.body;
    
    // 更新AI策略配置
    if (primaryProvider) {
      config.aiStrategy.primaryProvider = primaryProvider;
      config.aiStrategy.fallbackProvider = primaryProvider === 'deepseek' ? 'qwen3' : 'deepseek';
    }
    
    if (typeof enableFallback !== 'undefined') {
      config.aiStrategy.enableFallback = enableFallback;
    }
    
    if (typeof speedTestMode !== 'undefined') {
      config.aiStrategy.speedTestMode = speedTestMode;
    }
    
    if (typeof parallelAnalysis !== 'undefined') {
      config.aiStrategy.parallelAnalysis = parallelAnalysis;
    }
    
    console.log('🔄 AI策略配置已更新:', config.aiStrategy);
    
    res.json({
      success: true,
      message: 'AI模型配置已更新',
      currentStrategy: config.aiStrategy
    });
  } catch (error) {
    console.error('AI配置更新失败:', error);
    res.status(500).json({
      success: false,
      error: 'AI配置更新失败'
    });
  }
});

// 中间件已在上面配置

// 静态文件服务
app.use(express.static('.'));

// 支付页面路由
app.get('/payment/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment-success.html'));
});

app.get('/payment/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment-cancel.html'));
});

app.get('/payment/mock', (req, res) => {
  const sessionId = req.query.session_id;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>模拟支付</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .payment-form { background: #f5f5f5; padding: 30px; border-radius: 10px; text-align: center; }
        button { background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 10px; }
        button:hover { background: #45a049; }
        .cancel { background: #f44336; }
        .cancel:hover { background: #da190b; }
      </style>
    </head>
    <body>
      <div class="payment-form">
        <h2>🎭 模拟支付页面</h2>
        <p>这是开发模式的模拟支付页面</p>
        <p>会话ID: ${sessionId}</p>
        <button onclick="simulateSuccess()">模拟支付成功</button>
        <button class="cancel" onclick="simulateCancel()">模拟支付取消</button>
      </div>
      <script>
        function simulateSuccess() {
          window.location.href = '/payment/success?session_id=${sessionId}';
        }
        function simulateCancel() {
          window.location.href = '/payment/cancel';
        }
      </script>
    </body>
    </html>
  `);
});

// 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG, JPEG, PNG 格式的图片'));
    }
  }
});

// API路由

/**
 * 风水分析接口（集成商业化限制）
 */
app.post('/api/analyze', authenticateUser, upload.single('photo'), async (req, res) => {
  try {
    console.log('📝 收到风水分析请求:', req.body);

    // 生成用户指纹（用于数据统计）
    const fingerprint = userManager.generateFingerprint(req);
    console.log('👤 用户指纹:', fingerprint);

    // 验证必需字段（兼容新旧字段名）
    const { houseType, roomType, direction } = req.body;
    if (!(houseType || roomType) || !direction) {
      return res.status(400).json({
        success: false,
        error: '请提供分析类型和入户门朝向信息'
      });
    }

    // 解析layoutFeatures JSON数组
    let layoutFeatures = [];
    if (req.body.layoutFeatures) {
      try {
        // 处理多种可能的格式
        if (Array.isArray(req.body.layoutFeatures)) {
          layoutFeatures = req.body.layoutFeatures;
        } else if (typeof req.body.layoutFeatures === 'string') {
          // 尝试解析JSON字符串
          layoutFeatures = JSON.parse(req.body.layoutFeatures);
        } else {
          layoutFeatures = [];
        }
      } catch (e) {
        console.log('layoutFeatures解析失败:', e);
        // 如果解析失败，尝试按逗号分割
        if (typeof req.body.layoutFeatures === 'string') {
          layoutFeatures = req.body.layoutFeatures.split(',').map(item => item.trim()).filter(item => item);
        } else {
          layoutFeatures = [];
        }
      }
    }

    // 解析concernAreas JSON数组
    let concernAreas = [];
    if (req.body.concernAreas) {
      try {
        // 处理多种可能的格式
        if (Array.isArray(req.body.concernAreas)) {
          concernAreas = req.body.concernAreas;
        } else if (typeof req.body.concernAreas === 'string') {
          // 尝试解析JSON字符串
          concernAreas = JSON.parse(req.body.concernAreas);
        } else {
          concernAreas = [];
        }
      } catch (e) {
        console.log('concernAreas解析失败:', e);
        // 如果解析失败，尝试按逗号分割
        if (typeof req.body.concernAreas === 'string') {
          concernAreas = req.body.concernAreas.split(',').map(item => item.trim()).filter(item => item);
        } else {
          concernAreas = [];
        }
      }
    }

    // 准备分析数据
    const formData = {
      // 基本信息
      houseType: req.body.houseType || req.body.roomType,
      roomType: req.body.roomType,
      direction: req.body.direction,
      
      // 地理位置
      address: req.body.address,
      
      // 户型与环境
      floorLevel: req.body.floorLevel,
      buildingType: req.body.buildingType,
      roomCount: req.body.roomCount,
      hasBalcony: req.body.hasBalcony,
      
      // 居住者信息
      familySize: req.body.familySize,
      livingDuration: req.body.livingDuration,
      birthDate: req.body.birthDate,
      birthTime: req.body.birthTime,
      birthInfo: req.body.birthInfo, // 兼容旧格式
      
      // 空间详情
      currentSituation: req.body.currentSituation,
      concerns: req.body.concerns,
      concernAreas: concernAreas,
      layoutFeatures: layoutFeatures,
      
      // 照片
      photo: req.file ? req.file.filename : null,
      
      // 兼容旧字段
      area: req.body.area,
      layout: req.body.layout,
      purpose: req.body.purpose
    };
    
    // 获取用户等级和语言设置
    const userTier = req.user.tier;
    const language = req.body.language || 'zh';
    console.log('🌐 用户语言设置:', language, '用户等级:', userTier);

    // 检查用户等级限制（对于已登录用户）
    if (!req.user.isAnonymous) {
      const hasRequestsLeft = userAuth.hasRequestsLeft(req.user.id);
      if (!hasRequestsLeft) {
        return res.status(429).json({
          success: false,
          error: '您的分析次数已用完，请升级账户获得更多分析机会',
          upgradePrompt: analyzer.getUpgradePrompt(userTier)
        });
      }
      
      // 检查功能权限（如图片上传）
      if (req.file && !userAuth.canUseFeature(req.user.id, 'image_upload')) {
        return res.status(403).json({
          success: false,
          error: '图片上传功能需要升级到进阶版',
          upgradePrompt: analyzer.getUpgradePrompt(userTier)
        });
      }
      
      // 记录用户请求
      userAuth.recordRequest(req.user.id, {
        type: 'analysis',
        formData: formData,
        hasImage: !!req.file
      });
    }

    // 执行AI分析 - 传入用户等级
    let analysisResult;
    if (validateConfig()) {
      // 使用真实的AI分析
      analysisResult = await analyzer.analyze(formData, language, userTier);
    } else {
      // 使用样例分析（当API密钥未配置时）
      console.log('⚠️ 使用样例分析模式（API密钥未配置）');
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
    console.log('📊 返回数据结构:', Object.keys(finalResult));

    // 添加用户统计信息
    finalResult.userStatus = userManager.getUserStats(fingerprint);

    res.json({
      success: true,
      data: finalResult
    });

  } catch (error) {
    console.error('❌ 分析请求失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 健康检查接口
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      hasApiKey: !!config.deepseek.apiKey && config.deepseek.apiKey !== 'sk-your-api-key-here',
      defaultModel: config.deepseek.defaultModel,
      env: config.server.env
    }
  });
});

/**
 * 获取配置信息
 */
app.get('/api/config', (req, res) => {
  res.json({
    models: config.deepseek.models,
    maxAnalysisLength: config.fengshui.maxAnalysisLength,
    maxApiCalls: config.fengshui.maxApiCalls,
    hasValidConfig: validateConfig()
  });
});

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理中间件
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      // 获取用户语言设置
      const language = req.body?.language || 'zh';
      const errorMsg = language === 'en' ? 
        'File size cannot exceed 5MB' : 
        '文件大小不能超过5MB';
      
      return res.status(400).json({
        success: false,
        error: errorMsg
      });
    }
  }
  
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 启动服务器
async function startServer() {
  try {
    // 创建上传目录
    const fs = require('fs');
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    // 验证配置
    const isConfigValid = validateConfig();
    if (!isConfigValid) {
      console.log('🔧 服务器将以演示模式启动（API密钥未配置）');
    } else {
      console.log('✅ 配置验证通过，启用AI分析功能');
    }

    app.listen(PORT, () => {
      console.log(`
🚀 AI风水网站服务器启动成功！

📍 访问地址: http://localhost:${PORT}
🔮 AI分析: ${isConfigValid ? '已启用 (DeepSeek-R1)' : '演示模式'}
📁 上传目录: ./uploads/
⚙️  环境: ${config.server.env}

${!isConfigValid ? `
⚠️  提示: 请配置DeepSeek API密钥以启用真实AI分析
📖 参考: setup-api-key.md
` : ''}
      `);
    });

  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('👋 服务器正在关闭...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 服务器正在关闭...');
  process.exit(0);
});

// 启动服务器
startServer(); 