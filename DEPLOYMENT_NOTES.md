# 部署说明

## 技术部署要点

### 生产环境部署
- 详细部署指南：`docs/04-部署运维/production-deployment.md`
- 配置管理：参考 `config.js` 和 `setup-api-key.md`

### 监控体系
- API性能监控：访问 `/api/ai-stats`
- 系统状态：访问 `/api/system-stats`
- 健康检查：访问 `/api/health`

### 快速启动
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

---

*原 `后续工作规划.md` 文件内容已整合到 `docs/01-项目规划/` 目录下*