# 项目交付文档

## 项目概述
风水分析网站系统，包含AI分析引擎、用户管理、文件上传和性能监控等功能。

## 系统架构
1. Express.js服务器 (server.js)
2. 双AI系统 (src/api/ai-manager.js)
3. 风水分析器 (src/api/fengshui-analyzer.js)
4. 用户管理 (src/utils/user-manager.js)

## 部署要求
1. Node.js >= 16.0.0
2. 环境变量配置：DEEPSEEK_API_KEY, QWEN3_API_KEY
3. 上传目录权限配置

## 启动命令
- 开发环境：npm run dev
- 生产环境：npm start
- 依赖安装：npm install

## API文档
1. POST /api/analyze：风水分析
2. GET /api/user-status：用户状态
3. GET /api/system-stats：系统统计
4. POST /api/feedback：用户反馈
5. GET /api/ai-stats：AI性能
6. POST /api/ai-switch：AI策略配置

## 性能监控
- 系统状态：/api/system-stats
- AI性能：/api/ai-stats
- 用户统计：/api/user-status