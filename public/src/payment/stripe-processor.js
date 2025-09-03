// Stripe支付处理器 - 三层级付费系统
const { TierManager } = require('../auth/user-auth.js');

class StripeProcessor {
  constructor() {
    // 开发模式下使用模拟支付
    this.isDevelopmentMode = process.env.NODE_ENV !== 'production';
    
    if (!this.isDevelopmentMode && process.env.STRIPE_SECRET_KEY) {
      this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      console.log('✅ Stripe支付系统已初始化');
    } else {
      console.log('⚠️ 开发模式：使用模拟支付处理器');
    }
    
    this.paymentSessions = new Map(); // 存储支付会话信息
  }

  /**
   * 创建支付会话
   * @param {string} userId - 用户ID
   * @param {string} targetTier - 目标等级
   * @param {string} userEmail - 用户邮箱
   * @returns {Promise<object>} 支付会话信息
   */
  async createPaymentSession(userId, targetTier, userEmail) {
    try {
      const tierConfig = TierManager.getTierConfig(targetTier);
      
      if (!tierConfig || tierConfig.price === 0) {
        throw new Error('无效的付费等级');
      }

      const sessionId = this.generateSessionId();
      
      if (this.isDevelopmentMode) {
        // 开发模式：创建模拟支付会话
        const mockSession = {
          id: sessionId,
          url: `/payment/mock?session_id=${sessionId}`,
          userId: userId,
          targetTier: targetTier,
          amount: tierConfig.price,
          currency: 'usd',
          status: 'pending',
          createdAt: new Date()
        };
        
        this.paymentSessions.set(sessionId, mockSession);
        
        console.log('🎭 创建模拟支付会话:', sessionId);
        return {
          sessionId: sessionId,
          paymentUrl: mockSession.url,
          amount: tierConfig.price,
          currency: 'USD'
        };
        
      } else {
        // 生产模式：创建真实Stripe支付会话
        const session = await this.stripe.checkout.sessions.create({
          customer_email: userEmail,
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `风水大师${tierConfig.displayName}`,
                description: tierConfig.description
              },
              unit_amount: Math.round(tierConfig.price * 100) // Stripe使用分为单位
            },
            quantity: 1
          }],
          mode: 'payment',
          success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/cancel`,
          metadata: {
            userId: userId,
            targetTier: targetTier,
            upgradeType: 'tier_upgrade'
          }
        });

        // 存储会话信息
        this.paymentSessions.set(session.id, {
          id: session.id,
          userId: userId,
          targetTier: targetTier,
          amount: tierConfig.price,
          status: 'pending',
          createdAt: new Date()
        });

        console.log('💳 创建Stripe支付会话:', session.id);
        return {
          sessionId: session.id,
          paymentUrl: session.url,
          amount: tierConfig.price,
          currency: 'USD'
        };
      }
      
    } catch (error) {
      console.error('创建支付会话失败:', error);
      throw error;
    }
  }

  /**
   * 验证支付状态
   * @param {string} sessionId - 支付会话ID
   * @returns {Promise<object>} 支付状态信息
   */
  async verifyPayment(sessionId) {
    try {
      if (this.isDevelopmentMode) {
        // 开发模式：模拟支付验证
        const mockSession = this.paymentSessions.get(sessionId);
        
        if (!mockSession) {
          throw new Error('支付会话不存在');
        }
        
        // 模拟支付成功
        mockSession.status = 'completed';
        mockSession.completedAt = new Date();
        
        console.log('🎭 模拟支付验证成功:', sessionId);
        return {
          success: true,
          sessionId: sessionId,
          userId: mockSession.userId,
          targetTier: mockSession.targetTier,
          amount: mockSession.amount,
          paymentId: `mock_payment_${sessionId.slice(-8)}`,
          completedAt: mockSession.completedAt
        };
        
      } else {
        // 生产模式：验证真实Stripe支付
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
          const sessionInfo = this.paymentSessions.get(sessionId);
          
          return {
            success: true,
            sessionId: sessionId,
            userId: sessionInfo?.userId,
            targetTier: sessionInfo?.targetTier,
            amount: session.amount_total / 100, // 转换回美元
            paymentId: session.payment_intent,
            completedAt: new Date(session.created * 1000)
          };
        } else {
          return {
            success: false,
            status: session.payment_status,
            error: '支付未完成'
          };
        }
      }
      
    } catch (error) {
      console.error('验证支付状态失败:', error);
      throw error;
    }
  }

  /**
   * 处理Stripe Webhook（生产模式）
   * @param {string} body - Webhook请求体
   * @param {string} signature - Webhook签名
   * @returns {object} 处理结果
   */
  async handleWebhook(body, signature) {
    if (this.isDevelopmentMode) {
      console.log('⚠️ 开发模式下跳过Webhook处理');
      return { success: true, message: 'Development mode webhook skip' };
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        body, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log('📡 收到Stripe Webhook:', event.type);

      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handlePaymentSuccess(event.data.object);
          
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailure(event.data.object);
          
        default:
          console.log(`未处理的Webhook事件类型: ${event.type}`);
          return { success: true, message: 'Event type not handled' };
      }
      
    } catch (error) {
      console.error('Webhook处理失败:', error);
      throw error;
    }
  }

  /**
   * 处理支付成功
   * @param {object} session - Stripe会话对象
   * @returns {object} 处理结果
   */
  async handlePaymentSuccess(session) {
    try {
      const { userId, targetTier } = session.metadata;
      
      console.log('💰 支付成功，准备升级用户:', userId, '->', targetTier);
      
      return {
        success: true,
        action: 'upgrade_user',
        userId: userId,
        targetTier: targetTier,
        paymentData: {
          id: session.payment_intent,
          amount: session.amount_total / 100,
          sessionId: session.id
        }
      };
      
    } catch (error) {
      console.error('处理支付成功事件失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 处理支付失败
   * @param {object} paymentIntent - Stripe PaymentIntent对象
   * @returns {object} 处理结果
   */
  async handlePaymentFailure(paymentIntent) {
    console.log('❌ 支付失败:', paymentIntent.id, paymentIntent.last_payment_error?.message);
    
    return {
      success: true,
      action: 'log_failure',
      paymentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message
    };
  }

  /**
   * 生成支付会话ID
   * @returns {string} 会话ID
   */
  generateSessionId() {
    return 'cs_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
  }

  /**
   * 获取支付会话信息
   * @param {string} sessionId - 会话ID
   * @returns {object} 会话信息
   */
  getPaymentSession(sessionId) {
    return this.paymentSessions.get(sessionId);
  }

  /**
   * 清理过期的支付会话
   */
  cleanupExpiredSessions() {
    const now = new Date();
    const expireTime = 24 * 60 * 60 * 1000; // 24小时过期
    
    for (const [sessionId, session] of this.paymentSessions.entries()) {
      if (now - session.createdAt > expireTime) {
        this.paymentSessions.delete(sessionId);
      }
    }
    
    console.log('🧹 清理过期支付会话完成');
  }
}

module.exports = StripeProcessor;