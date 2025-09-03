// 快速API测试脚本
const http = require('http');

function testAPI(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 开始API测试...\n');
  
  try {
    // 测试1: 用户状态API
    console.log('1️⃣ 测试用户状态API...');
    const userStatus = await testAPI('/api/user-status');
    console.log(`   状态码: ${userStatus.status}`);
    console.log(`   响应: ${JSON.stringify(userStatus.data, null, 2)}\n`);

    // 测试2: 系统统计API
    console.log('2️⃣ 测试系统统计API...');
    const systemStats = await testAPI('/api/system-stats');
    console.log(`   状态码: ${systemStats.status}`);
    console.log(`   响应: ${JSON.stringify(systemStats.data, null, 2)}\n`);

    // 测试3: AI统计API
    console.log('3️⃣ 测试AI统计API...');
    const aiStats = await testAPI('/api/ai-stats');
    console.log(`   状态码: ${aiStats.status}`);
    console.log(`   响应: ${JSON.stringify(aiStats.data, null, 2)}\n`);

    // 测试4: 风水分析API（简单测试）
    console.log('4️⃣ 测试风水分析API...');
    const analysisData = {
      houseType: '住宅',
      direction: '南',
      floor: '3',
      surroundings: '公园',
      concerns: '财运'
    };
    
    const analysis = await testAPI('/api/analyze', 'POST', analysisData);
    console.log(`   状态码: ${analysis.status}`);
    if (analysis.status === 200) {
      console.log(`   完整响应: ${JSON.stringify(analysis.data, null, 2)}`);
      console.log(`   分析成功! 评分: ${analysis.data.score || analysis.data.data?.score}`);
      console.log(`   建议数量: ${analysis.data.suggestions?.length || analysis.data.data?.suggestions?.length || 0}`);
    } else {
      console.log(`   响应: ${JSON.stringify(analysis.data, null, 2)}`);
    }

    console.log('\n✅ API测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

runTests();