// 风水AI分析服务 - 集成双模型智能系统 + 三层级分析
const AIManager = require('./ai-manager.js');
const { TierManager } = require('../auth/user-auth.js');

// 🌟 专业八级风水评价体系
const FENGSHUI_GRADING_SYSTEM = {
  levels: {
    '极吉格局': { 
      range: [85, 95], 
      color: '#FFD700', 
      icon: '🌟',
      description: '此格局主家族兴旺发达、富贵荣华绵延不绝、诸事顺遂如意'
    },
    '上吉格局': { 
      range: [75, 84], 
      color: '#FF6B35', 
      icon: '⭐',
      description: '此格局主事业蒸蒸日上、财富广进、家庭和睦美满'
    },
    '中吉格局': { 
      range: [65, 74], 
      color: '#4ECDC4', 
      icon: '✨',
      description: '此格局主生活富足安康、事业稳步上升、小有所成'
    },
    '小吉格局': { 
      range: [55, 64], 
      color: '#45B7D1', 
      icon: '🔮',
      description: '此格局主衣食无忧、生活平稳，偶有小福降临'
    },
    '中平格局': { 
      range: [45, 54], 
      color: '#96CEB4', 
      icon: '🌿',
      description: '此类格局主平淡安稳、无大福亦无大灾'
    },
    '小凶格局': { 
      range: [35, 44], 
      color: '#FECA57', 
      icon: '⚠️',
      description: '此格局主时有不顺、小灾小难频发'
    },
    '大凶格局': { 
      range: [25, 34], 
      color: '#FF9FF3', 
      icon: '🚨',
      description: '此格局主灾祸不断、财运衰败、健康受损'
    },
    '凶煞格局': { 
      range: [10, 24], 
      color: '#FF6B6B', 
      icon: '❌',
      description: '此格局主家破人亡、凶祸连连，建议立即改善'
    }
  },
  
  // 获取等级信息
  getGradeInfo(score) {
    for (const [levelName, levelData] of Object.entries(this.levels)) {
      if (score >= levelData.range[0] && score <= levelData.range[1]) {
        return {
          level: levelName,
          ...levelData,
          score: score
        };
      }
    }
    // 默认返回最低等级
    return {
      level: '凶煞格局',
      ...this.levels['凶煞格局'],
      score: score
    };
  }
};

class FengshuiAnalyzer {
  constructor() {
    this.aiManager = new AIManager();
    this.parsingStats = {
      total: 0,
      successful: 0,
      fallback: 0,
      markupSuccess: 0,
      regexSuccess: 0,
      intelligentSuccess: 0
    };
  }

  /**
   * 生成输入数据的哈希值，用于一致性检查
   * @param {object} formData - 表单数据
   * @returns {string} 输入哈希值
   */
  generateInputHash(formData) {
    const keyData = [
      formData.houseType,
      formData.direction, 
      formData.area,
      formData.description?.substring(0, 100) // 只取前100字符避免太长
    ].join('|');
    
    // 简单哈希算法
    let hash = 0;
    for (let i = 0; i < keyData.length; i++) {
      const char = keyData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 执行风水分析 - 支持分层用户等级
   * @param {object} formData - 表单数据
   * @param {string} language - 用户语言设置 ('zh' 或 'en')
   * @param {string} userTier - 用户等级 ('FREE', 'PREMIUM', 'VIP')
   * @returns {Promise<object>} 分析结果
   */
  async analyze(formData, language = 'zh', userTier = 'FREE') {
    try {
      console.log('🔮 开始AI风水分析...', formData, '语言:', language, '用户等级:', userTier);

      // 根据用户等级获取配置
      const tierConfig = TierManager.getTierConfig(userTier);
      console.log('📊 用户等级配置:', tierConfig);

      // 构建分析提示 - 根据用户等级调整深度
      const prompt = this.buildTieredAnalysisPrompt(formData, language, userTier);
      
      // 生成输入的哈希值用于一致性检查
      const inputHash = this.generateInputHash(formData);
      
      // 调用AI管理器进行智能分析 (自动选择最佳模型)
      const result = await this.aiManager.analyzeFengshui(prompt, formData, {
        temperature: 0.3, // 降低随机性提高一致性
        inputHash: inputHash
      });
      
      // 🚀 新增：使用标记分割进行精确内容分类
      console.log('🔄 正在进行标记分割解析...');
      const classifiedContent = this.parseMarkupContent(result.content);
      
      // 记录解析统计
      this.recordParsingStats('markup', classifiedContent);
      
      // 🚀 新增：智能生成优化实施方案
      console.log('🔄 正在生成优化实施方案...');
      const optimizationPlan = await this.generateOptimizationPlan(classifiedContent, language);
      classifiedContent.optimizationPlan = optimizationPlan;
      
      // 解析和格式化结果
      const formattedResult = this.formatAnalysisResult(result, formData, userTier);
      formattedResult.classifiedContent = classifiedContent; // 添加分类后的内容
      
      console.log('✅ AI分析和优化方案生成完成');
      return formattedResult;

    } catch (error) {
      console.error('❌ 风水分析失败:', error);
      
      // 如果是API认证问题，尝试重新分析（会自动使用演示模式）
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        console.log('🔄 检测到API认证问题，尝试使用备用模式...');
        try {
          // 等待1秒后重试，此时DeepSeek客户端应该已经切换到演示模式
          await new Promise(resolve => setTimeout(resolve, 1000));
          const result = await this.aiManager.analyzeFengshui(this.buildAnalysisPrompt(formData, language), formData);
          
          // 🚀 备用模式也需要进行内容分类
          console.log('🔄 备用模式进行标记分割解析...');
          const classifiedContent = this.parseMarkupContent(result.content);
          
          // 🚀 备用模式也生成优化方案
          console.log('🔄 备用模式生成优化实施方案...');
          const optimizationPlan = await this.generateOptimizationPlan(classifiedContent, language);
          classifiedContent.optimizationPlan = optimizationPlan;
          
          const formattedResult = this.formatAnalysisResult(result, formData, userTier);
          formattedResult.classifiedContent = classifiedContent; // 添加分类内容
          
          console.log('✅ 备用模式分析和优化方案生成完成');
          return formattedResult;
        } catch (retryError) {
          console.log('🎭 使用内置分析引擎');
          return this.generateSampleAnalysis(formData, language, userTier);
        }
      }
      
      // 其他错误也提供备用方案
      console.log('🎭 使用内置分析引擎提供基础分析');
      return this.generateSampleAnalysis(formData, language, userTier);
    }
  }

  /**
   * 构建分层分析提示 - 根据用户等级调整分析深度
   * @param {object} formData - 表单数据
   * @param {string} language - 用户语言设置 ('zh' 或 'en')
   * @param {string} userTier - 用户等级
   * @returns {string} 分层分析提示
   */
  buildTieredAnalysisPrompt(formData, language = 'zh', userTier = 'FREE') {
    // 获取用户等级配置
    const tierConfig = TierManager.getTierConfig(userTier);
    
    if (language === 'en') {
      return this.buildEnglishTieredPrompt(formData, userTier, tierConfig);
    }

    // 根据用户等级调整分析深度和内容
    const depthInstructions = this.getTierDepthInstructions(userTier);
    
    // 构建基础提示
    const basePrompt = this.buildAnalysisPrompt(formData, language);
    
    // 添加等级特定的指令
    const tieredPrompt = basePrompt.replace(
      '【输出要求】',
      `【用户等级分析要求 - ${tierConfig.displayName}】
${depthInstructions}

【输出要求】`
    );
    
    return tieredPrompt;
  }

  /**
   * 获取用户等级分析深度指令
   * @param {string} userTier - 用户等级
   * @returns {string} 深度指令
   */
  getTierDepthInstructions(userTier) {
    switch(userTier) {
      case 'FREE':
        return `- 提供基础风水分析，每个分段控制在200字以内
- 给出简化的改善建议，重点突出最重要的3-5个要点
- 分析深度：基础级别，适合风水入门用户
- 使用通俗易懂的语言，避免过于专业的术语
- 在适当位置提及："升级到进阶版可获得更详细的分析和专业建议"`;
        
      case 'PREMIUM':
        return `- 提供详细的专业风水分析，每个分段500-800字
- 包含具体的改善措施和实施步骤
- 分析深度：专业级别，结合传统理论和现代实践
- 提供时间建议和最佳实施时机
- 可以使用专业术语，但需要适当解释
- 在适当位置提及："升级到高级版可获得大师级深度分析和3D可视化"`;
        
      case 'VIP':
        return `- 提供大师级别的深度风水分析，每个分段1000+字
- 多角度解读：传统八卦、五行、现代建筑学三重视角
- 包含个性化建议和投资建议
- 提供详细的施工指导和购买清单
- 分析深度：大师级别，接近传统风水师咨询水平
- 使用专业术语和深层理论解析
- 包含未来一年的运势变化预测`;
        
      default:
        return this.getTierDepthInstructions('FREE');
    }
  }

  /**
   * 构建分析提示 (原始方法，保持向后兼容)
   * @param {object} formData - 表单数据
   * @param {string} language - 用户语言设置 ('zh' 或 'en')
   * @returns {string} 分析提示
   */
  buildAnalysisPrompt(formData, language = 'zh') {
    const { 
      houseType, roomType, direction, currentSituation, concerns,
      address, floorLevel, buildingType, roomCount, hasBalcony,
      familySize, livingDuration, birthDate, birthTime, birthInfo,
      layoutFeatures, concernAreas
    } = formData;

    if (language === 'en') {
      return this.buildEnglishPrompt(formData);
    }

    // 中文提示（增强专业信息）
    let prompt = `作为一位精通《葬书》、《青囊奥语》、《阳宅十书》的资深风水大师，请基于三元九运理论（当前九紫离火运2024-2043）对以下住宅进行专业风水分析：

【基本信息】
- 分析类型：${houseType || roomType || '未指定'}
- 入户门朝向：${direction || '未确定'}`;

    // 地理位置信息与智能环境分析
    if (address) {
      prompt += `\n- 详细地址：${address}`;
      const environmentAnalysis = this.analyzeAddressEnvironment(address);
      if (environmentAnalysis) {
        prompt += environmentAnalysis;
      }
      prompt += `\n  请结合以上环境推断进行专业风水分析`;
    }

    // 建筑信息
    if (buildingType) prompt += `\n- 建筑类型：${buildingType}`;
    if (floorLevel) prompt += `\n- 楼层位置：${floorLevel}`;
    if (roomCount) prompt += `\n- 房间数量：${roomCount}`;
    if (hasBalcony) prompt += `\n- 阳台情况：${hasBalcony}`;

    // 居住者信息
    if (familySize) prompt += `\n- 家庭人数：${familySize}`;
    if (livingDuration) prompt += `\n- 居住时长：${livingDuration}`;
    
    // 处理生辰信息（新旧格式兼容）
    let birthInfoText = '';
    if (birthDate && birthTime) {
      birthInfoText = `${birthDate} ${birthTime}`;
    } else if (birthInfo) {
      birthInfoText = birthInfo;
    }
    
    if (birthInfoText) {
      prompt += `\n- 生辰信息：${birthInfoText}`;
      prompt += `\n  请进行五行属性分析与住宅匹配度评估`;
    }

    // 空间描述
    let layoutDescription = '';
    if (layoutFeatures && layoutFeatures.length > 0) {
      const featureTexts = {
        'open_kitchen': '开放式厨房',
        'large_living': '客厅宽敞',
        'good_lighting': '采光良好',
        'multiple_windows': '多面窗户',
        'balcony_garden': '有阳台/花园',
        'irregular_shape': '户型不规则'
      };
      const selectedFeatures = Array.isArray(layoutFeatures) 
        ? layoutFeatures.map(f => featureTexts[f]).filter(Boolean).join('、')
        : featureTexts[layoutFeatures] || layoutFeatures;
      layoutDescription = selectedFeatures;
    }
    
    if (layoutDescription && currentSituation) {
      prompt += `\n- 布局特征：${layoutDescription}`;
      prompt += `\n- 详细描述：${currentSituation}`;
    } else if (layoutDescription) {
      prompt += `\n- 当前布局：${layoutDescription}`;
    } else if (currentSituation) {
      prompt += `\n- 当前布局：${currentSituation}`;
    }
    
    // 关注领域和问题
    let concernDescription = '';
    if (concernAreas && concernAreas.length > 0) {
      const concernTexts = {
        'wealth': '财运提升',
        'health': '健康运势', 
        'relationship': '感情和谐',
        'career': '事业发展',
        'family': '家庭和睦',
        'study': '学业进步',
        'sleep': '睡眠质量',
        'energy': '精神状态'
      };
      const selectedConcerns = concernAreas.map(c => concernTexts[c]).filter(Boolean).join('、');
      concernDescription = selectedConcerns;
    }
    
    if (concernDescription && concerns) {
      prompt += `\n- 重点关注：${concernDescription}`;
      prompt += `\n- 具体问题：${concerns}`;
    } else if (concernDescription) {
      prompt += `\n- 关注方向：${concernDescription}`;
    } else if (concerns) {
      prompt += `\n- 关注问题：${concerns}`;
    }

    // 时空能量分析
    const timeSpaceAnalysis = this.generateTimeSpaceAnalysis(formData);
    prompt += timeSpaceAnalysis;

    prompt += `

请基于以上全面信息进行专业风水分析：

【格式要求】
- 严格禁止使用任何Markdown符号：不能使用**、##、###、*、-、|、\`\`\`等任何格式化符号
- 不能使用表格格式，改用简洁的文字描述
- 列表项使用简单的数字编号或直接文字说明
- 保持内容专业性，语言流畅自然

【专业分析结构】
🚨 重要：必须完全按照以下标记格式输出，缺一不可！🚨

第一部分 - 总体评分（必须包含）：
***SCORE_START***
[你的总体评分和分析内容]
***SCORE_END***

第二部分 - 方位分析（必须包含）：
***DIRECTION_START***
[朝向分析内容]
***DIRECTION_END***

第三部分 - 布局建议（必须包含）：
***LAYOUT_START***
[布局建议内容]
***LAYOUT_END***

第四部分 - 时间建议（必须包含）：
***TIMING_START***
[时间建议内容]
***TIMING_END***

第五部分 - 注意事项（必须包含）：
***NOTES_START***
[注意事项内容]
***NOTES_END***

⚠️ 警告：如果不使用上述标记格式，系统将无法正确解析你的回答！⚠️

【输出要求】
- 内容要专业权威，基于传统风水理论
- 语言通俗易懂，适合普通用户理解
- 建议要具体可行，贴近现代生活需求
- 采用专业八级评价体系，等级从凶煞格局到极吉格局，以风水专业术语评价
- 所有部分都采用分号分隔格式：要点1；要点2；要点3；其他说明
- 每个分号分段必须是独立完整的句子，不能包含子标题或嵌套描述
- 绝对不要使用嵌套序号（如"1. 建议如下：1."或"第2条：1."），避免重复序号
- 各区块内容必须完全不重复，具体改善措施要提供独特的实施总结
- 注意事项部分不要分割成"特别注意"、"其他注意"等子标题，统一为一个完整部分
- 绝对不能使用任何格式化符号，保持纯文本输出
- 必须严格按照标记格式输出，每个部分都要有完整的开始和结束标记
- 标记内的内容要完整，不要截断
- 如果没有使用标记格式，系统将无法识别你的分析内容
- 标记符号必须完全匹配：***SCORE_START*** 和 ***SCORE_END*** 等`;

    return prompt;
  }

  /**
   * 构建英文分层提示
   * @param {object} formData - 表单数据
   * @param {string} userTier - 用户等级
   * @param {object} tierConfig - 等级配置
   * @returns {string} 英文分层提示
   */
  buildEnglishTieredPrompt(formData, userTier, tierConfig) {
    const basePrompt = this.buildEnglishPrompt(formData);
    const depthInstructions = this.getEnglishTierDepthInstructions(userTier);
    
    // 插入等级特定指令
    const tieredPrompt = basePrompt.replace(
      '【Output Requirements】',
      `【User Tier Analysis Requirements - ${tierConfig.displayName}】
${depthInstructions}

【Output Requirements】`
    );
    
    return tieredPrompt;
  }

  /**
   * 获取英文用户等级分析深度指令
   * @param {string} userTier - 用户等级
   * @returns {string} 英文深度指令
   */
  getEnglishTierDepthInstructions(userTier) {
    switch(userTier) {
      case 'FREE':
        return `- Provide basic Feng Shui analysis, each section within 200 words
- Give simplified improvement suggestions, highlighting the 3-5 most important points
- Analysis depth: Basic level, suitable for Feng Shui beginners
- Use plain language, avoid overly professional terms
- Mention at appropriate places: "Upgrade to Premium for more detailed analysis and professional advice"`;
        
      case 'PREMIUM':
        return `- Provide detailed professional Feng Shui analysis, each section 500-800 words
- Include specific improvement measures and implementation steps
- Analysis depth: Professional level, combining traditional theory and modern practice
- Provide timing advice and optimal implementation timing
- Professional terms allowed with appropriate explanations
- Mention at appropriate places: "Upgrade to VIP for master-level deep analysis and 3D visualization"`;
        
      case 'VIP':
        return `- Provide master-level deep Feng Shui analysis, each section 1000+ words
- Multi-angle interpretation: traditional Bagua, Five Elements, and modern architecture perspectives
- Include personalized advice and investment suggestions
- Provide detailed construction guidance and purchase lists
- Analysis depth: Master level, approaching traditional Feng Shui master consultation quality
- Use professional terms and deep theoretical analysis
- Include fortune trend predictions for the coming year`;
        
      default:
        return this.getEnglishTierDepthInstructions('FREE');
    }
  }

  /**
   * 构建英文分析提示 (原始方法，保持向后兼容)
   * @param {object} formData - 表单数据
   * @returns {string} 英文分析提示
   */
  buildEnglishPrompt(formData) {
    const { houseType, direction, area, layout, purpose, concerns } = formData;

    let prompt = `As a senior Feng Shui master, please provide a detailed Feng Shui analysis for the following property:

Property Information:
- Type: ${houseType}
- Orientation: ${direction}`;

    if (area) prompt += `\n- Area: ${area} square meters`;
    if (layout) prompt += `\n- Layout: ${layout}`;
    if (purpose) prompt += `\n- Purpose: ${purpose}`;
    if (concerns) prompt += `\n- Concerns: ${concerns}`;

    prompt += `

Please provide professional analysis from the following perspectives, strictly following the format requirements:

【Format Requirements】
- Strictly prohibit using any Markdown symbols: cannot use **, ##, ###, *, -, |, \`\`\` or any formatting symbols
- Cannot use table format, use concise text descriptions instead
- Use simple numbering or direct text explanations for list items
- Maintain professional content with fluent and natural language

【Analysis Structure】
Please strictly follow the markup format below, each section using clear start and end markers:

1. ***SCORE_START***
XX points; first scoring explanation basis; second scoring explanation basis; other related explanations
***SCORE_END***

2. ***DIRECTION_START***
Orientation advantages description; Bagua Five Elements analysis; aspects requiring attention; other orientation-related explanations
***DIRECTION_END***

3. ***LAYOUT_START***
Important area analysis; furniture placement suggestions; spatial layout optimization; other layout-related suggestions
***LAYOUT_END***

4. ***TIMING_START***
Best implementation timing; times to avoid; daily maintenance schedule; other timing-related suggestions
***TIMING_END***

5. ***NOTES_START***
Important Feng Shui taboos; matters requiring special attention; daily maintenance points; other important notes
***NOTES_END***

【Output Requirements】
- Content should be professional and authoritative, based on traditional Feng Shui theory
- Language should be easy to understand, suitable for general users
- Suggestions should be specific and practical, close to modern life needs
- Strictly control scoring within 50-88 points range, do not say negative expressions like "Feng Shui never has perfect scores"
- All analysis content must be in English, including all descriptions, suggestions, and explanations`;

    return prompt;
  }

  /**
   * 格式化分析结果 - 支持用户等级
   * @param {object} aiResult - AI分析结果
   * @param {object} formData - 原始表单数据
   * @param {string} userTier - 用户等级
   * @returns {object} 格式化后的结果
   */
  formatAnalysisResult(aiResult, formData, userTier = 'FREE') {
    const analysis = aiResult.content;
    
    // 尝试从AI分析中提取评分（支持多种格式）
    let scoreMatch = analysis.match(/(\d+)\s*分/);
    if (!scoreMatch) {
      scoreMatch = analysis.match(/(\d+)\s*points?/i);
    }
    if (!scoreMatch) {
      scoreMatch = analysis.match(/评分.*?(\d+)/);
    }
    if (!scoreMatch) {
      scoreMatch = analysis.match(/score.*?(\d+)/i);
    }
    
    // 始终使用一致性评分以确保相同输入得到相同结果
    let score = this.calculateConsistentScore(formData);
    console.log(`📊 使用一致性评分算法: ${score}分 (确保相同输入得到相同结果)`);
    
    // 如果AI也给出了分数，可以参考但不作为最终结果
    if (scoreMatch) {
      const aiScore = parseInt(scoreMatch[1]);
      console.log(`💡 AI建议评分: ${aiScore}分 (仅供参考，实际使用一致性评分: ${score}分)`);
    }
    
    // 风水原则：确保评分永远不会是满分，最高88分
    score = Math.min(88, Math.max(50, score));
    
    // 如果AI给出了90分以上的不合理评分，调整到合理范围
    if (score > 88) {
      score = 82 + Math.floor(Math.random() * 6); // 82-87分
    }

    // 获取专业等级信息
    const gradeInfo = this.getGradeInfo(score);
    
    // 根据用户等级应用限制
    const tierConfig = TierManager.getTierConfig(userTier);
    const tieredAnalysis = this.applyTierLimitations(analysis, userTier, tierConfig);
    
    return {
      score: score,
      gradeInfo: gradeInfo,
      analysis: tieredAnalysis,
      formData: formData,
      userTier: userTier,
      tierConfig: tierConfig,
      timestamp: new Date().toISOString(),
      model: aiResult.model,
      usage: aiResult.usage,
      recommendations: this.extractTieredRecommendations(analysis, userTier),
      urgentActions: this.extractUrgentActions(analysis),
      fengshuiScore: {
        direction: this.getDirectionScore(formData.direction),
        layout: this.getLayoutScore(formData.houseType, formData.layout),
        purpose: this.getPurposeScore(formData.houseType, formData.purpose),
        overall: score
      },
      upgradePrompt: this.getUpgradePrompt(userTier)
    };
  }

  /**
   * 计算默认评分（如果AI没有给出明确评分）
   * 专业风水评价体系：10-95分范围，极吉格局罕见
   * @param {string} direction - 房屋朝向
   * @returns {number} 评分 (10-95分，专业八级体系)
   */
  calculateDefaultScore(direction) {
    const directionScores = {
      '正南': 78, '东南': 75, '正东': 72, '西南': 68,
      '正北': 65, '西北': 62, '正西': 58, '东北': 55
    };
    // 基础分数加随机调整，范围在10-95分
    const baseScore = directionScores[direction] || 60;
    const randomAdjust = Math.floor(Math.random() * 12) - 6; // -6到+6的随机调整
    return Math.min(95, Math.max(10, baseScore + randomAdjust));
  }

  /**
   * 计算基于输入的一致性评分（确保相同输入得到相同结果）
   * @param {object} formData - 表单数据
   * @returns {number} 一致性评分 (50-85分)
   */
  calculateConsistentScore(formData) {
    const crypto = require('crypto');
    
    // 标准化描述字段（将"无"和"none"视为等价）
    const normalizeDescription = (desc) => {
      if (!desc || desc === '无' || desc === 'none' || desc === 'None' || desc.toLowerCase() === 'none') {
        return 'empty';
      }
      return desc;
    };
    
    // 创建输入数据的哈希，确保相同输入得到相同结果
    const normalizedData = {
      houseType: formData.houseType,
      direction: formData.direction,
      area: formData.area,
      floorLevel: formData.floorLevel,
      roomCount: formData.roomCount,
      familySize: formData.familySize,
      description: normalizeDescription(formData.description || formData.currentSituation)
    };
    
    const inputString = JSON.stringify(normalizedData);
    
    const hash = crypto.createHash('md5').update(inputString).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);
    
    // 基础分数：朝向分数
    const directionScores = {
      'south': 78, '正南': 78, 'southeast': 75, '东南': 75, 
      'east': 72, '正东': 72, 'southwest': 68, '西南': 68,
      'north': 65, '正北': 65, 'northwest': 62, '西北': 62, 
      'west': 58, '正西': 58, 'northeast': 55, '东北': 55
    };
    
    let score = directionScores[formData.direction] || 65;
    
    // 根据哈希值进行一致性微调（±5分范围内）
    const adjustment = (hashValue % 11) - 5; // -5到+5的调整
    score += adjustment;
    
    // 确保在合理范围内
    return Math.max(50, Math.min(85, score));
  }

  /**
   * 应用用户等级限制
   * @param {string} analysis - 原始分析内容
   * @param {string} userTier - 用户等级
   * @param {object} tierConfig - 等级配置
   * @returns {string} 应用限制后的分析
   */
  applyTierLimitations(analysis, userTier, tierConfig) {
    if (userTier === 'FREE') {
      // 免费版：简化内容，添加升级提示
      const limitedAnalysis = this.limitContentLength(analysis, 800);
      return limitedAnalysis + '\n\n💡 升级到进阶版($4.99)可获得更详细的专业分析、户型图识别、时间建议等功能。';
    } else if (userTier === 'PREMIUM') {
      // 进阶版：完整内容，添加VIP升级提示
      return analysis + '\n\n🌟 升级到高级版($29.90)可获得大师级深度分析、3D可视化、个性化咨询等顶级功能。';
    } else {
      // VIP：完整内容无限制
      return analysis;
    }
  }

  /**
   * 限制内容长度
   * @param {string} content - 原始内容
   * @param {number} maxLength - 最大长度
   * @returns {string} 限制后的内容
   */
  limitContentLength(content, maxLength) {
    if (content.length <= maxLength) {
      return content;
    }
    
    // 按句子截断，保持完整性
    const sentences = content.split(/[。！？]/);
    let result = '';
    for (const sentence of sentences) {
      if ((result + sentence + '。').length > maxLength) {
        break;
      }
      result += sentence + '。';
    }
    
    return result + '\n\n...(内容已简化，升级可查看完整分析)';
  }

  /**
   * 提取分层建议
   * @param {string} analysis - 分析内容
   * @param {string} userTier - 用户等级
   * @returns {array} 分层建议列表
   */
  extractTieredRecommendations(analysis, userTier) {
    const allRecommendations = this.extractRecommendations(analysis);
    
    switch(userTier) {
      case 'FREE':
        return allRecommendations.slice(0, 3); // 免费版只显示3条
      case 'PREMIUM':
        return allRecommendations.slice(0, 6); // 进阶版显示6条
      case 'VIP':
        return allRecommendations; // VIP显示全部
      default:
        return allRecommendations.slice(0, 3);
    }
  }

  /**
   * 获取升级提示
   * @param {string} userTier - 当前用户等级
   * @returns {object} 升级提示信息
   */
  getUpgradePrompt(userTier) {
    switch(userTier) {
      case 'FREE':
        return {
          show: true,
          title: '升级到进阶版',
          description: '获得详细专业分析、户型图识别、PDF导出等功能',
          price: '$4.99',
          targetTier: 'PREMIUM',
          features: [
            '详细分析报告(500-800字)',
            '户型图AI识别',
            '时间建议和择吉',
            'PDF格式导出',
            '30天内可重新生成'
          ]
        };
        
      case 'PREMIUM':
        return {
          show: true,
          title: '升级到高级版',
          description: '享受大师级分析、3D可视化、个性化咨询',
          price: '$29.90',
          targetTier: 'VIP',
          features: [
            '大师级深度分析(1000+字)',
            '3D可视化效果',
            '个人定制建议',
            '投资和择址建议',
            '7×24专属客服',
            '终身更新服务'
          ]
        };
        
      case 'VIP':
        return {
          show: false,
          message: '您已享受最高级别的风水分析服务'
        };
        
      default:
        return { show: false };
    }
  }

  /**
   * 获取风水等级信息
   * @param {number} score - 评分
   * @returns {object} 等级信息
   */
  getGradeInfo(score) {
    return FENGSHUI_GRADING_SYSTEM.getGradeInfo(score);
  }

  /**
   * 提取具体建议
   * @param {string} analysis - AI分析内容
   * @returns {array} 建议列表
   */
  extractRecommendations(analysis) {
    const recommendations = [];
    
    // 使用正则表达式提取建议性内容
    const suggestionPatterns = [
      /建议.*?[。\n]/g,
      /应该.*?[。\n]/g,
      /可以.*?[。\n]/g,
      /推荐.*?[。\n]/g
    ];

    suggestionPatterns.forEach(pattern => {
      const matches = analysis.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const clean = match.replace(/[。\n]/g, '').trim();
          if (clean.length > 5 && !recommendations.includes(clean)) {
            recommendations.push(clean);
          }
        });
      }
    });

    return recommendations.slice(0, 8); // 最多返回8条建议
  }

  /**
   * 提取紧急行动项
   * @param {string} analysis - AI分析内容
   * @returns {array} 紧急行动列表
   */
  extractUrgentActions(analysis) {
    const urgentKeywords = ['立即', '马上', '紧急', '避免', '禁忌', '不宜'];
    const actions = [];

    const sentences = analysis.split(/[。！\n]/);
    sentences.forEach(sentence => {
      if (urgentKeywords.some(keyword => sentence.includes(keyword))) {
        const clean = sentence.trim();
        if (clean.length > 5) {
          actions.push(clean);
        }
      }
    });

    return actions.slice(0, 5); // 最多返回5条紧急行动
  }

  /**
   * 计算方位评分
   * @param {string} direction - 朝向
   * @returns {number} 方位评分 (最高86分)
   */
  getDirectionScore(direction) {
    const scores = {
      '正南': 86, '东南': 83, '正东': 78, '西南': 74,
      '正北': 70, '西北': 72, '正西': 65, '东北': 60
    };
    return scores[direction] || 65;
  }

  /**
   * 计算布局评分
   * @param {string} houseType - 房屋类型
   * @param {string} layout - 布局
   * @returns {number} 布局评分 (最高85分)
   */
  getLayoutScore(houseType, layout) {
    let baseScore = 70;
    
    if (houseType === '住宅' && layout && layout.includes('三室')) baseScore += 8;
    if (houseType === '办公室' && layout && layout.includes('开放')) baseScore += 5;
    if (houseType === '商铺' && layout && layout.includes('临街')) baseScore += 10;
    
    return Math.min(85, baseScore);
  }

  /**
   * 计算用途评分
   * @param {string} houseType - 房屋类型
   * @param {string} purpose - 用途
   * @returns {number} 用途评分
   */
  getPurposeScore(houseType, purpose) {
    const matchScores = {
      '住宅-居住': 90,
      '办公室-办公': 90,
      '商铺-经营': 90,
      '工厂-经营': 85
    };

    const key = `${houseType}-${purpose}`;
    return matchScores[key] || 70;
  }

  /**
   * 获取样例分析 (用于演示) - 支持用户等级
   * @param {object} formData - 表单数据
   * @param {string} language - 用户语言设置 ('zh' 或 'en')
   * @param {string} userTier - 用户等级
   * @returns {object} 样例分析结果
   */
  generateSampleAnalysis(formData, language = 'zh', userTier = 'FREE') {
    const score = this.calculateDefaultScore(formData.direction);
    
    if (language === 'en') {
      return this.generateEnglishSampleAnalysis(formData, score, userTier);
    }
    
    // 📊 构建样例分类内容，确保六色区块正常显示
    const sampleClassifiedContent = {
      totalScore: `该房屋整体风水格局良好，具有较好的发展潜力。根据传统风水理论，此格局表明空间能量流动基本顺畅，适合居住或办公使用。`,
      
      directionAnalysis: `${formData.direction || '所选'}朝向在风水学中被认为是较为吉利的方位。该朝向能够获得充足的自然光照，有利于室内气场的积极流动。从八卦方位来看，此朝向对应的五行属性与房屋功能相匹配，有助于提升居住者或使用者的整体运势。`,
      
      layoutSuggestions: `建议在入口区域设置屏风或装饰隔断，以形成良好的迎宾气场。客厅或主要活动区域应保持开阔明亮，避免过多的家具阻挡自然气流。卧室或休息区宜设在较为安静的位置，确保休息质量。整体布局应遵循"明厅暗室"的原则。`,
      

      
      timingSuggestions: `建议在农历每月的初一、十五进行空间净化和整理。装修或重大调整宜选择在春季（3-5月）或秋季（9-11月）进行，这两个时期天地能量较为平衡。日常的家具调整建议在上午9-11点之间进行，此时阳气充足，有利于正面能量的提升。`,
      
      importantNotes: `请注意避免在房屋正中央放置重物或垃圾桶，以免影响中宫气场。镜子不宜直对床铺或主要座位，容易造成能量反射过强。尖锐物品应妥善收纳，避免形成"煞气"。保持室内整洁有序，是维护良好风水的基础条件。`
    };
    
    // 📝 使用新的标记格式构建样例分析
    const sampleAnalysisWithMarkup = `
***SCORE_START***
该房屋整体风水格局良好，具有较好的发展潜力。根据传统风水理论，此格局表明空间能量流动基本顺畅，适合居住或办公使用，有提升空间。
***SCORE_END***

***DIRECTION_START***
${formData.direction}朝向能够获得充足的自然光照，有利于室内气场流动；从八卦方位来看，此朝向对应的五行属性与房屋功能相匹配；有助于提升居住者或使用者的整体运势；该朝向在风水学中被认为是较为吉利的方位
***DIRECTION_END***

***LAYOUT_START***
入口区域应设置屏风或装饰隔断，形成良好的迎宾气场；客厅或主要活动区域保持开阔明亮，避免家具阻挡气流；卧室或休息区设在安静位置，确保休息质量；整体布局遵循明厅暗室的风水原则
***LAYOUT_END***

***TIMING_START***
农历每月初一十五进行空间净化和整理；装修或重大调整选择春季3到5月或秋季9到11月进行；日常家具调整建议在上午9到11点之间进行；此时阳气充足有利于正面能量提升
***TIMING_END***

***NOTES_START***
避免在房屋正中央放置重物或垃圾桶；镜子不宜直对床铺或主要座位；尖锐物品应妥善收纳避免形成煞气；保持室内整洁有序；定期开窗通风保持空气流通；避免尖角对向座位或床铺；财位不可放置杂物或垃圾桶
***NOTES_END***
    `.trim();

    // 🚀 添加样例优化方案
    sampleClassifiedContent.optimizationPlan = {
      immediate: `在财位摆放绿色植物如发财树；清理通道避免杂物堆积；调整室内照明增加光线；整理空间保持整洁有序`,
      regular: `每月初一十五进行空间净化；定期开窗通风保持空气流通；季节性调整家具摆放；保持风水物品清洁`
    };

    // 根据用户等级应用限制
    const tierConfig = TierManager.getTierConfig(userTier);
    const tieredAnalysis = this.applyTierLimitations(sampleAnalysisWithMarkup, userTier, tierConfig);
    const tieredRecommendations = this.extractTieredRecommendations(sampleAnalysisWithMarkup, userTier);
    
    return {
      score: score,
      gradeInfo: this.getGradeInfo(score),
      analysis: tieredAnalysis,
      classifiedContent: sampleClassifiedContent,
      formData: formData,
      userTier: userTier,
      tierConfig: tierConfig,
      timestamp: new Date().toISOString(),
      model: 'sample-analysis',
      recommendations: tieredRecommendations,
      urgentActions: [
        '清理杂物堆积区域',
        '确保空气流通'
      ],
      fengshuiScore: {
        direction: this.getDirectionScore(formData.direction),
        layout: this.getLayoutScore(formData.houseType, formData.layout),
        purpose: this.getPurposeScore(formData.houseType, formData.purpose),
        overall: score
      },
      upgradePrompt: this.getUpgradePrompt(userTier)
    };
  }

  /**
   * 生成英文样例分析
   * @param {object} formData - 表单数据
   * @param {number} score - 评分
   * @param {string} userTier - 用户等级
   * @returns {object} 英文样例分析结果
   */
  generateEnglishSampleAnalysis(formData, score, userTier = 'FREE') {
    // 📊 构建英文样例分类内容
    const sampleClassifiedContent = {
      totalScore: `This property has good overall Feng Shui layout with development potential. According to traditional Feng Shui theory, this layout indicates smooth energy flow. Suitable for residential or office use with room for improvement.`,
      
      directionAnalysis: `${formData.direction || 'Selected'} orientation is considered auspicious in Feng Shui. This orientation receives adequate natural light beneficial for indoor energy flow. From Bagua perspective, this direction's Five Element attributes match the property function. Helps enhance overall fortune for residents or users.`,
      
      layoutSuggestions: `Recommend placing screen or decorative partition at entrance area to create welcoming energy field; Main living or activity areas should remain open and bright, avoiding furniture blocking natural airflow; Bedroom or rest areas should be positioned in quieter locations ensuring rest quality; Overall layout should follow the principle of bright hall and dark rooms`,
      
      timingSuggestions: `Recommend space cleansing and organization on lunar calendar 1st and 15th of each month; Renovation or major adjustments should be done in spring (March-May) or autumn (September-November); Daily furniture adjustments recommended between 9-11 AM when yang energy is abundant; This timing is beneficial for positive energy enhancement`,
      
      importantNotes: `Avoid placing heavy objects or trash bins in the center of the property to prevent affecting central palace energy; Mirrors should not directly face beds or main seating areas as this creates excessive energy reflection; Sharp objects should be properly stored to avoid creating negative energy; Maintaining indoor cleanliness and order is the foundation of good Feng Shui`
    };
    
    // 📝 使用新的标记格式构建英文样例分析
    const sampleAnalysisWithMarkup = `
***SCORE_START***
${score} points; This property has good overall Feng Shui layout with development potential; According to traditional Feng Shui theory, this score indicates smooth energy flow; Suitable for residential or office use with room for improvement
***SCORE_END***

***DIRECTION_START***
${formData.direction} orientation receives adequate natural light beneficial for indoor energy flow; From Bagua perspective, this direction's Five Element attributes match the property function; Helps enhance overall fortune for residents or users; This orientation is considered auspicious in Feng Shui
***DIRECTION_END***

***LAYOUT_START***
Entrance area should have screen or decorative partition to create welcoming energy field; Main living or activity areas remain open and bright avoiding furniture blocking airflow; Bedroom or rest areas positioned in quiet locations ensuring rest quality; Overall layout follows bright hall dark rooms Feng Shui principle
***LAYOUT_END***

***TIMING_START***
Lunar calendar 1st and 15th each month for space cleansing and organization; Renovation or major adjustments in spring March to May or autumn September to November; Daily furniture adjustments between 9 to 11 AM when yang energy abundant; This timing beneficial for positive energy enhancement
***TIMING_END***

***NOTES_START***
Avoid placing heavy objects or trash bins in property center; Mirrors should not directly face beds or main seating areas; Sharp objects should be properly stored to avoid negative energy; Maintain indoor cleanliness and order; Regular window opening for air circulation; Avoid sharp corners pointing toward seats or beds; Wealth position should not have clutter or trash bins
***NOTES_END***
    `.trim();

    // 🚀 添加英文样例优化方案
    sampleClassifiedContent.optimizationPlan = {
      immediate: `Place green plants like money tree in wealth position; Clear pathways avoid clutter accumulation; Adjust indoor lighting increase brightness; Organize space maintain cleanliness and order`,
      regular: `Monthly space cleansing on 1st and 15th lunar calendar; Regular window opening maintain air circulation; Seasonal furniture arrangement adjustments; Keep Feng Shui items clean`
    };

    // 根据用户等级应用限制
    const tierConfig = TierManager.getTierConfig(userTier);
    const tieredAnalysis = this.applyTierLimitations(sampleAnalysisWithMarkup, userTier, tierConfig);
    const tieredRecommendations = this.extractTieredRecommendations(sampleAnalysisWithMarkup, userTier);
    
    return {
      score: score,
      gradeInfo: this.getGradeInfo(score),
      analysis: tieredAnalysis,
      classifiedContent: sampleClassifiedContent,
      formData: formData,
      userTier: userTier,
      tierConfig: tierConfig,
      timestamp: new Date().toISOString(),
      model: 'sample-analysis-en',
      recommendations: tieredRecommendations,
      urgentActions: [
        'Clear clutter accumulation areas',
        'Ensure air circulation'
      ],
      fengshuiScore: {
        direction: this.getDirectionScore(formData.direction),
        layout: this.getLayoutScore(formData.houseType, formData.layout),
        purpose: this.getPurposeScore(formData.houseType, formData.purpose),
        overall: score
      },
      upgradePrompt: this.getUpgradePrompt(userTier)
    };
  }

  /**
   * 使用标记分割解析内容 - 更可靠的内容分类方法
   * @param {string} rawAnalysis - 原始AI分析内容
   * @returns {object} 分类后的内容
   */
  parseMarkupContent(rawAnalysis) {
    console.log('📝 开始标记分割解析...');
    
    const sections = {
      totalScore: '',
      directionAnalysis: '',
      layoutSuggestions: '',
      timingSuggestions: '',
      importantNotes: ''
    };

    // 定义标记模式
    const patterns = {
      totalScore: /\*\*\*SCORE_START\*\*\*([\s\S]*?)\*\*\*SCORE_END\*\*\*/i,
      directionAnalysis: /\*\*\*DIRECTION_START\*\*\*([\s\S]*?)\*\*\*DIRECTION_END\*\*\*/i,
      layoutSuggestions: /\*\*\*LAYOUT_START\*\*\*([\s\S]*?)\*\*\*LAYOUT_END\*\*\*/i,
      timingSuggestions: /\*\*\*TIMING_START\*\*\*([\s\S]*?)\*\*\*TIMING_END\*\*\*/i,
      importantNotes: /\*\*\*NOTES_START\*\*\*([\s\S]*?)\*\*\*NOTES_END\*\*\*/i
    };

    // 使用标记分割提取内容
    Object.keys(patterns).forEach(key => {
      const match = rawAnalysis.match(patterns[key]);
      if (match && match[1]) {
        sections[key] = match[1].trim();
        console.log(`✅ 成功提取 ${key}: ${sections[key].substring(0, 50)}...`);
      } else {
        console.log(`⚠️ 未找到 ${key} 的标记内容`);
      }
    });

    // 如果标记解析失败，使用备用解析方法
    if (!sections.totalScore && !sections.directionAnalysis) {
      console.log('🔄 标记解析失败，使用备用方法...');
      const fallbackResult = this.fallbackClassification(rawAnalysis);
      this.recordParsingStats('regex', fallbackResult);
      return fallbackResult;
    }

    return sections;
  }

  /**
   * 智能分类分析内容 - 使用二次AI调用来准确识别内容分类 (备用方法)
   * @param {string} rawAnalysis - 原始AI分析内容
   * @returns {Promise<object>} 分类后的内容
   */
  async classifyAnalysisContent(rawAnalysis) {
    const classificationPrompt = `请分析以下风水分析报告，将内容准确分类到对应的区块中。

原始分析内容：
${rawAnalysis}

请严格按照以下JSON格式输出，每个分类只包含相关的具体内容：

{
  "totalScore": "总体评分的具体分数和简短说明",
  "directionAnalysis": "方位分析的详细内容",
  "layoutSuggestions": "布局优化建议的具体内容", 
  "improvementMeasures": "具体改善措施的详细内容",
  "timingSuggestions": "时间建议的具体内容",
  "importantNotes": "注意事项的具体内容"
}

要求：
1. 只输出JSON格式，不要其他文字
2. 如果某个分类没有对应内容，使用空字符串""
3. 去掉所有###、**、##等格式符号
4. 保持内容的专业性和完整性`;

    try {
      const result = await this.aiManager.deepseekClient.analyze(classificationPrompt, {
        model: 'deepseek-chat', // 使用快速模型进行分类
        temperature: 0.1, // 低温度确保准确性
        maxTokens: 1500
      });

      // 尝试解析JSON结果
      let parsedResult;
      try {
        // 提取JSON部分（去掉可能的前后文字）
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : result.content;
        parsedResult = JSON.parse(jsonStr);
      } catch (parseError) {
        console.log('JSON解析失败，使用备用分类方法');
        parsedResult = this.fallbackClassification(rawAnalysis);
      }

      // 清理所有格式符号
      Object.keys(parsedResult).forEach(key => {
        if (typeof parsedResult[key] === 'string') {
          parsedResult[key] = this.cleanFormatSymbols(parsedResult[key]);
        }
      });

      return parsedResult;

    } catch (error) {
      console.error('内容分类失败，使用备用方法:', error);
      return this.fallbackClassification(rawAnalysis);
    }
  }

  /**
   * 智能生成优化实施方案
   * @param {object} classifiedContent - 已分类的内容
   * @param {string} language - 语言设置
   * @returns {Promise<object>} 优化实施方案
   */
  async generateOptimizationPlan(classifiedContent, language = 'zh') {
    const optimizationPrompt = language === 'en' ? 
      this.buildEnglishOptimizationPrompt(classifiedContent) : 
      this.buildChineseOptimizationPrompt(classifiedContent);

    try {
      const result = await this.aiManager.deepseekClient.analyze(optimizationPrompt, {
        model: 'deepseek-chat',
        temperature: 0.3,
        maxTokens: 800
      });

      console.log('🔍 AI优化方案原始回应:', result.content.substring(0, 200) + '...');

      // 解析立即执行和定期执行的措施
      const immediateMatch = result.content.match(/\*\*\*IMMEDIATE_START\*\*\*([\s\S]*?)\*\*\*IMMEDIATE_END\*\*\*/i);
      const regularMatch = result.content.match(/\*\*\*REGULAR_START\*\*\*([\s\S]*?)\*\*\*REGULAR_END\*\*\*/i);

      let plan = {
        immediate: immediateMatch ? immediateMatch[1].trim() : '',
        regular: regularMatch ? regularMatch[1].trim() : ''
      };

      // 如果标记解析失败，尝试备用解析
      if (!plan.immediate && !plan.regular) {
        console.log('🔄 标记解析失败，尝试智能解析...');
        plan = this.parseOptimizationFromText(result.content, classifiedContent, language);
      }

      console.log('✅ 优化实施方案生成完成', plan);
      return plan;

    } catch (error) {
      console.error('优化方案生成失败，使用备用方案:', error);
      
      // 备用方案：从现有内容中简单提取
      return this.fallbackOptimizationPlan(classifiedContent, language);
    }
  }

  /**
   * 构建中文优化提示
   * @param {object} classifiedContent - 已分类的内容
   * @returns {string} 中文优化提示
   */
  buildChineseOptimizationPrompt(classifiedContent) {
    return `作为风水专家，请从以下已分析的风水内容中提取所有的改善措施和优化建议：

分析内容：
- 方位分析：${classifiedContent.directionAnalysis || ''}
- 布局建议：${classifiedContent.layoutSuggestions || ''}
- 时间建议：${classifiedContent.timingSuggestions || ''}
- 注意事项：${classifiedContent.importantNotes || ''}

请提取所有具体的、可执行的改善措施，输出格式如下（必须严格按照此格式）：

立即执行措施1；立即执行措施2；立即执行措施3；立即执行措施4

定期维护措施1；定期维护措施2；定期维护措施3；定期维护措施4

要求：
1. 每个措施都要具体可行，如"在财位摆放金蟾"而非"增强财运"
2. 立即执行：指当天或本周内可以完成的措施
3. 定期维护：指需要周期性进行的维护措施
4. 严格使用分号分隔，每个分号分段都是完整的执行建议
5. 不要使用任何标记符号或格式化符号
6. 只输出两行，第一行立即执行，第二行定期维护`;
  }

  /**
   * 构建英文优化提示
   * @param {object} classifiedContent - 已分类的内容
   * @returns {string} 英文优化提示
   */
  buildEnglishOptimizationPrompt(classifiedContent) {
    return `As a Feng Shui expert, please extract all improvement measures and optimization suggestions from the following analyzed Feng Shui content, categorized by implementation timing:

Analysis Content:
- Direction Analysis: ${classifiedContent.directionAnalysis || ''}
- Layout Suggestions: ${classifiedContent.layoutSuggestions || ''}
- Timing Suggestions: ${classifiedContent.timingSuggestions || ''}
- Important Notes: ${classifiedContent.importantNotes || ''}

Please extract all specific, actionable improvement measures and categorize them according to the following format (strictly using semicolon-separated format):

***IMMEDIATE_START***
Immediate action measure 1; Immediate action measure 2; Immediate action measure 3; Other immediately actionable improvement methods
***IMMEDIATE_END***

***REGULAR_START***
Regular maintenance measure 1; Regular maintenance measure 2; Regular maintenance measure 3; Other periodic maintenance improvement methods
***REGULAR_END***

Requirements:
1. Each measure must be specific and actionable, such as "Place money toad in wealth position" rather than "Enhance wealth luck"
2. Immediate actions: measures that can be completed today or within this week
3. Regular actions: measures that need to be performed periodically for maintenance
4. Strictly use semicolon separation, each semicolon segment is a complete execution suggestion
5. Do not use any Markdown format symbols or title prefixes
6. Extract from original content, do not add new suggestions yourself
7. IMPORTANT: All suggestions must be in English`;
  }

  /**
   * 从AI回应文本中智能解析优化方案
   * @param {string} aiResponse - AI回应内容
   * @param {object} classifiedContent - 已分类的内容
   * @returns {object} 解析后的优化方案
   */
  parseOptimizationFromText(aiResponse, classifiedContent, language = 'zh') {
    // 如果AI回应包含实际内容，尝试解析两行格式
    if (aiResponse && aiResponse.length > 50) {
      const lines = aiResponse.split('\n').map(line => line.trim()).filter(line => line.length > 10);
      
      if (lines.length >= 2) {
        // 第一行为立即执行，第二行为定期维护
        return {
          immediate: lines[0],
          regular: lines[1]
        };
      } else if (lines.length === 1) {
        // 只有一行，尝试分号分割
        const parts = lines[0].split('；').filter(part => part.trim().length > 5);
        if (parts.length >= 4) {
          return {
            immediate: parts.slice(0, Math.ceil(parts.length / 2)).join('；'),
            regular: parts.slice(Math.ceil(parts.length / 2)).join('；')
          };
        }
      }
      
      // 如果格式不符合预期，尝试关键词分类
      const sentences = aiResponse.split(/[；。\n;]/).filter(s => s.trim().length > 5);
      const immediateKeywords = language === 'en' ? 
        ['immediately', 'now', 'today', 'place', 'adjust', 'clean', 'organize'] :
        ['立即', '马上', '当天', '现在', '摆放', '调整', '清理', '整理'];
      
      const regularKeywords = language === 'en' ?
        ['regularly', 'monthly', 'seasonal', 'maintain', 'keep', 'check'] :
        ['定期', '每月', '季节', '维护', '保持', '检查'];
      
      const immediate = [];
      const regular = [];
      
      sentences.forEach(sentence => {
        const hasImmediate = immediateKeywords.some(keyword => sentence.includes(keyword));
        const hasRegular = regularKeywords.some(keyword => sentence.includes(keyword));
        
        if (hasImmediate && !hasRegular) {
          immediate.push(sentence.trim());
        } else if (hasRegular) {
          regular.push(sentence.trim());
        } else {
          // 默认归为立即执行
          immediate.push(sentence.trim());
        }
      });
      
      const separator = language === 'en' ? '; ' : '；';
      return {
        immediate: immediate.slice(0, 4).join(separator),
        regular: regular.slice(0, 4).join(separator)
      };
    }
    
    // 如果AI回应不够用，使用备用方案
    return this.fallbackOptimizationPlan(classifiedContent, language);
  }

  /**
   * 备用优化方案生成
   * @param {object} classifiedContent - 已分类的内容
   * @param {string} language - 语言设置
   * @returns {object} 备用优化方案
   */
  fallbackOptimizationPlan(classifiedContent, language = 'zh') {
    if (language === 'en') {
      // 英文备用方案
      const immediate = `Adjust main furniture layout; Clear pathways keep unobstructed; Optimize indoor lighting conditions; Organize space avoid clutter accumulation`;
      const regular = `Monthly space cleansing and organization; Regular check Feng Shui items placement; Seasonal indoor layout adjustments; Maintain space clean and orderly`;
      
      console.log('🎭 使用英文备用优化方案');
      return { immediate, regular };
    } else {
      // 中文备用方案
      const immediate = `调整主要家具布局；清理通道保持畅通；优化室内照明条件；整理空间避免杂物堆积`;
      const regular = `每月进行空间净化和整理；定期检查风水物品摆放；季节性调整室内布局；保持空间清洁有序`;

      console.log('🎭 使用备用优化方案');
      return { immediate, regular };
    }
  }

  /**
   * 清理格式符号
   * @param {string} text - 原始文本
   * @returns {string} 清理后的文本
   */
  cleanFormatSymbols(text) {
    return text
      .replace(/###\s*/g, '') // 移除###
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除**粗体**
      .replace(/##\s*/g, '') // 移除##
      .replace(/\*\s*/g, '') // 移除列表*
      .replace(/\|\s*/g, '') // 移除表格|
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/---+/g, '') // 移除分割线
      .trim();
  }

  /**
   * 备用分类方法（当AI分类失败时使用）
   * @param {string} rawAnalysis - 原始分析内容
   * @returns {object} 分类结果
   */
  fallbackClassification(rawAnalysis) {
    console.log('🔄 使用增强型备用分类方法');
    const cleanText = this.cleanFormatSymbols(rawAnalysis);
    
    // 增强的正则表达式模式，支持更多格式变体
    const patterns = {
      totalScore: /(?:总体评分|评分|总分|综合评分|整体评分)[：:\s]*(\d+分?[\s\S]{0,200}?)(?=(?:\n|。|；|方位|朝向|布局)|$)/i,
      directionAnalysis: /(?:方位分析|朝向分析|方向分析|入户门|朝向)[：:\s]*([\s\S]*?)(?=(?:布局|户型|时间|注意|改善|建议)|$)/i,
      layoutSuggestions: /(?:布局优化建议|布局建议|户型|格局|空间|房间)[：:\s]*([\s\S]*?)(?=(?:时间|注意|改善|建议|禁忌)|$)/i,
      timingSuggestions: /(?:时间建议|最佳时机|择日|时机|月份|季节)[：:\s]*([\s\S]*?)(?=(?:注意|禁忌|改善)|$)/i,
      importantNotes: /(?:注意事项|禁忌|重要|提醒|避免|不宜)[：:\s]*([\s\S]*?)$/i
    };

    const result = {};
    
    // 先尝试模式匹配
    Object.keys(patterns).forEach(key => {
      const match = cleanText.match(patterns[key]);
      result[key] = match ? match[1].trim() : '';
    });

    // 如果主要部分都没找到，使用智能分段
    if (!result.totalScore && !result.directionAnalysis && !result.layoutSuggestions) {
      console.log('🔄 模式匹配失败，尝试智能分段...');
      const intelligentResult = this.intelligentTextSegmentation(cleanText);
      this.recordParsingStats('intelligent', intelligentResult);
      return intelligentResult;
    }

    // 如果没有找到评分，尝试多种方式提取
    if (!result.totalScore) {
      // 尝试多种评分格式
      const scorePatterns = [
        /(\d+)分/,
        /评分[：:\s]*(\d+)/,
        /(\d+)\s*points?/i,
        /总分[：:\s]*(\d+)/
      ];
      
      for (let pattern of scorePatterns) {
        const scoreMatch = cleanText.match(pattern);
        if (scoreMatch) {
          result.totalScore = `${scoreMatch[1]}分`;
          break;
        }
      }
      
      // 如果还是没找到，设置默认值
      if (!result.totalScore) {
        result.totalScore = '75分 - 基于风水分析综合评估';
      }
    }

    console.log('✅ 备用分类完成:', Object.keys(result).filter(k => result[k]).length, '个部分成功提取');
    return result;
  }

  /**
   * 智能文本分段 - 当正则匹配失败时的最后手段
   * @param {string} text - 清理后的文本
   * @returns {object} 分段结果
   */
  intelligentTextSegmentation(text) {
    console.log('🤖 启用智能文本分段');
    const sentences = text.split(/[。！？；\n]/).filter(s => s.trim().length > 5);
    
    const result = {
      totalScore: '75分 - 基于传统风水理论综合评估',
      directionAnalysis: '',
      layoutSuggestions: '',
      timingSuggestions: '',
      importantNotes: ''
    };

    // 关键词分类
    const keywords = {
      direction: ['朝向', '方位', '方向', '东南西北', '入户门', '大门', '坐向'],
      layout: ['布局', '格局', '户型', '空间', '客厅', '卧室', '厨房', '房间', '家具'],
      timing: ['时间', '时机', '月份', '季节', '春夏秋冬', '择日', '农历'],
      notes: ['注意', '禁忌', '避免', '不宜', '提醒', '重要']
    };

    sentences.forEach(sentence => {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) return;

      // 根据关键词分类到不同部分
      let classified = false;
      for (let [category, words] of Object.entries(keywords)) {
        if (words.some(word => cleanSentence.includes(word))) {
          const targetKey = category === 'direction' ? 'directionAnalysis' :
                           category === 'layout' ? 'layoutSuggestions' :
                           category === 'timing' ? 'timingSuggestions' : 'importantNotes';
          
          if (result[targetKey].length < 200) { // 避免单个部分过长
            result[targetKey] += (result[targetKey] ? '；' : '') + cleanSentence;
            classified = true;
            break;
          }
        }
      }

      // 未分类的句子放到布局建议中
      if (!classified && result.layoutSuggestions.length < 150) {
        result.layoutSuggestions += (result.layoutSuggestions ? '；' : '') + cleanSentence;
      }
    });

    console.log('✅ 智能分段完成');
    return result;
  }

  /**
   * 智能地址分析 - 根据地址推断周边环境
   * @param {string} address - 详细地址
   * @returns {string} 环境分析提示
   */
  analyzeAddressEnvironment(address) {
    if (!address) return '';
    
    const environmentHints = [];
    const addressLower = address.toLowerCase();
    
    // 🏔️ 地形分析
    if (addressLower.includes('山') || addressLower.includes('hill') || addressLower.includes('mountain')) {
      environmentHints.push('山地地形，气势雄厚，但需注意山势走向对气流的影响');
    } else if (addressLower.includes('江') || addressLower.includes('河') || addressLower.includes('river')) {
      environmentHints.push('临水而居，水为财源，但需关注水流方向是否形成环抱或反弓');
    } else if (addressLower.includes('湖') || addressLower.includes('lake') || addressLower.includes('池')) {
      environmentHints.push('湖水环境，聚气效果佳，利于财运积聚');
    } else if (addressLower.includes('海') || addressLower.includes('sea') || addressLower.includes('coast')) {
      environmentHints.push('海岸地带，视野开阔，但需防范海风过强影响气场稳定');
    } else {
      environmentHints.push('平原地势，气流相对平缓，适合稳定发展');
    }
    
    // 🏙️ 城市区域分析
    if (addressLower.includes('cbd') || addressLower.includes('中心') || addressLower.includes('center')) {
      environmentHints.push('商业中心区域，阳气旺盛，利于事业发展，但需注意噪音煞');
    } else if (addressLower.includes('住宅') || addressLower.includes('residential') || addressLower.includes('小区')) {
      environmentHints.push('住宅区环境，气场相对安静，适合居家生活');
    } else if (addressLower.includes('工业') || addressLower.includes('industrial')) {
      environmentHints.push('工业区附近，需特别注意空气质量和噪音对风水的不利影响');
    }
    
    // 🛣️ 道路交通分析
    if (addressLower.includes('高速') || addressLower.includes('highway') || addressLower.includes('快速')) {
      environmentHints.push('高速路附近，车流快速，易形成冲煞，建议设置化解措施');
    } else if (addressLower.includes('环路') || addressLower.includes('ring') || addressLower.includes('围')) {
      environmentHints.push('环路地带，道路环抱，聚气效果相对较好');
    }
    
    // 🌸 特殊地标分析
    if (addressLower.includes('公园') || addressLower.includes('park') || addressLower.includes('花园')) {
      environmentHints.push('公园绿地环境，绿化丰富，有利于气场调和');
    } else if (addressLower.includes('学校') || addressLower.includes('school') || addressLower.includes('大学')) {
      environmentHints.push('学府区域，文昌气旺，利于学业和智慧发展');
    } else if (addressLower.includes('医院') || addressLower.includes('hospital')) {
      environmentHints.push('医院附近，阴气相对较重，建议增强阳气元素');
    } else if (addressLower.includes('寺庙') || addressLower.includes('temple') || addressLower.includes('教堂') || addressLower.includes('church')) {
      environmentHints.push('宗教场所附近，灵气充足，但需保持尊重和谐');
    }
    
    return environmentHints.length > 0 ? 
      `\n【周边环境智能推断】\n- ${environmentHints.join('\n- ')}` : '';
  }

  /**
   * 三元九运与时空能量分析系统
   */
  
  /**
   * 获取当前三元九运信息
   * @param {number} year - 年份
   * @returns {object} 元运信息
   */
  getCurrentYuanYun(year = 2025) {
    // 三元九运周期表 (每运20年)
    const yuanYunCycles = [
      { period: 1, name: '一白贪狼', years: [1864, 1883], element: '水', color: '白', nature: '吉' },
      { period: 2, name: '二黑巨门', years: [1884, 1903], element: '土', color: '黑', nature: '凶' },
      { period: 3, name: '三碧禄存', years: [1904, 1923], element: '木', color: '碧', nature: '凶' },
      { period: 4, name: '四绿文曲', years: [1924, 1943], element: '木', color: '绿', nature: '吉' },
      { period: 5, name: '五黄廉贞', years: [1944, 1963], element: '土', color: '黄', nature: '大凶' },
      { period: 6, name: '六白武曲', years: [1964, 1983], element: '金', color: '白', nature: '吉' },
      { period: 7, name: '七赤破军', years: [1984, 2003], element: '金', color: '赤', nature: '凶' },
      { period: 8, name: '八白左辅', years: [2004, 2023], element: '土', color: '白', nature: '大吉' },
      { period: 9, name: '九紫右弼', years: [2024, 2043], element: '火', color: '紫', nature: '大吉' }
    ];
    
    // 找到当前年份对应的元运
    for (const cycle of yuanYunCycles) {
      if (year >= cycle.years[0] && year <= cycle.years[1]) {
        return {
          ...cycle,
          currentYear: year,
          yearsRemaining: cycle.years[1] - year,
          isCurrentPeak: year >= cycle.years[0] + 10 // 每运的后10年为旺盛期
        };
      }
    }
    
    // 默认返回九紫运
    return yuanYunCycles[8];
  }
  
  /**
   * 计算流年飞星
   * @param {number} year - 年份
   * @returns {object} 流年飞星信息
   */
  getAnnualFlyingStars(year = 2025) {
    // 2025年乙巳年飞星布局
    const annualStars = {
      center: { star: 3, name: '三碧禄存', element: '木', nature: '凶', advice: '避免动土装修' },
      northwest: { star: 4, name: '四绿文曲', element: '木', nature: '吉', advice: '文昌位，利学业事业' },
      west: { star: 5, name: '五黄廉贞', element: '土', nature: '大凶', advice: '严禁动土，需化解' },
      northeast: { star: 6, name: '六白武曲', element: '金', nature: '吉', advice: '偏财位，利投资' },
      south: { star: 7, name: '七赤破军', element: '金', nature: '凶', advice: '防盗防官非' },
      north: { star: 8, name: '八白左辅', element: '土', nature: '大吉', advice: '正财位，最旺方位' },
      southwest: { star: 9, name: '九紫右弼', element: '火', nature: '吉', advice: '喜庆桃花位' },
      east: { star: 1, name: '一白贪狼', element: '水', nature: '吉', advice: '财运位，可催旺' },
      southeast: { star: 2, name: '二黑巨门', element: '土', nature: '凶', advice: '病符位，需化解' }
    };
    
    return {
      year: year,
      yearStem: '乙',
      yearBranch: '巳',
      element: '木',
      stars: annualStars,
      mostAuspicious: 'north', // 八白位
      mostInauspicious: 'west' // 五黄位
    };
  }
  
  /**
   * 生辰八字五行分析
   * @param {string} birthInfo - 生辰信息
   * @returns {object} 五行分析结果
   */
  analyzeBirthElements(birthInfo) {
    if (!birthInfo) return null;
    
    // 简化的五行推算 (实际应用中需要更复杂的算法)
    const birthLower = birthInfo.toLowerCase();
    
    // 根据出生年份推算五行 (简化版)
    let dominantElement = '土'; // 默认
    let weakElement = '水';
    
    if (birthInfo.includes('1990') || birthInfo.includes('1991')) {
      dominantElement = '金'; weakElement = '火';
    } else if (birthInfo.includes('1992') || birthInfo.includes('1993')) {
      dominantElement = '水'; weakElement = '土';
    } else if (birthInfo.includes('1994') || birthInfo.includes('1995')) {
      dominantElement = '木'; weakElement = '金';
    } else if (birthInfo.includes('1996') || birthInfo.includes('1997')) {
      dominantElement = '火'; weakElement = '水';
    } else if (birthInfo.includes('1998') || birthInfo.includes('1999')) {
      dominantElement = '土'; weakElement = '木';
    }
    
    // 五行属性对应关系
    const elementProperties = {
      '金': { color: ['白', '金', '银'], direction: ['西', '西北'], season: '秋' },
      '木': { color: ['绿', '青', '蓝'], direction: ['东', '东南'], season: '春' },
      '水': { color: ['黑', '蓝', '灰'], direction: ['北'], season: '冬' },
      '火': { color: ['红', '紫', '橙'], direction: ['南'], season: '夏' },
      '土': { color: ['黄', '棕', '咖啡'], direction: ['中央', '西南', '东北'], season: '长夏' }
    };
    
    return {
      dominantElement: dominantElement,
      weakElement: weakElement,
      favorableColors: elementProperties[dominantElement].color,
      favorableDirections: elementProperties[dominantElement].direction,
      favorableSeason: elementProperties[dominantElement].season,
      needsSupport: elementProperties[weakElement],
      compatibility: this.calculateElementCompatibility(dominantElement)
    };
  }
  
  /**
   * 计算五行相生相克关系
   * @param {string} element - 主五行
   * @returns {object} 相生相克关系
   */
  calculateElementCompatibility(element) {
    const relationships = {
      '金': { generates: '水', controls: '木', generatedBy: '土', controlledBy: '火' },
      '木': { generates: '火', controls: '土', generatedBy: '水', controlledBy: '金' },
      '水': { generates: '木', controls: '火', generatedBy: '金', controlledBy: '土' },
      '火': { generates: '土', controls: '金', generatedBy: '木', controlledBy: '水' },
      '土': { generates: '金', controls: '水', generatedBy: '火', controlledBy: '木' }
    };
    
    return relationships[element] || relationships['土'];
  }
  
  /**
   * 综合时空能量分析
   * @param {object} formData - 表单数据
   * @returns {string} 时空分析结果
   */
  generateTimeSpaceAnalysis(formData) {
    const currentYear = new Date().getFullYear();
    const yuanYun = this.getCurrentYuanYun(currentYear);
    const flyingStars = this.getAnnualFlyingStars(currentYear);
    const birthElements = this.analyzeBirthElements(formData.birthInfo);
    
    let analysis = `\n【时空能量专业分析】`;
    
    // 三元九运分析
    analysis += `\n- 当前元运：${yuanYun.name}(${yuanYun.years[0]}-${yuanYun.years[1]})`;
    analysis += `\n- 运势性质：${yuanYun.nature}运，主色${yuanYun.color}，五行属${yuanYun.element}`;
    analysis += `\n- 运势状态：${yuanYun.isCurrentPeak ? '旺盛期' : '起始期'}，还有${yuanYun.yearsRemaining}年`;
    
    // 流年飞星分析
    analysis += `\n- ${currentYear}年飞星：${flyingStars.yearStem}${flyingStars.yearBranch}年，五行属${flyingStars.element}`;
    analysis += `\n- 最旺方位：${flyingStars.mostAuspicious}方(${flyingStars.stars[flyingStars.mostAuspicious].name})`;
    analysis += `\n- 最凶方位：${flyingStars.mostInauspicious}方(${flyingStars.stars[flyingStars.mostInauspicious].name})`;
    
    // 朝向与流年飞星的匹配分析
    if (formData.direction) {
      const directionMapping = {
        'north': 'north', 'south': 'south', 'east': 'east', 'west': 'west',
        'northeast': 'northeast', 'northwest': 'northwest', 
        'southeast': 'southeast', 'southwest': 'southwest'
      };
      
      const mappedDirection = directionMapping[formData.direction];
      if (mappedDirection && flyingStars.stars[mappedDirection]) {
        const directionStar = flyingStars.stars[mappedDirection];
        analysis += `\n- 住宅朝向飞星：${directionStar.name}，性质${directionStar.nature}`;
        analysis += `\n- 朝向建议：${directionStar.advice}`;
      }
    }
    
    // 生辰八字匹配分析
    if (birthElements) {
      analysis += `\n- 居住者五行：主${birthElements.dominantElement}，弱${birthElements.weakElement}`;
      analysis += `\n- 有利颜色：${birthElements.favorableColors.join('、')}`;
      analysis += `\n- 有利方位：${birthElements.favorableDirections.join('、')}`;
      
      // 与当前元运的匹配度
      const compatibility = this.calculateElementCompatibility(birthElements.dominantElement);
      if (compatibility.generates === yuanYun.element) {
        analysis += `\n- 元运匹配：个人五行生助当前元运，大吉之象`;
      } else if (compatibility.controlledBy === yuanYun.element) {
        analysis += `\n- 元运匹配：当前元运克制个人五行，需要化解`;
      } else {
        analysis += `\n- 元运匹配：与当前元运关系平和，无明显冲克`;
      }
    }
    
    return analysis;
  }

  /**
   * 记录解析统计
   * @param {string} method - 解析方法 ('markup', 'regex', 'intelligent')
   * @param {object} result - 解析结果
   */
  recordParsingStats(method, result) {
    this.parsingStats.total++;
    
    // 检查解析成功程度
    const hasMainContent = result && (result.totalScore || result.directionAnalysis || result.layoutSuggestions);
    
    if (hasMainContent) {
      this.parsingStats.successful++;
      
      switch(method) {
        case 'markup':
          this.parsingStats.markupSuccess++;
          break;
        case 'regex':
          this.parsingStats.regexSuccess++;
          break;
        case 'intelligent':
          this.parsingStats.intelligentSuccess++;
          break;
      }
    } else {
      this.parsingStats.fallback++;
    }
  }

  /**
   * 获取解析统计
   * @returns {object} 解析统计数据
   */
  getParsingStats() {
    const { total, successful, fallback, markupSuccess, regexSuccess, intelligentSuccess } = this.parsingStats;
    
    return {
      total,
      successful,
      fallback,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : 0,
      methods: {
        markup: markupSuccess,
        regex: regexSuccess, 
        intelligent: intelligentSuccess
      },
      markupSuccessRate: total > 0 ? ((markupSuccess / total) * 100).toFixed(1) : 0
    };
  }
}

module.exports = FengshuiAnalyzer; 