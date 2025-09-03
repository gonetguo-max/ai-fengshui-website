# 风水大师三层级付费系统 - 部署指南

## 🎯 项目概述

这是一个完全实现的三层级付费风水分析系统，包含：

- **免费版 (FREE)**: 基础风水分析
- **进阶版 (PREMIUM)**: $4.99 - 详细专业分析
- **高级版 (VIP)**: $29.90 - 大师级深度咨询

## 🛠️ 技术架构

### 后端架构
```
├── src/
│   ├── api/                 # API核心
│   │   ├── ai-manager.js    # AI模型管理
│   │   └── fengshui-analyzer.js  # 分层风水分析器
│   ├── auth/                # 认证系统
│   │   └── user-auth.js     # 用户等级管理
│   ├── components/          # 前端组件
│   │   └── user-interface.js    # 用户界面组件
│   ├── payment/             # 支付系统
│   │   └── stripe-processor.js  # Stripe集成
│   └── utils/               # 工具类
├── server.js                # Express服务器
├── config.js               # 配置文件
└── package.json            # 依赖管理
```

### 核心功能
- ✅ 用户注册/登录/会话管理
- ✅ JWT认证和权限控制
- ✅ 三层级分析系统
- ✅ Stripe支付集成（开发和生产模式）
- ✅ AI模型智能选择（DeepSeek + Qwen3）
- ✅ 分层报告生成
- ✅ 用户升级和限制管理

## 🚀 快速部署

### 1. 环境要求
```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
创建 `.env` 文件：
```bash
# AI API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
QWEN3_API_KEY=your_qwen3_api_key_here

# 支付配置 (生产环境)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# 服务器配置
PORT=3000
NODE_ENV=production
BASE_URL=https://your-domain.com

# 数据库配置 (未来版本)
# DATABASE_URL=postgresql://user:pass@localhost/fengshui
```

### 4. 启动服务器

#### 开发模式
```bash
npm run dev
# 或
npm start
```

#### 生产模式
```bash
NODE_ENV=production npm start
```

服务器启动成功后会显示：
```
🚀 AI风水网站服务器启动成功！
📍 访问地址: http://localhost:3000
🔮 AI分析: 已启用 (DeepSeek-R1)
```

## 🔧 API接口文档

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 分析接口

#### 风水分析
```http
POST /api/analyze
Authorization: Bearer {token}  // 可选，未登录用户默认免费版
Content-Type: application/json

{
  "houseType": "住宅",
  "direction": "正南",
  "area": "120",
  "description": "三室两厅户型，采光良好"
}
```

### 支付接口

#### 创建支付会话
```http
POST /api/payment/create-session
Authorization: Bearer {token}
Content-Type: application/json

{
  "targetTier": "PREMIUM"  // 或 "VIP"
}
```

#### 验证支付状态
```http
POST /api/payment/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "sessionId": "cs_live_..."
}
```

### 用户接口

#### 获取用户信息
```http
GET /api/user/profile
Authorization: Bearer {token}
```

## 💰 支付系统配置

### Stripe配置

1. **创建Stripe账户**: https://dashboard.stripe.com
2. **获取API密钥**: 开发者 > API密钥
3. **配置Webhook**: 
   - URL: `https://your-domain.com/api/payment/webhook`
   - 事件: `checkout.session.completed`, `payment_intent.payment_failed`

### 开发模式支付测试
系统自动检测开发环境，提供模拟支付功能：
- 支付链接会跳转到模拟支付页面
- 可以测试成功/取消支付流程
- 无需真实Stripe配置

### 生产模式支付
- 需要配置真实的Stripe密钥
- 支持信用卡支付
- 自动处理Webhook回调
- 支持退款和争议处理

## 📊 三层级配置

### 免费版 (FREE)
```javascript
{
  name: '免费版',
  displayName: '基础风水分析',
  price: 0,
  maxRequests: 3,
  features: ['basic_analysis', 'text_export'],
  aiModel: 'qwen3',
  reportTemplate: 'basic'
}
```

### 进阶版 (PREMIUM) - $4.99
```javascript
{
  name: '进阶版',
  displayName: '专业风水分析', 
  price: 4.99,
  maxRequests: 10,
  features: [
    'detailed_analysis', 
    'image_upload', 
    'pdf_export', 
    'time_advice'
  ],
  aiModel: 'deepseek-r1',
  reportTemplate: 'premium'
}
```

### 高级版 (VIP) - $29.90
```javascript
{
  name: '高级版',
  displayName: '大师级风水咨询',
  price: 29.90,
  maxRequests: -1, // 无限制
  features: [
    'master_analysis', 
    '3d_visualization', 
    'personal_consultation', 
    'priority_support'
  ],
  aiModel: 'dual-engine',
  reportTemplate: 'vip'
}
```

## 🔒 安全配置

### 1. 环境变量保护
- 所有敏感信息存储在 `.env` 文件中
- 生产环境使用环境变量而非文件
- API密钥定期轮换

### 2. JWT安全
- 会话令牌7天过期
- 安全的密码哈希 (PBKDF2)
- 自动会话清理

### 3. 支付安全
- Stripe PCI合规
- Webhook签名验证
- 支付状态双重验证

## 📈 监控和日志

### 1. 系统监控
```http
GET /api/system-stats  # 系统统计
GET /api/ai-stats      # AI性能统计
```

### 2. 用户分析
```http  
GET /api/user-status   # 用户使用统计
```

### 3. 日志记录
- 用户行为日志
- API调用统计
- 错误和异常记录
- 支付交易日志

## 🧪 测试指南

### 1. API测试
```bash
node test-apis.js
```

### 2. 手动测试流程
1. 访问 http://localhost:3000
2. 注册新用户账户
3. 进行免费风水分析
4. 测试升级流程
5. 验证支付功能

### 3. 测试用例覆盖
- ✅ 用户注册/登录
- ✅ 分层分析生成
- ✅ 支付流程完整性
- ✅ 权限控制
- ✅ 错误处理

## 🚀 生产部署建议

### 1. 服务器配置
- **CPU**: 2核心以上
- **内存**: 4GB以上
- **存储**: 20GB SSD
- **网络**: 100Mbps

### 2. 域名和SSL
- 配置HTTPS证书
- 设置CDN加速
- 启用GZIP压缩

### 3. 数据库迁移 (未来)
当前使用内存存储，生产环境建议迁移到：
- PostgreSQL (推荐)
- MongoDB
- MySQL

### 4. 缓存和性能
- Redis缓存
- API限流
- 静态资源优化

## 📞 技术支持

### 常见问题

**Q: 端口被占用怎么办？**
A: 修改 `.env` 中的 PORT 值或使用 `PORT=3001 npm start`

**Q: AI API调用失败？**
A: 检查 API 密钥配置，系统会自动切换到演示模式

**Q: 支付测试失败？**
A: 开发模式下使用模拟支付，检查控制台日志

**Q: 用户数据丢失？**
A: 当前使用内存存储，重启会清空。生产环境需配置数据库

### 日志分析
```bash
# 查看服务器日志
tail -f server.log

# 检查错误日志  
grep -E "(ERROR|FAILED)" server.log
```

---

## 🎉 部署完成检查清单

- [ ] 环境变量配置完整
- [ ] 服务器正常启动
- [ ] API接口测试通过
- [ ] 支付功能测试正常
- [ ] 用户界面显示正确
- [ ] SSL证书配置 (生产环境)
- [ ] 域名解析设置 (生产环境)
- [ ] 监控和日志配置
- [ ] 数据备份策略 (生产环境)

🚀 **恭喜！您的三层级付费风水分析系统已经成功部署！**

---

*部署时间: 2025年9月2日*
*版本: v1.0.0*
*技术栈: Node.js + Express + Stripe + AI*