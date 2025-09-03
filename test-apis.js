// 三层级付费系统API测试脚本
const BASE_URL = 'http://localhost:3002';

// 使用Node.js内置fetch或导入node-fetch
const fetch = globalThis.fetch || require('node-fetch');

class APITester {
    constructor() {
        this.authToken = null;
        this.testUser = {
            email: `test${Date.now()}@example.com`,
            password: 'test123456'
        };
    }

    async test(name, testFn) {
        try {
            console.log(`🧪 测试: ${name}`);
            const result = await testFn();
            console.log(`✅ ${name}: 通过`);
            return result;
        } catch (error) {
            console.error(`❌ ${name}: 失败`, error.message);
            return null;
        }
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        if (this.authToken) {
            defaultHeaders.Authorization = `Bearer ${this.authToken}`;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async runAllTests() {
        console.log('🚀 开始API测试\n');

        // 1. 测试用户注册
        await this.test('用户注册', async () => {
            const data = await this.makeRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(this.testUser)
            });

            if (!data.success) {
                throw new Error(data.error);
            }

            this.authToken = data.data.session.token;
            console.log(`   用户ID: ${data.data.user.id}`);
            console.log(`   等级: ${data.data.user.tier}`);
            return data;
        });

        // 2. 测试用户登录
        await this.test('用户登录', async () => {
            this.authToken = null; // 清除token测试登录
            
            const data = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(this.testUser)
            });

            if (!data.success) {
                throw new Error(data.error);
            }

            this.authToken = data.data.session.token;
            console.log(`   登录成功，等级: ${data.data.user.tier}`);
            return data;
        });

        // 3. 测试获取用户信息
        await this.test('获取用户信息', async () => {
            const data = await this.makeRequest('/api/user/profile');

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`   邮箱: ${data.data.user.email}`);
            console.log(`   等级: ${data.data.user.tier}`);
            console.log(`   请求次数: ${data.data.stats.requestCount}/${data.data.stats.maxRequests}`);
            return data;
        });

        // 4. 测试免费版风水分析
        await this.test('免费版风水分析', async () => {
            const formData = {
                houseType: '住宅',
                direction: '正南',
                area: '120',
                description: '三室两厅户型，采光良好'
            };

            const data = await this.makeRequest('/api/analyze', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`   分析评分: ${data.analysisResult.score}分`);
            console.log(`   用户等级: ${data.analysisResult.userTier}`);
            console.log(`   升级提示: ${data.analysisResult.upgradePrompt ? '是' : '否'}`);
            return data;
        });

        // 5. 测试创建支付会话（PREMIUM）
        await this.test('创建进阶版支付会话', async () => {
            const data = await this.makeRequest('/api/payment/create-session', {
                method: 'POST',
                body: JSON.stringify({ targetTier: 'PREMIUM' })
            });

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`   会话ID: ${data.data.sessionId}`);
            console.log(`   支付金额: $${data.data.amount}`);
            console.log(`   支付链接: ${data.data.paymentUrl}`);
            return data;
        });

        // 6. 测试创建支付会话（VIP）
        await this.test('创建高级版支付会话', async () => {
            const data = await this.makeRequest('/api/payment/create-session', {
                method: 'POST',
                body: JSON.stringify({ targetTier: 'VIP' })
            });

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`   会话ID: ${data.data.sessionId}`);
            console.log(`   支付金额: $${data.data.amount}`);
            console.log(`   支付链接: ${data.data.paymentUrl}`);
            return data;
        });

        // 7. 测试手动升级用户（模拟支付成功）
        await this.test('手动升级到进阶版', async () => {
            const mockPaymentData = {
                id: 'mock_payment_12345',
                amount: 4.99,
                sessionId: 'mock_session_67890',
                completedAt: new Date()
            };

            const data = await this.makeRequest('/api/user/upgrade', {
                method: 'POST',
                body: JSON.stringify({
                    targetTier: 'PREMIUM',
                    paymentData: mockPaymentData
                })
            });

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`   升级成功: ${data.data.tier}`);
            console.log(`   订阅信息: ${JSON.stringify(data.data.subscription)}`);
            return data;
        });

        // 8. 测试进阶版风水分析
        await this.test('进阶版风水分析', async () => {
            const formData = {
                houseType: '住宅',
                direction: '东南',
                area: '150',
                description: '四室两厅，复式结构',
                concerns: '希望提升财运和事业运'
            };

            const data = await this.makeRequest('/api/analyze', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`   分析评分: ${data.analysisResult.score}分`);
            console.log(`   用户等级: ${data.analysisResult.userTier}`);
            console.log(`   建议数量: ${data.analysisResult.recommendations.length}`);
            console.log(`   升级提示: ${data.analysisResult.upgradePrompt.show ? '显示VIP升级' : '无'}`);
            return data;
        });

        console.log('\n🎉 所有API测试完成！');
    }
}

// 运行测试
async function main() {
    const tester = new APITester();
    
    try {
        await tester.runAllTests();
        process.exit(0);
    } catch (error) {
        console.error('💥 测试过程出错:', error);
        process.exit(1);
    }
}

// 检查是否直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = APITester;