// 简单的API测试
async function testAPI() {
    try {
        const response = await fetch('http://localhost:3002/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'test123456'
            })
        });

        const data = await response.json();
        console.log('注册结果:', data);

    } catch (error) {
        console.error('测试失败:', error);
    }
}

testAPI();