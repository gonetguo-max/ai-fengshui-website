// API分层测试脚本
async function testTieredAPI() {
    const fetch = (await import('node-fetch')).default;
    try {
        console.log('🔍 测试分层API响应...');
        
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                houseType: '住宅',
                direction: '南',
                concerns: '财运'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        console.log('✅ API响应成功');
        console.log('📊 用户等级:', result.data.userTier || '未知');
        console.log('📝 分析内容长度:', result.data.analysis ? result.data.analysis.length : '无');
        console.log('🔓 升级提示:', result.data.showUpgradePrompt ? '是' : '否');
        
        // 检查是否有升级消息
        if (result.data.upgradeMessage) {
            console.log('💰 升级消息:', result.data.upgradeMessage);
        }
        
        // 检查内容是否被截断
        if (result.data.analysis && result.data.analysis.includes('...')) {
            console.log('✂️ 内容已截断 (发现"...")');
        } else {
            console.log('⚠️ 内容未截断');
        }
        
        // 显示前100字符检查
        if (result.data.analysis) {
            console.log('📄 分析前100字符:', result.data.analysis.substring(0, 100) + '...');
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testTieredAPI();