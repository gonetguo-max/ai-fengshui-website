# 🔐 API密钥设置指南

## 📋 当前状态检查

### ✅ 已完成项目
- ✅ Node.js项目初始化完成
- ✅ 依赖安装成功 (openai, dotenv)
- ✅ 项目文件夹结构已建立
- ✅ 配置文件已创建 (config.js)

## 🔑 设置API密钥 (重要步骤)

### 第1步：创建 .env 文件
在项目根目录下创建一个名为 `.env` 的文件（没有任何扩展名）

### 第2步：复制配置内容
将以下内容复制到 `.env` 文件中：

```
DEEPSEEK_API_KEY=sk-your-new-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
NODE_ENV=development
PORT=3000
```

### 第3步：替换API密钥
将 `sk-your-new-api-key-here` 替换为你的真实DeepSeek API密钥

### 第4步：验证设置
运行以下命令验证配置：
```bash
node -e "require('./config.js').validateConfig()"
```

## ⚠️ 安全建议

### 立即执行的安全措施：
1. **重新生成API密钥**：
   - 访问：https://platform.deepseek.com/api_keys
   - 删除当前密钥：`sk-dde4154cdb60406abdbb89c3cbae9c47`
   - 生成新的安全密钥

2. **保护新密钥**：
   - 不要在任何对话或代码中直接分享
   - 只存储在 `.env` 文件中
   - 确保 `.env` 文件不会被Git跟踪

### 为什么需要重新生成？
- 你的原密钥已在对话中暴露
- 可能被他人看到和滥用
- 重新生成可确保账户安全

## 🧪 测试API连接

创建测试文件验证API是否正常工作：

```javascript
// test-api.js
const { config, validateConfig } = require('./config');
const OpenAI = require('openai');

async function testDeepSeekAPI() {
  if (!validateConfig()) {
    return;
  }

  const client = new OpenAI({
    baseURL: config.deepseek.baseURL,
    apiKey: config.deepseek.apiKey
  });

  try {
    const response = await client.chat.completions.create({
      model: config.deepseek.models.chat,
      messages: [
        { role: "system", content: "你是一个专业的风水分析师。" },
        { role: "user", content: "你好，请简单介绍一下风水的基本概念。" }
      ]
    });

    console.log('✅ API连接成功！');
    console.log('🔮 风水师回复：', response.choices[0].message.content);
  } catch (error) {
    console.error('❌ API连接失败：', error.message);
  }
}

testDeepSeekAPI();
```

## 📊 下一步开发任务

API密钥设置完成后，你就可以开始：

1. **测试API连接** (5分钟)
2. **开发风水分析核心功能** (1.5小时)
3. **创建用户输入界面** (1小时)
4. **集成AI分析和报告生成** (1小时)

## 🆘 遇到问题？

### 常见问题解决：
- **找不到.env文件**：确保文件名正确，没有任何扩展名
- **API调用失败**：检查密钥是否正确设置
- **权限错误**：确保新生成的密钥有正确的权限

### 联系支持：
- DeepSeek API文档：https://api-docs.deepseek.com/
- 项目开发日志：查看 `开发日志.md` 记录问题

---

**重要提醒**：完成API密钥设置后，请在开发日志中记录这个里程碑！✅ 