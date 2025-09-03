// Vercel无服务器函数 - 风水分析API (自包含版本)
const crypto = require('crypto');

// 简化的用户管理器
class SimpleUserManager {
  generateFingerprint(req) {
    const ip = req.headers['x-forwarded-for'] || 
              req.headers['x-real-ip'] || 
              req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const today = new Date().toDateString();
    
    return crypto.createHash('md5')
      .update(ip + userAgent + today)
      .digest('hex').substring(0, 16);
  }

  getUserStats(fingerprint) {
    return {
      fingerprint: fingerprint,
      dailyUsage: 1,
      hasFreeAccess: true,
      lastUsed: new Date().toISOString()
    };
  }

  generateTieredReport(analysisResult, userTier = 'FREE') {
    return {
      ...analysisResult,
      type: 'full',
      watermark: false,
      freeAccess: true,
      userTier: userTier,
      upgradeMessage: '🚀 Coming Soon! Professional analysis for $3.99+',
      showUpgradePrompt: true,
      message: '现在完全免费，感谢您的使用！'
    };
  }
}

// 简化的风水分析器
class SimpleFengShuiAnalyzer {
  generateSampleAnalysis(formData, language = 'zh', userTier = 'FREE') {
    const isEnglish = language === 'en';
    
    // 根据房屋朝向生成评分
    const directionScores = {
      '正南': 92, '东南': 88, '正东': 85, '西南': 82,
      '正北': 78, '东北': 75, '正西': 72, '西北': 70,
      '不确定': 75
    };
    
    const score = directionScores[formData.direction] || 75;
    const level = this.getScoreLevel(score);
    
    const analysisData = {
      score: score,
      level: level,
      direction: formData.direction,
      houseType: formData.houseType,
      area: formData.area,
      timestamp: new Date().toISOString()
    };

    if (isEnglish) {
      return {
        analysis: `Professional Feng Shui Analysis Results:

🏠 Property Overview:
- Type: ${formData.houseType}
- Direction: ${formData.direction}  
- Area: ${formData.area}

⭐ Overall Score: ${score}/100 (${level})

🧭 Directional Analysis:
${this.getDirectionAnalysisEn(formData.direction, score)}

💡 Recommendations:
${this.getRecommendationsEn(formData.direction, score)}

📋 Important Notes:
- This analysis is based on traditional Feng Shui principles
- Consider consulting with local experts for personalized advice
- Environmental factors may influence the final assessment`,

        recommendations: this.getRecommendationsEn(formData.direction, score),
        importantNotes: "Professional consultation recommended for major decisions",
        analysisData: analysisData
      };
    } else {
      return {
        analysis: `🔮 AI风水大师专业分析报告

🏠 房屋基本信息：
- 房屋类型：${formData.houseType}
- 房屋朝向：${formData.direction}
- 房屋面积：${formData.area}

⭐ 综合评分：${score}/100 (${level})

🧭 朝向分析：
${this.getDirectionAnalysis(formData.direction, score)}

💡 改善建议：
${this.getRecommendations(formData.direction, score)}

📋 重要提醒：
- 本分析基于传统风水理论结合现代居住需求
- 建议结合实地情况进行综合判断
- 重大决策请咨询专业风水师`,

        recommendations: this.getRecommendations(formData.direction, score),
        importantNotes: "重大决策建议咨询专业人士",
        analysisData: analysisData
      };
    }
  }

  getScoreLevel(score) {
    if (score >= 90) return "极吉格局";
    if (score >= 85) return "大吉格局"; 
    if (score >= 80) return "吉利格局";
    if (score >= 75) return "较为吉利";
    if (score >= 70) return "中等偏上";
    if (score >= 60) return "中等水平";
    if (score >= 50) return "中等偏下";
    if (score >= 35) return "需要改善";
    return "凶险格局";
  }

  getDirectionAnalysis(direction, score) {
    const analyses = {
      '正南': `正南朝向是风水中的上乘选择。阳光充足，气场旺盛，有利于事业发展和家庭和谐。建议保持南面通透，多用红色和橙色装饰。`,
      '东南': `东南朝向财运亨通，是招财进宝的好方位。适合在此方位放置绿植和水景，有助于提升财运和健康运势。`,
      '正东': `正东朝向生机勃勃，象征新的开始。阳光温和，适合年轻人居住，有利于健康和事业起步。`,
      '西南': `西南朝向有利于感情和家庭关系，特别适合夫妻居住。建议使用暖色调装饰，营造温馨氛围。`,
      '正北': `正北朝向较为稳重，但需注意采光和保暖。可通过合理装修和布局来改善风水格局。`,
      '东北': `东北朝向需要特别注意布局，建议加强照明，使用明亮色彩来提升整体能量。`,
      '正西': `正西朝向午后阳光较强，需要做好遮阳处理。适当调整可以创造舒适的居住环境。`,
      '西北': `西北朝向比较平稳，适合成熟稳重的居住者。建议加强室内光线，营造温馨氛围。`,
      '不确定': `无法确定具体朝向时，建议实地勘察后再做详细分析。可以通过室内布局来优化风水格局。`
    };
    
    return analyses[direction] || analyses['不确定'];
  }

  getRecommendations(direction, score) {
    if (score >= 85) {
      return `✨ 您的房屋风水格局很好！建议：
1. 保持现有格局，定期清洁整理
2. 可适当添加绿植提升生气
3. 注意通风采光，保持空气流通`;
    } else if (score >= 70) {
      return `🌟 您的房屋风水格局尚可，可以通过以下方式优化：
1. 调整家具摆放，确保通道顺畅
2. 增加室内照明，营造明亮氛围
3. 适当装饰，但避免过度堆积`;
    } else {
      return `🔧 建议进行以下风水调整：
1. 重新规划室内布局和动线
2. 加强照明，使用明亮温暖的灯光
3. 清理杂物，保持空间整洁有序
4. 考虑咨询专业风水师进行实地指导`;
    }
  }

  getDirectionAnalysisEn(direction, score) {
    const analyses = {
      '正南': 'South-facing direction is excellent for Feng Shui, bringing abundant sunlight and positive energy.',
      '东南': 'Southeast direction is favorable for wealth and prosperity, ideal for financial growth.',
      '正东': 'East-facing brings vitality and new beginnings, perfect for health and career development.',
      '西南': 'Southwest direction supports relationships and family harmony.',
      '正北': 'North-facing is stable but requires attention to lighting and warmth.',
      '东北': 'Northeast direction needs careful layout planning and enhanced lighting.',
      '正西': 'West-facing requires good sun protection and proper ventilation.',
      '西北': 'Northwest direction offers stability and is suitable for mature occupants.',
      '不确定': 'Unable to determine specific direction. On-site assessment recommended for detailed analysis.'
    };
    
    return analyses[direction] || analyses['不确定'];
  }

  getRecommendationsEn(direction, score) {
    if (score >= 85) {
      return `✨ Excellent Feng Shui! Recommendations:
1. Maintain current layout and keep space clean
2. Add green plants to enhance positive energy
3. Ensure good ventilation and natural light`;
    } else if (score >= 70) {
      return `🌟 Good Feng Shui with room for improvement:
1. Adjust furniture placement for better flow
2. Enhance lighting for brighter atmosphere
3. Add decorative elements mindfully`;
    } else {
      return `🔧 Recommended Feng Shui adjustments:
1. Redesign interior layout and pathways
2. Improve lighting with warm, bright fixtures
3. Declutter and organize living spaces
4. Consider professional Feng Shui consultation`;
    }
  }
}

// 处理文件上传的中间件（简化版）
function parseMultipartForm(req) {
  return new Promise((resolve) => {
    // 简化处理，直接从body获取数据
    // 在Vercel环境中，表单数据会被自动解析
    resolve(req.body || {});
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
    console.log('🚀 Vercel API函数启动 - 自包含版本');
    console.log('📡 环境变量检查:');
    console.log(`   - DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? '✅ 已设置' : '❌ 未设置'}`);
    console.log(`   - QWEN3_API_KEY: ${process.env.QWEN3_API_KEY ? '✅ 已设置' : '❌ 未设置'}`);

    // 创建管理器实例
    const userManager = new SimpleUserManager();
    const analyzer = new SimpleFengShuiAnalyzer();

    // 处理表单数据
    const formData = await parseMultipartForm(req);

    console.log('📋 收到的表单数据:', {
      houseType: formData.houseType,
      direction: formData.direction,
      area: formData.area
    });

    // 生成用户指纹
    const fingerprint = userManager.generateFingerprint(req);
    console.log('👤 用户指纹:', fingerprint);

    // 获取分析参数
    const analysisData = {
      houseType: formData.houseType || '住宅',
      direction: formData.direction || '不确定',
      area: formData.area || '不详',
      floorLevel: formData.floorLevel || '不详',
      roomCount: formData.roomCount || '不详',
      familySize: formData.familySize || '不详',
      description: formData.description || '',
      hasImage: false
    };

    const language = formData.language || 'zh';
    const userTier = 'FREE';

    console.log('🔍 开始风水分析...');

    // 生成分析结果
    const analysisResult = analyzer.generateSampleAnalysis(analysisData, language, userTier);
    console.log('✅ 分析完成');

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
        vercelFunction: true,
        selfContained: true
      }
    });
  }
};