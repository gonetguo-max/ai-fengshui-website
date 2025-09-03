# 🎯 AI风水网站开发手册

> **项目信息**  
> 项目名称：AI风水分析网站  
> 技术栈：Express.js + 双AI模型系统  
> 开发模式：AI辅助持续迭代  

---

## 📋 项目概览

### 🎯 已完成功能
- ✅ 双模型AI系统（DeepSeek-R1 + Qwen3）
- ✅ 智能风水分析核心功能
- ✅ 多语言支持（中英文）
- ✅ 图片上传和分析
- ✅ 用户管理和统计系统
- ✅ 产品推荐系统
- ✅ 性能监控和切换机制

### 🔧 开发环境配置

#### 本地开发
```bash
# 安装依赖
npm install

# 配置环境变量
cp example.env .env
# 编辑.env文件，添加API密钥

# 启动开发服务器
npm run dev

# 验证配置
node -e "require('./config.js').validateConfig()"
```

#### API密钥配置
详细配置指南：`setup-api-key.md`

### 📈 开发目标规划

#### 短期目标（1-2周）
- [ ] 生产环境部署
- [ ] 用户反馈系统优化
- [ ] 性能监控完善
- [ ] 文档整理完成

#### 中期目标（1-3个月）
- [ ] 商业化功能实现
- [ ] 用户增长和获客
- [ ] 数据分析和优化
- [ ] 移动端适配

### 🔨 开发工具链

| 工具/服务 | 用途 | 状态 |
|-----------|------|------|
| Express.js | 后端框架 | ✅ 已集成 |
| DeepSeek API | AI分析引擎 | ✅ 已集成 |
| Qwen3 API | 备用AI引擎 | ✅ 已集成 |
| Multer | 文件上传 | ✅ 已集成 |
| nodemon | 开发调试 | ✅ 已配置 |

### 📊 监控和调试

#### API监控端点
- `/api/health` - 健康检查
- `/api/ai-stats` - AI性能统计
- `/api/system-stats` - 系统状态
- `/api/analytics` - 用户分析数据

#### 调试工具
- `tools/api-test.js` - API测试脚本
- `tools/dual-model-test.js` - 双模型测试
- `tools/ai-dashboard.html` - AI监控面板

### 🚀 部署指南
详见：`docs/deployment/production-deployment.md`

### 📚 相关文档
- 商业化策略：`docs/business/`
- 测试报告：`docs/testing/`
- 问题解决：`docs/testing/问题解决档案.md`

---

*本文档合并了原有的多个开发手册内容*