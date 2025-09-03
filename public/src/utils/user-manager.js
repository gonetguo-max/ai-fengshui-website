// 用户管理器 - 简化版数据收集系统
const crypto = require('crypto');

class UserManager {
  constructor() {
    // 存储用户行为数据，用于分析
    this.storage = new Map();
    this.initCleanupTimer();
  }

  /**
   * 生成用户指纹
   * @param {Object} req - Express请求对象
   * @returns {string} 用户指纹
   */
  generateFingerprint(req) {
    const ip = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const today = new Date().toDateString();
    
    // 生成基于IP+UserAgent+日期的指纹（用于统计，不限制使用）
    return crypto.createHash('md5')
      .update(ip + userAgent + today)
      .digest('hex').substring(0, 16);
  }

  /**
   * 获取客户端真实IP
   * @param {Object} req - Express请求对象
   * @returns {string} 客户端IP
   */
  getClientIP(req) {
    return req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip ||
           '127.0.0.1';
  }

  /**
   * 记录用户使用（纯统计用途，不限制）
   * @param {string} fingerprint - 用户指纹
   * @param {Object} metadata - 使用元数据
   */
  recordUsage(fingerprint, metadata = {}) {
    const today = new Date().toDateString();
    const key = `usage_${fingerprint}_${today}`;
    const currentUsage = this.storage.get(key) || 0;
    
    this.storage.set(key, currentUsage + 1);
    console.log(`📊 记录用户 ${fingerprint} 使用，当前次数: ${currentUsage + 1}`);
    
    // 记录详细使用数据（用于分析）
    this.recordAnalytics(fingerprint, metadata);
    
    // 设置24小时后自动清理
    setTimeout(() => {
      this.storage.delete(key);
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * 记录用户行为分析数据
   * @param {string} fingerprint - 用户指纹
   * @param {Object} metadata - 分析元数据
   */
  recordAnalytics(fingerprint, metadata) {
    const analyticsKey = `analytics_${new Date().toDateString()}`;
    const todayAnalytics = this.storage.get(analyticsKey) || {
      totalAnalyses: 0,
      uniqueUsers: new Set(),
      userRegions: {},
      uploadTypes: {},
      timestamp: new Date().toISOString()
    };

    // 更新统计数据
    todayAnalytics.totalAnalyses++;
    todayAnalytics.uniqueUsers.add(fingerprint);
    
    // 记录用户地区（基于IP）
    if (metadata.region) {
      todayAnalytics.userRegions[metadata.region] = 
        (todayAnalytics.userRegions[metadata.region] || 0) + 1;
    }
    
    // 记录上传类型
    if (metadata.hasImage) {
      todayAnalytics.uploadTypes.withImage = 
        (todayAnalytics.uploadTypes.withImage || 0) + 1;
    } else {
      todayAnalytics.uploadTypes.textOnly = 
        (todayAnalytics.uploadTypes.textOnly || 0) + 1;
    }

    this.storage.set(analyticsKey, todayAnalytics);
  }

  /**
   * 获取用户使用统计
   * @param {string} fingerprint - 用户指纹
   * @returns {Object} 使用统计
   */
  getUserStats(fingerprint) {
    const today = new Date().toDateString();
    const usageKey = `usage_${fingerprint}_${today}`;
    const dailyUsage = this.storage.get(usageKey) || 0;
    
    return {
      fingerprint: fingerprint,
      dailyUsage: dailyUsage,
      hasFreeAccess: true, // 现在完全免费
      lastUsed: new Date().toISOString()
    };
  }

  /**
   * 生成完整分析报告（现在对所有用户免费）
   * @param {Object} analysisResult - 完整分析结果
   * @returns {Object} 完整报告
   */
  generateFullReport(analysisResult) {
    return {
      ...analysisResult,
      type: 'full',
      watermark: false,
      freeAccess: true,
      message: '现在完全免费，感谢您的使用！'
    };
  }

  /**
   * 根据用户等级生成分层报告
   * @param {Object} analysisResult - 完整分析结果
   * @param {string} userTier - 用户等级：FREE/BASIC/PROFESSIONAL/MASTER
   * @returns {Object} 分层报告
   */
  generateTieredReport(analysisResult, userTier = 'FREE') {
    const result = {
      ...analysisResult,
      userTier: userTier,
      upgradePrompt: this.getUpgradePrompt(userTier)
    };

    // 根据用户等级截断内容
    switch (userTier) {
      case 'FREE':
        // 免费版：高度限制内容，强化升级提示
        result.analysis = this.truncateText(analysisResult.analysis || '', 300);
        if (analysisResult.recommendations) {
          result.recommendations = this.truncateText(analysisResult.recommendations, 200);
        }
        result.upgradeMessage = '🚀 Coming Soon! Professional analysis for $3.99+';
        result.showUpgradePrompt = true;
        break;

      case 'BASIC':
        // Basic版：朝向分析完整，其他限制
        result.analysis = this.truncateText(analysisResult.analysis || '', 600);
        if (analysisResult.recommendations) {
          result.recommendations = this.truncateText(analysisResult.recommendations, 400);
        }
        result.upgradeMessage = '🚀 Coming Soon! Advanced features for $4.99';
        result.showUpgradePrompt = true;
        break;

      case 'PROFESSIONAL':
        // Professional版：大部分功能完整，注意事项限制
        result.analysis = analysisResult.analysis;
        result.recommendations = analysisResult.recommendations;
        if (analysisResult.importantNotes) {
          result.importantNotes = this.truncateText(analysisResult.importantNotes, 300);
        }
        result.upgradeMessage = '🚀 Coming Soon! Master consultation for $29.99';
        result.showUpgradePrompt = true;
        break;

      case 'MASTER':
        // Master版：完整功能
        result.analysis = analysisResult.analysis;
        result.recommendations = analysisResult.recommendations;
        result.importantNotes = analysisResult.importantNotes;
        result.upgradeMessage = '';
        result.showUpgradePrompt = false;
        break;

      default:
        // 默认按免费版处理
        return this.generateTieredReport(analysisResult, 'FREE');
    }

    return result;
  }

  /**
   * 截断文本
   * @param {string} text - 原始文本
   * @param {number} maxLength - 最大长度
   * @returns {string} 截断后的文本
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * 获取升级提示信息
   * @param {string} userTier - 用户等级
   * @returns {Object} 升级提示
   */
  getUpgradePrompt(userTier) {
    const prompts = {
      'FREE': {
        show: true,
        title: '解锁完整分析',
        plans: [
          { name: 'Basic', price: '$3.99', features: ['完整朝向分析', '基础改运建议', '详细评分说明'] },
          { name: 'Professional', price: '$4.99', features: ['全部Basic功能', '详细布局方案', '专业改善建议'] },
          { name: 'Master', price: '$29.99', features: ['全部Professional功能', '专业风水提醒', '个性化定制分析'] }
        ]
      },
      'BASIC': {
        show: true,
        title: '升级获得更多功能',
        plans: [
          { name: 'Professional', price: '$4.99', features: ['详细布局方案', '专业改善建议', '完整分析报告'] },
          { name: 'Master', price: '$29.99', features: ['全部Professional功能', '专业风水提醒', '个性化定制分析'] }
        ]
      },
      'PROFESSIONAL': {
        show: true,
        title: '升级至顶级体验',
        plans: [
          { name: 'Master', price: '$29.99', features: ['专业风水提醒', '个性化定制分析', '专属咨询服务'] }
        ]
      },
      'MASTER': {
        show: false,
        title: '',
        plans: []
      }
    };

    return prompts[userTier] || prompts['FREE'];
  }

  /**
   * 记录用户反馈
   * @param {string} fingerprint - 用户指纹
   * @param {Object} feedback - 反馈内容
   */
  recordFeedback(fingerprint, feedback) {
    const feedbackKey = `feedback_${Date.now()}`;
    const feedbackData = {
      fingerprint: fingerprint,
      rating: feedback.rating,
      comment: feedback.comment || '',
      timestamp: new Date().toISOString(),
      userAgent: feedback.userAgent || ''
    };
    
    this.storage.set(feedbackKey, feedbackData);
    console.log(`💬 收到用户反馈: ${feedback.rating}星 - ${feedback.comment}`);
  }

  /**
   * 记录分享行为
   * @param {string} fingerprint - 用户指纹
   * @param {string} shareType - 分享类型
   */
  recordShare(fingerprint, shareType) {
    const shareKey = `share_${Date.now()}`;
    const shareData = {
      fingerprint: fingerprint,
      shareType: shareType, // 'social', 'link', 'image'
      timestamp: new Date().toISOString()
    };
    
    this.storage.set(shareKey, shareData);
    console.log(`🔗 用户分享: ${shareType}`);
  }

  /**
   * 获取今日分析统计
   * @returns {Object} 今日统计
   */
  getTodayAnalytics() {
    const analyticsKey = `analytics_${new Date().toDateString()}`;
    const analytics = this.storage.get(analyticsKey) || {
      totalAnalyses: 0,
      uniqueUsers: new Set(),
      userRegions: {},
      uploadTypes: {}
    };

    return {
      totalAnalyses: analytics.totalAnalyses,
      uniqueUsers: analytics.uniqueUsers.size,
      userRegions: analytics.userRegions,
      uploadTypes: analytics.uploadTypes,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取用户反馈统计
   * @returns {Array} 反馈列表
   */
  getFeedbackSummary() {
    const feedbacks = [];
    
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('feedback_')) {
        feedbacks.push(value);
      }
    }
    
    // 按时间排序，最新的在前
    return feedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 获取分享统计
   * @returns {Object} 分享统计
   */
  getShareStats() {
    const shares = [];
    
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('share_')) {
        shares.push(value);
      }
    }
    
    const shareTypes = {};
    shares.forEach(share => {
      shareTypes[share.shareType] = (shareTypes[share.shareType] || 0) + 1;
    });

    return {
      totalShares: shares.length,
      shareTypes: shareTypes,
      recentShares: shares.slice(0, 10)
    };
  }

  /**
   * 初始化清理定时器
   */
  initCleanupTimer() {
    // 每小时清理过期数据
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  /**
   * 清理过期数据
   */
  cleanupOldData() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;
    
    for (const [key, value] of this.storage.entries()) {
      // 清理3天前的使用记录
      if (key.startsWith('usage_') || key.startsWith('analytics_')) {
        const dateStr = key.split('_').pop();
        if (new Date(dateStr) < threeDaysAgo) {
          this.storage.delete(key);
          cleanedCount++;
        }
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 清理了 ${cleanedCount} 个过期的数据记录`);
    }
  }

  /**
   * 获取系统统计信息
   * @returns {Object} 系统统计
   */
  getSystemStats() {
    const todayAnalytics = this.getTodayAnalytics();
    const feedbacks = this.getFeedbackSummary();
    const shareStats = this.getShareStats();
    
    // 计算平均评分
    const ratings = feedbacks.filter(f => f.rating).map(f => f.rating);
    const avgRating = ratings.length > 0 ? 
      (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
    
    return {
      today: todayAnalytics,
      feedback: {
        totalFeedbacks: feedbacks.length,
        averageRating: avgRating,
        recentFeedbacks: feedbacks.slice(0, 5)
      },
      sharing: shareStats,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = UserManager;