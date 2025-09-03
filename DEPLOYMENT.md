# 🚀 AI风水网站部署指南

## 📋 部署前检查清单

### ✅ 已完成验证
- [x] **API功能正常** - 所有端点响应正确
- [x] **AI分析工作** - DeepSeek + Qwen3双引擎运行正常
- [x] **用户系统** - 指纹追踪、使用统计完整
- [x] **环境配置** - .env文件包含API密钥
- [x] **依赖完整** - 所有npm包已安装
- [x] **代码质量** - 生产就绪标准

## 🎯 推荐部署方案：Vercel

### 为什么选择Vercel？
- ✅ **零配置部署** - 支持Node.js原生
- ✅ **全球CDN** - 自动优化访问速度
- ✅ **环境变量** - 安全的API密钥管理
- ✅ **自动HTTPS** - 免费SSL证书
- ✅ **免费额度** - 适合项目启动阶段

## 📦 部署步骤

### 方案1: GitHub + Vercel (推荐)

1. **推送到GitHub**
   ```bash
   git init
   git add .
   git commit -m "Ready for production deployment"
   git branch -M main
   git remote add origin https://github.com/你的用户名/fengshui-website.git
   git push -u origin main
   ```

2. **连接Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub登录
   - 点击 "New Project"
   - 选择你的仓库
   - 点击 "Deploy"

3. **配置环境变量**
   在Vercel项目设置中添加：
   ```
   DEEPSEEK_API_KEY=你的密钥
   QWEN3_API_KEY=你的密钥
   NODE_ENV=production
   ```

### 方案2: 直接部署

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   vercel --prod
   ```

3. **按提示配置环境变量**

## 🔧 其他部署选项

### Railway
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway add
railway up
```

### Render
1. 连接GitHub仓库
2. 选择Web Service
3. 配置环境变量
4. 部署

## 🌐 域名配置

### Vercel自定义域名
1. 在Vercel项目设置中点击 "Domains"
2. 添加你的域名
3. 按提示配置DNS记录

### DNS记录示例
```
类型: CNAME
名称: www (或 @)
值: cname.vercel-dns.com
```

## 📊 部署后验证

### 必须测试的功能
- [ ] 首页加载正常
- [ ] 风水分析表单提交
- [ ] AI分析结果返回
- [ ] 图片上传功能
- [ ] 移动端响应式布局

### 快速测试命令
```bash
curl -X POST https://你的域名.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"houseType":"住宅","direction":"南","concerns":"财运"}'
```

## 🔒 安全配置

### API密钥管理
- ✅ 所有密钥存储在环境变量中
- ✅ .env文件已在.gitignore中排除
- ✅ 生产环境使用独立的API密钥

### 跨域配置
```javascript
// 已在server.js中配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://你的域名.com'] 
    : ['http://localhost:3000']
}));
```

## 📈 性能监控

### 推荐工具
- **Vercel Analytics** - 访问统计
- **Sentry** - 错误监控  
- **LogRocket** - 用户行为分析

### 内置监控端点
- `GET /api/system-stats` - 系统状态
- `GET /api/ai-stats` - AI性能统计

## 🚨 常见问题

### 部署失败
1. **检查Node.js版本** - 确保 >=16.0.0
2. **验证环境变量** - API密钥是否正确设置
3. **依赖问题** - 运行 `npm install --production`

### 性能优化
1. **启用压缩** - 已在server.js中配置
2. **静态资源缓存** - Vercel自动处理
3. **AI调用优化** - 已实现智能模型选择

## 🎉 部署完成后

### 下一步建议
1. **设置域名** - 使用自定义域名
2. **配置监控** - 开启错误追踪
3. **备份数据** - 定期导出用户反馈
4. **性能优化** - 根据使用情况调整AI策略

### 运营准备
- 准备用户使用指南
- 设置客服联系方式
- 制定推广计划
- 收集用户反馈机制

---

**🎯 现在你的AI风水网站已经准备好上线了！**