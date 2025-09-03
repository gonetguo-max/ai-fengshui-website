const { config } = require('../config.js');
const FengshuiAnalyzer = require('../src/api/fengshui-analyzer.js');

async function testDetailedAnalysis() {
    console.log('🔍 详细分析测试开始...\n');
    
    const analyzer = new FengshuiAnalyzer();
    
    // 测试数据
    const testFormData = {
        houseType: 'whole_house',
        direction: 'west', 
        area: '100',
        roomCount: '3',
        familySize: '2',
        currentSituation: '已进行五行四柱分析',
        buildingType: 'mid_age_building',
        livingDuration: '已进行五行四柱分析',
        language: 'zh'
    };
    
    try {
        console.log('📋 测试数据:', testFormData);
        console.log('\n🤖 开始AI分析...');
        
        const result = await analyzer.analyze(testFormData, 'zh');
        
        console.log('\n📊 分析结果概览:');
        console.log('- 评分:', result.score);
        console.log('- 等级信息:', result.gradeInfo);
        console.log('- 模型:', result.model);
        console.log('- 是否有分类内容:', !!result.classifiedContent);
        
        console.log('\n📝 原始AI响应内容:');
        console.log('='.repeat(80));
        console.log(result.analysis);
        console.log('='.repeat(80));
        
        if (result.classifiedContent) {
            console.log('\n🎨 分类后的内容:');
            console.log('- 总体评分:', result.classifiedContent.totalScore ? '✅' : '❌');
            console.log('- 方位分析:', result.classifiedContent.directionAnalysis ? '✅' : '❌');
            console.log('- 布局建议:', result.classifiedContent.layoutSuggestions ? '✅' : '❌');
            console.log('- 时间建议:', result.classifiedContent.timingSuggestions ? '✅' : '❌');
            console.log('- 注意事项:', result.classifiedContent.importantNotes ? '✅' : '❌');
            console.log('- 优化方案:', result.classifiedContent.optimizationPlan ? '✅' : '❌');
            
            if (result.classifiedContent.totalScore) {
                console.log('\n📊 总体评分内容:');
                console.log(result.classifiedContent.totalScore);
            }
            
            if (result.classifiedContent.optimizationPlan) {
                console.log('\n📋 优化实施方案:');
                console.log('立即执行:', result.classifiedContent.optimizationPlan.immediate);
                console.log('定期执行:', result.classifiedContent.optimizationPlan.regular);
            }
        } else {
            console.log('\n❌ 未找到分类内容，可能使用了备用分析');
        }
        
        console.log('\n✅ 测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

testDetailedAnalysis(); 