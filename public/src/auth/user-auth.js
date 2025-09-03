// 用户认证系统 - 简化版本用于MVP测试
const crypto = require('crypto');

// 用户等级配置
const USER_TIERS = {
  FREE: {
    name: '免费版',
    displayName: '基础风水分析',
    price: 0,
    maxRequests: 3,
    features: ['basic_analysis', 'text_export'],
    aiModel: 'qwen3',
    reportTemplate: 'basic',
    description: '基础风水评分和简化建议'
  },
  PREMIUM: {
    name: '进阶版', 
    displayName: '专业风水分析',
    price: 4.99,
    maxRequests: 10,
    features: ['detailed_analysis', 'image_upload', 'pdf_export', 'time_advice'],
    aiModel: 'deepseek-r1',
    reportTemplate: 'premium',
    description: '详细分析 + 户型图识别 + 时间建议'
  },
  VIP: {
    name: '高级版',
    displayName: '大师级风水咨询',
    price: 29.90,
    maxRequests: -1, // 无限制
    features: ['master_analysis', '3d_visualization', 'personal_consultation', 'priority_support'],
    aiModel: 'dual-engine',
    reportTemplate: 'vip',
    description: '大师级深度分析 + 个性化建议 + 专属客服'
  }
};

// 简化版用户存储 (生产环境应使用数据库)
const users = new Map();
const sessions = new Map();

class UserAuth {
  constructor() {
    this.users = users;
    this.sessions = sessions;
  }

  // 生成用户ID
  generateId() {
    return 'user_' + crypto.randomBytes(8).toString('hex');
  }

  // 生成会话令牌
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 密码哈希
  async hashPassword(password) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  }

  // 验证密码
  async verifyPassword(password, hash) {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }

  // 用户注册
  async register(email, password, fingerprint = null) {
    console.log(`🆕 新用户注册: ${email}`);

    if (this.users.has(email)) {
      throw new Error('用户已存在');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = {
      id: this.generateId(),
      email,
      password: hashedPassword,
      tier: 'FREE',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      requestCount: 0,
      requestHistory: [],
      fingerprint,
      subscription: null
    };

    this.users.set(email, user);
    const session = this.createSession(user);
    
    console.log(`✅ 用户注册成功: ${user.id} (${email})`);
    return { user: this.sanitizeUser(user), session };
  }

  // 用户登录
  async login(email, password) {
    console.log(`🔑 用户登录尝试: ${email}`);

    const user = this.users.get(email);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (!(await this.verifyPassword(password, user.password))) {
      throw new Error('密码错误');
    }

    // 更新最后活跃时间
    user.lastActiveAt = new Date();
    const session = this.createSession(user);
    
    console.log(`✅ 用户登录成功: ${user.id} (${email})`);
    return { user: this.sanitizeUser(user), session };
  }

  // 创建会话
  createSession(user) {
    const token = this.generateToken();
    const session = {
      token,
      userId: user.id,
      email: user.email,
      tier: user.tier,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天过期
    };

    this.sessions.set(token, session);
    return session;
  }

  // 验证会话
  validateSession(token) {
    const session = this.sessions.get(token);
    if (!session) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  // 获取用户信息
  getUser(userId) {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        return this.sanitizeUser(user);
      }
    }
    return null;
  }

  // 清理用户信息（移除敏感数据）
  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  // 用户升级
  async upgradeTier(userId, newTier, paymentData = null) {
    console.log(`⬆️ 用户升级: ${userId} -> ${newTier}`);

    const user = this.getFullUser(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (!USER_TIERS[newTier]) {
      throw new Error('无效的用户等级');
    }

    const oldTier = user.tier;
    user.tier = newTier;
    user.upgradedAt = new Date();
    
    if (paymentData) {
      user.subscription = {
        tier: newTier,
        paymentId: paymentData.id,
        amount: USER_TIERS[newTier].price,
        purchasedAt: new Date(),
        ...paymentData
      };
    }

    // 更新所有相关会话
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        session.tier = newTier;
      }
    }

    console.log(`✅ 用户升级成功: ${userId} (${oldTier} -> ${newTier})`);
    return this.sanitizeUser(user);
  }

  // 获取完整用户信息（内部使用）
  getFullUser(userId) {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  }

  // 记录用户请求
  recordRequest(userId, requestData) {
    const user = this.getFullUser(userId);
    if (user) {
      user.requestCount++;
      user.requestHistory.push({
        timestamp: new Date(),
        ...requestData
      });
      user.lastActiveAt = new Date();
    }
  }

  // 检查用户是否可以使用功能
  canUseFeature(userId, feature) {
    const user = this.getFullUser(userId);
    if (!user) return false;

    const tierConfig = USER_TIERS[user.tier];
    return tierConfig.features.includes(feature);
  }

  // 检查用户是否还有请求次数
  hasRequestsLeft(userId) {
    const user = this.getFullUser(userId);
    if (!user) return false;

    const tierConfig = USER_TIERS[user.tier];
    return tierConfig.maxRequests === -1 || user.requestCount < tierConfig.maxRequests;
  }

  // 获取用户使用统计
  getUserStats(userId) {
    const user = this.getFullUser(userId);
    if (!user) return null;

    const tierConfig = USER_TIERS[user.tier];
    return {
      tier: user.tier,
      tierName: tierConfig.displayName,
      requestCount: user.requestCount,
      maxRequests: tierConfig.maxRequests,
      remainingRequests: tierConfig.maxRequests === -1 ? -1 : Math.max(0, tierConfig.maxRequests - user.requestCount),
      features: tierConfig.features,
      joinedAt: user.createdAt,
      lastActiveAt: user.lastActiveAt
    };
  }
}

// 用户等级管理器
class TierManager {
  static getTierConfig(tier) {
    return USER_TIERS[tier] || null;
  }

  static getAllTiers() {
    return USER_TIERS;
  }

  static canUseFeature(tier, feature) {
    const config = USER_TIERS[tier];
    return config ? config.features.includes(feature) : false;
  }

  static hasRequestsLeft(requestCount, tier) {
    const config = USER_TIERS[tier];
    if (!config) return false;
    return config.maxRequests === -1 || requestCount < config.maxRequests;
  }

  static getUpgradeOptions(currentTier) {
    const tiers = Object.keys(USER_TIERS);
    const currentIndex = tiers.indexOf(currentTier);
    return tiers.slice(currentIndex + 1).map(tier => ({
      tier,
      ...USER_TIERS[tier]
    }));
  }
}

module.exports = {
  UserAuth,
  TierManager,
  USER_TIERS
};