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