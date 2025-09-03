# 🔧 代码修改计划 - Week 1-12 实施清单

> **基于周执行计划的详细代码修改指南**  
> **目标**: 实现市场验证所需的所有追踪、调研和分层功能  
> **更新日期**: 2024年8月25日  

## 📋 修改概览

根据12周执行计划，需要修改的核心代码部分：

### 🎯 Week 1 优先级 (立即执行)
```
🔴 高优先级 - 数据追踪系统
├── server.js - 用户行为追踪API扩展
├── user-manager.js - 增强统计和分析功能  
├── index.html - Google Analytics集成
└── 新建: analytics-tracker.js - 前端追踪组件

🟡 中优先级 - 满意度收集
├── index.html - 添加评分组件
├── server.js - 反馈API优化
└── 新建: feedback-modal.js - 反馈弹窗组件
```

### 🎯 Week 2 优先级
```
🔴 高优先级 - 付费意愿调研
├── 新建: survey-system.js - 调研系统
├── 新建: email-collector.js - 邮箱收集组件
├── server.js - 调研数据API
└── index.html - 调研界面集成

🟡 中优先级 - 分层预览功能
├── fengshui-analyzer.js - 分层报告生成
├── user-manager.js - 报告访问控制
└── index.html - 锁定内容展示
```

## 📁 详细文件修改计划

---

## 📂 Week 1: 核心追踪系统

### 📄 server.js 修改
**优先级**: 🔴 最高  
**预计工时**: 2小时  

#### 需要添加的API端点:
```javascript
// 1. 用户行为追踪API
app.post('/api/track-behavior', (req, res) => {
  const { event, data } = req.body;
  const fingerprint = userManager.generateFingerprint(req);
  userManager.trackBehavior(fingerprint, event, data);
  res.json({ success: true });
});

// 2. 页面访问追踪API  
app.post('/api/track-pageview', (req, res) => {
  const { page, duration } = req.body;
  const fingerprint = userManager.generateFingerprint(req);
  userManager.trackPageView(fingerprint, page, duration);
  res.json({ success: true });
});

// 3. 会话统计API
app.get('/api/session-stats', (req, res) => {
  const fingerprint = userManager.generateFingerprint(req);
  const sessionData = userManager.getSessionStats(fingerprint);
  res.json({ success: true, data: sessionData });
});

// 4. 实时用户统计API
app.get('/api/live-stats', (req, res) => {
  const stats = userManager.getLiveStats();
  res.json({ 
    success: true, 
    data: {
      activeUsers: stats.activeUsers,
      todayAnalyses: stats.todayAnalyses,
      averageRating: stats.averageRating,
      completionRate: stats.completionRate
    }
  });
});
```

#### 需要修改的现有代码:
```javascript
// 在 /api/analyze 端点中添加更详细的行为追踪
app.post('/api/analyze', upload.single('photo'), async (req, res) => {
  // ... 现有代码 ...
  
  // 新增: 记录分析开始事件
  userManager.trackBehavior(fingerprint, 'analysis_started', {
    hasImage: !!req.file,
    formFields: Object.keys(req.body).length,
    timestamp: new Date()
  });
  
  try {
    // ... 分析逻辑 ...
    
    // 新增: 记录分析完成事件
    userManager.trackBehavior(fingerprint, 'analysis_completed', {
      responseTime: Date.now() - startTime,
      success: true,
      analysisLength: finalResult.analysis?.length || 0
    });
    
  } catch (error) {
    // 新增: 记录分析失败事件
    userManager.trackBehavior(fingerprint, 'analysis_failed', {
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
});
```

### 📄 src/utils/user-manager.js 扩展
**优先级**: 🔴 最高  
**预计工时**: 3小时  

#### 需要添加的新方法:
```javascript
class UserManager {
  constructor() {
    // ... 现有代码 ...
    this.behaviorLog = new Map(); // 用户行为日志
    this.sessionTracker = new Map(); // 会话追踪
    this.pageViews = new Map(); // 页面访问记录
  }
  
  // 行为追踪方法
  trackBehavior(fingerprint, event, data = {}) {
    if (!this.behaviorLog.has(fingerprint)) {
      this.behaviorLog.set(fingerprint, []);
    }
    
    this.behaviorLog.get(fingerprint).push({
      event,
      data,
      timestamp: new Date(),
      sessionId: this.getCurrentSessionId(fingerprint)
    });
    
    // 限制单用户行为记录数量
    const behaviors = this.behaviorLog.get(fingerprint);
    if (behaviors.length > 1000) {
      this.behaviorLog.set(fingerprint, behaviors.slice(-500));
    }
  }
  
  // 页面访问追踪
  trackPageView(fingerprint, page, duration = 0) {
    if (!this.pageViews.has(fingerprint)) {
      this.pageViews.set(fingerprint, []);
    }
    
    this.pageViews.get(fingerprint).push({
      page,
      duration,
      timestamp: new Date(),
      userAgent: this.getUserAgent(fingerprint)
    });
  }
  
  // 会话统计
  getSessionStats(fingerprint) {
    const behaviors = this.behaviorLog.get(fingerprint) || [];
    const pageViews = this.pageViews.get(fingerprint) || [];
    
    return {
      totalBehaviors: behaviors.length,
      totalPageViews: pageViews.length,
      averageSessionDuration: this.calculateAverageSessionDuration(fingerprint),
      lastActivity: behaviors.length > 0 ? behaviors[behaviors.length - 1].timestamp : null,
      mostVisitedPages: this.getMostVisitedPages(fingerprint)
    };
  }
  
  // 实时统计
  getLiveStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let activeUsers = 0;
    let todayAnalyses = 0;
    let totalRatings = 0;
    let ratingCount = 0;
    let completedAnalyses = 0;
    let startedAnalyses = 0;
    
    // 遍历所有用户统计数据
    for (const [fingerprint, behaviors] of this.behaviorLog) {
      const todayBehaviors = behaviors.filter(b => b.timestamp >= todayStart);
      
      if (todayBehaviors.length > 0) {
        activeUsers++;
      }
      
      todayBehaviors.forEach(behavior => {
        if (behavior.event === 'analysis_completed') {
          todayAnalyses++;
          completedAnalyses++;
        }
        if (behavior.event === 'analysis_started') {
          startedAnalyses++;
        }
      });
    }
    
    // 计算反馈统计
    for (const feedback of this.feedbackData) {
      if (feedback.timestamp >= todayStart) {
        totalRatings += feedback.rating;
        ratingCount++;
      }
    }
    
    return {
      activeUsers,
      todayAnalyses,
      averageRating: ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : 0,
      completionRate: startedAnalyses > 0 ? ((completedAnalyses / startedAnalyses) * 100).toFixed(1) : 0
    };
  }
}
```

### 📄 index.html 修改
**优先级**: 🔴 最高  
**预计工时**: 2小时  

#### Google Analytics 集成:
```html
<!-- 在 <head> 标签中添加 -->
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- 自定义事件追踪 -->
<script>
// 追踪表单开始填写
function trackFormStart() {
  gtag('event', 'form_start', {
    'event_category': 'engagement',
    'event_label': 'fengshui_form'
  });
  
  // 发送到后端
  fetch('/api/track-behavior', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      event: 'form_started',
      data: { timestamp: new Date() }
    })
  });
}

// 追踪分析请求
function trackAnalysisRequest() {
  gtag('event', 'analysis_request', {
    'event_category': 'conversion',
    'event_label': 'fengshui_analysis'
  });
}

// 追踪分析完成
function trackAnalysisComplete(responseTime) {
  gtag('event', 'analysis_complete', {
    'event_category': 'conversion',
    'event_label': 'fengshui_analysis',
    'value': responseTime
  });
}
</script>
```

#### 满意度收集组件:
```html
<!-- 在分析结果后添加满意度收集区域 -->
<div id="satisfactionSection" class="satisfaction-section" style="display: none;">
  <div class="satisfaction-card">
    <h3>📊 您对这次分析满意吗？</h3>
    <div class="star-rating">
      <span class="star" data-rating="1">⭐</span>
      <span class="star" data-rating="2">⭐</span>
      <span class="star" data-rating="3">⭐</span>
      <span class="star" data-rating="4">⭐</span>
      <span class="star" data-rating="5">⭐</span>
    </div>
    <textarea id="satisfactionComment" placeholder="请分享您的想法或建议..."></textarea>
    <button onclick="submitSatisfaction()" class="submit-rating-btn">提交评价</button>
  </div>
</div>

<style>
.satisfaction-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(218, 165, 32, 0.2);
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  justify-content: center;
}

.star {
  cursor: pointer;
  font-size: 2rem;
  transition: transform 0.2s;
  opacity: 0.3;
}

.star:hover, .star.active {
  transform: scale(1.2);
  opacity: 1;
}

.satisfaction-card textarea {
  width: 100%;
  min-height: 80px;
  margin: 1rem 0;
  padding: 0.75rem;
  background: var(--bg-input);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  resize: vertical;
}

.submit-rating-btn {
  background: var(--gradient-gold);
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition-normal);
}
</style>

<script>
// 满意度评分交互
let currentRating = 0;

document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', function() {
    currentRating = parseInt(this.dataset.rating);
    updateStarDisplay(currentRating);
  });
  
  star.addEventListener('mouseover', function() {
    const hoverRating = parseInt(this.dataset.rating);
    updateStarDisplay(hoverRating);
  });
});

document.querySelector('.star-rating').addEventListener('mouseleave', function() {
  updateStarDisplay(currentRating);
});

function updateStarDisplay(rating) {
  document.querySelectorAll('.star').forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

async function submitSatisfaction() {
  if (currentRating === 0) {
    alert('请先选择评分');
    return;
  }
  
  const comment = document.getElementById('satisfactionComment').value;
  
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        rating: currentRating,
        comment: comment
      })
    });
    
    if (response.ok) {
      document.getElementById('satisfactionSection').innerHTML = 
        '<p style="text-align: center; color: var(--accent-green);">✅ 感谢您的评价！</p>';
      
      // GA事件追踪
      gtag('event', 'feedback_submit', {
        'event_category': 'engagement',
        'event_label': 'satisfaction_rating',
        'value': currentRating
      });
    }
  } catch (error) {
    console.error('提交评价失败:', error);
    alert('提交失败，请稍后重试');
  }
}
</script>
```

---

## 📂 Week 2: 调研和分层系统

### 📄 新建文件: src/components/survey-system.js
**优先级**: 🔴 最高  
**预计工时**: 4小时  

这个文件将创建完整的付费意愿调研系统:

```javascript
class SurveySystem {
  constructor() {
    this.surveys = new Map();
    this.responses = new Map();
    this.currentSurvey = null;
  }
  
  // 创建付费意愿调研
  createPaymentWillingnessSurvey() {
    return {
      id: 'payment_willingness_v1',
      title: '💎 高级功能体验调研',
      description: '帮助我们了解您的需求，获得更好的服务体验',
      questions: [
        {
          id: 'usage_frequency',
          type: 'single_choice',
          question: '您预期多长时间会使用一次风水分析服务？',
          options: [
            '每周多次', '每周一次', '每月2-3次', 
            '每月一次', '每季度一次', '偶尔使用'
          ]
        },
        {
          id: 'most_valuable_feature',
          type: 'multiple_choice',
          question: '以下哪些功能对您最有价值？（可多选）',
          options: [
            '详细的八字分析', '六色方位布局图', 
            '个性化改善建议', 'PDF专业报告',
            '音频解读服务', '3D可视化布局',
            '年运势规划', '实时咨询服务'
          ]
        },
        {
          id: 'price_acceptance',
          type: 'single_choice', 
          question: '您认为专业级风水分析服务的合理价格范围是？',
          options: [
            '$2.99-4.99', '$4.99-9.99', '$9.99-19.99',
            '$19.99-29.99', '$29.99-49.99', '$49.99以上'
          ]
        },
        {
          id: 'payment_willingness',
          type: 'scale',
          question: '如果价格合理，您购买高级功能的可能性有多大？',
          scale: { min: 1, max: 10, labels: ['完全不会', '非常可能'] }
        },
        {
          id: 'feature_priority',
          type: 'ranking',
          question: '请按重要性排序以下功能（拖拽排序）',
          options: [
            '基础分析准确性', '详细改善建议',
            '美观的报告设计', '快速响应时间',
            '多语言支持', '客服支持'
          ]
        }
      ],
      incentive: {
        type: 'early_bird_discount',
        description: '完成调研可获得早鸟用户50%折扣券',
        value: '50% OFF'
      }
    };
  }
  
  // 显示调研弹窗
  showSurvey(surveyId, triggerCondition = 'analysis_completed') {
    // 实现调研弹窗显示逻辑
  }
  
  // 提交调研结果
  async submitSurveyResponse(surveyId, responses) {
    // 实现调研提交逻辑
  }
}
```

### 📄 新建文件: src/components/email-collector.js  
**优先级**: 🔴 最高
**预计工时**: 2小时

```javascript
class EmailCollector {
  constructor() {
    this.collectedEmails = new Set();
    this.campaigns = new Map();
  }
  
  // 早鸟用户邮箱收集
  showEarlyBirdSignup() {
    const modal = this.createEmailModal({
      title: '🚀 成为早鸟用户',
      subtitle: '第一时间获得高级功能和专属折扣',
      benefits: [
        '💰 享受50%早鸟折扣',
        '🎯 优先体验新功能', 
        '📧 专属风水运势报告',
        '⚡ 技术更新第一时间通知'
      ],
      placeholder: '请输入您的邮箱地址',
      ctaText: '立即加入早鸟计划'
    });
    
    document.body.appendChild(modal);
  }
  
  // 创建邮箱收集弹窗
  createEmailModal(config) {
    // 实现邮箱收集弹窗UI和交互逻辑
  }
  
  // 验证和存储邮箱
  async collectEmail(email, source = 'early_bird') {
    // 实现邮箱验证和存储
  }
}
```

### 📄 src/api/fengshui-analyzer.js 扩展 - 分层报告
**优先级**: 🟡 中等  
**预计工时**: 3小时  

需要在现有分析器中添加分层报告生成功能:

```javascript
class FengshuiAnalyzer {
  // ... 现有代码 ...
  
  // 生成分层预览报告
  generateTieredReport(fullAnalysis, userTier = 'free') {
    const baseReport = {
      score: fullAnalysis.score,
      summary: fullAnalysis.summary,
      basicRecommendations: fullAnalysis.recommendations?.slice(0, 3) || []
    };
    
    const tierConfigs = {
      free: {
        maxRecommendations: 3,
        showDetailedAnalysis: false,
        showSixColorAnalysis: false,
        showTimingGuidance: false,
        showPDFDownload: false,
        lockedFeatures: ['六色方位分析', '详细改善方案', '时机选择指导']
      },
      basic: {
        maxRecommendations: 8,
        showDetailedAnalysis: true,
        showSixColorAnalysis: false,
        showTimingGuidance: false,
        showPDFDownload: true,
        lockedFeatures: ['六色方位分析', '时机选择指导', '年运势规划']
      },
      professional: {
        maxRecommendations: 15,
        showDetailedAnalysis: true,
        showSixColorAnalysis: true,
        showTimingGuidance: false,
        showPDFDownload: true,
        lockedFeatures: ['时机选择指导', '年运势规划', '3D可视化']
      },
      expert: {
        maxRecommendations: -1, // 无限制
        showDetailedAnalysis: true,
        showSixColorAnalysis: true,
        showTimingGuidance: true,
        showPDFDownload: true,
        lockedFeatures: []
      }
    };
    
    const config = tierConfigs[userTier];
    
    return {
      ...baseReport,
      tier: userTier,
      availableFeatures: this.getAvailableFeatures(config),
      lockedContent: this.generateLockedContentPreviews(fullAnalysis, config),
      upgradePrompts: this.generateUpgradePrompts(userTier)
    };
  }
  
  // 生成锁定内容预览
  generateLockedContentPreviews(fullAnalysis, config) {
    const locked = {};
    
    if (!config.showSixColorAnalysis) {
      locked.sixColorAnalysis = {
        preview: '🔒 六色方位分析可帮助您精确定位...',
        fullDescription: '获得详细的八卦方位能量分析，包括财运、健康、事业等六大生活领域的具体布局建议',
        upgradeRequired: 'professional'
      };
    }
    
    if (!config.showTimingGuidance) {
      locked.timingGuidance = {
        preview: '🔒 最佳调整时机分析...',
        fullDescription: '根据您的生辰八字，提供最佳的布局调整时间点，确保改变的效果最大化',
        upgradeRequired: 'expert'
      };
    }
    
    return locked;
  }
  
  // 生成升级提示
  generateUpgradePrompts(currentTier) {
    const prompts = {
      free: {
        nextTier: 'basic',
        price: '$4.99',
        benefits: ['完整分析报告', 'PDF下载', '8项改善建议'],
        urgency: '限时早鸟价格，立省50%'
      },
      basic: {
        nextTier: 'professional', 
        price: '$19.99',
        benefits: ['六色方位分析', '15项专业建议', '个性化布局图'],
        urgency: '升级解锁高级功能'
      },
      professional: {
        nextTier: 'expert',
        price: '$49.99', 
        benefits: ['时机选择指导', '年运势规划', '无限次咨询'],
        urgency: '获得大师级专业服务'
      }
    };
    
    return prompts[currentTier] || null;
  }
}
```

---

## 📂 Week 3-4: 产品优化系统

### 📄 新建文件: src/components/analytics-dashboard.js
**优先级**: 🟡 中等  
**预计工时**: 3小时  

创建实时数据监控仪表板:

```javascript
class AnalyticsDashboard {
  constructor() {
    this.metrics = new Map();
    this.updateInterval = 30000; // 30秒更新一次
    this.charts = new Map();
  }
  
  // 初始化仪表板
  init() {
    this.createDashboardUI();
    this.startRealTimeUpdates();
    this.bindEventListeners();
  }
  
  // 创建仪表板界面
  createDashboardUI() {
    const dashboard = document.createElement('div');
    dashboard.id = 'analytics-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: var(--bg-card);
      border: 1px solid var(--primary-gold);
      border-radius: var(--radius-lg);
      padding: 1rem;
      z-index: 1000;
      display: none;
    `;
    
    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h3>📊 实时统计</h3>
        <button onclick="toggleDashboard()" class="close-btn">×</button>
      </div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value" id="activeUsers">-</div>
          <div class="metric-label">活跃用户</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" id="todayAnalyses">-</div>
          <div class="metric-label">今日分析</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" id="avgRating">-</div>
          <div class="metric-label">平均评分</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" id="completionRate">-</div>
          <div class="metric-label">完成率</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dashboard);
  }
  
  // 开始实时更新
  startRealTimeUpdates() {
    setInterval(() => {
      this.fetchAndUpdateMetrics();
    }, this.updateInterval);
    
    // 立即执行一次
    this.fetchAndUpdateMetrics();
  }
  
  // 获取并更新指标
  async fetchAndUpdateMetrics() {
    try {
      const response = await fetch('/api/live-stats');
      const data = await response.json();
      
      if (data.success) {
        this.updateMetricCards(data.data);
      }
    } catch (error) {
      console.error('获取实时统计失败:', error);
    }
  }
  
  // 更新指标卡片
  updateMetricCards(metrics) {
    document.getElementById('activeUsers').textContent = metrics.activeUsers;
    document.getElementById('todayAnalyses').textContent = metrics.todayAnalyses;
    document.getElementById('avgRating').textContent = metrics.averageRating;
    document.getElementById('completionRate').textContent = metrics.completionRate + '%';
  }
}

// 全局函数
function toggleDashboard() {
  const dashboard = document.getElementById('analytics-dashboard');
  dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
}

// 开发模式下自动启用
if (window.location.hostname === 'localhost') {
  const dashboard = new AnalyticsDashboard();
  dashboard.init();
  
  // 添加快捷键 Ctrl+D 打开仪表板
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      toggleDashboard();
    }
  });
}
```

### 📄 index.html 性能优化
**优先级**: 🟡 中等  
**预计工时**: 2小时  

需要在现有HTML中添加性能监控和优化代码:

```html
<!-- 添加性能监控脚本 -->
<script>
// 页面性能监控
window.addEventListener('load', function() {
  // 获取页面加载性能数据
  const perfData = performance.getEntriesByType('navigation')[0];
  
  const metrics = {
    loadTime: perfData.loadEventEnd - perfData.navigationStart,
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
    firstPaint: 0,
    firstContentfulPaint: 0
  };
  
  // 获取首次绘制指标
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach(entry => {
    if (entry.name === 'first-paint') {
      metrics.firstPaint = entry.startTime;
    }
    if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime;
    }
  });
  
  // 发送性能数据到后端
  fetch('/api/track-behavior', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      event: 'page_performance',
      data: metrics
    })
  });
  
  // Google Analytics 性能事件
  gtag('event', 'page_load_time', {
    'event_category': 'performance',
    'value': Math.round(metrics.loadTime)
  });
});

// 错误监控
window.addEventListener('error', function(e) {
  fetch('/api/track-behavior', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      event: 'javascript_error',
      data: {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack
      }
    })
  });
});
</script>

<!-- 添加社交分享功能 -->
<div id="shareButtons" class="share-section" style="display: none;">
  <h4>📤 分享您的分析结果</h4>
  <div class="share-buttons">
    <button onclick="shareToWeChat()" class="share-btn wechat">
      <span>📱</span> 微信分享
    </button>
    <button onclick="shareToWeibo()" class="share-btn weibo">
      <span>🐦</span> 微博分享
    </button>
    <button onclick="copyShareLink()" class="share-btn link">
      <span>🔗</span> 复制链接
    </button>
    <button onclick="shareToFacebook()" class="share-btn facebook">
      <span>📘</span> Facebook
    </button>
  </div>
</div>

<script>
// 分享功能实现
async function shareToWeChat() {
  // 生成二维码用于微信分享
  const shareUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  
  showQRModal(qrCodeUrl, '扫码分享到微信');
  trackShare('wechat');
}

async function shareToWeibo() {
  const text = '我刚刚使用AI风水大师分析了我的居住环境，分析结果很专业！推荐大家试试：';
  const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=600,height=400');
  trackShare('weibo');
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast('链接已复制到剪贴板');
    trackShare('link');
  } catch (err) {
    console.error('复制失败:', err);
    showToast('复制失败，请手动复制');
  }
}

async function shareToFacebook() {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  window.open(url, '_blank', 'width=600,height=400');
  trackShare('facebook');
}

function trackShare(platform) {
  // 发送分享事件到后端
  fetch('/api/share', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      shareType: platform
    })
  });
  
  // Google Analytics 分享事件
  gtag('event', 'share', {
    'event_category': 'engagement',
    'event_label': platform,
    'method': platform
  });
}

function showToast(message) {
  // 实现Toast通知显示
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-green);
    color: white;
    padding: 1rem;
    border-radius: var(--radius-md);
    z-index: 2000;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
</script>
```

---

## 📂 优先级总结

### 🔴 Week 1 必须完成 (最高优先级)
1. **server.js** - 用户行为追踪API (2小时)
2. **user-manager.js** - 统计功能扩展 (3小时) 
3. **index.html** - GA集成和满意度组件 (2小时)
4. **测试验证** - 确保所有追踪功能正常 (1小时)

**总计**: 8小时，必须在Week 1完成

### 🟡 Week 2 重要功能 (高优先级)
1. **survey-system.js** - 付费意愿调研系统 (4小时)
2. **email-collector.js** - 邮箱收集组件 (2小时)
3. **fengshui-analyzer.js** - 分层报告功能 (3小时)
4. **index.html** - 调研界面集成 (2小时)

**总计**: 11小时，Week 2内完成

### 🟢 Week 3-4 优化功能 (中等优先级)  
1. **analytics-dashboard.js** - 实时监控仪表板 (3小时)
2. **性能监控和分享功能** - 产品体验优化 (2小时)
3. **移动端优化** - 响应式改进 (3小时)
4. **错误处理和稳定性** - 系统健壮性 (2小时)

**总计**: 10小时，Week 3-4完成

---

## 📋 实施检查清单

### Week 1 检查清单
- [ ] 服务器端行为追踪API开发完成
- [ ] Google Analytics 4集成成功
- [ ] 用户满意度收集组件正常工作
- [ ] 所有追踪事件正确发送到GA
- [ ] 实时统计API返回正确数据
- [ ] 移动端兼容性测试通过

### Week 2 检查清单  
- [ ] 付费意愿调研系统开发完成
- [ ] 邮箱收集功能正常工作
- [ ] 分层报告预览功能实现
- [ ] 调研触发时机设置正确
- [ ] 早鸟用户注册流程顺畅
- [ ] 锁定内容展示效果良好

### Week 3-4 检查清单
- [ ] 实时监控仪表板功能完整
- [ ] 页面加载性能优化生效
- [ ] 社交分享功能全部可用
- [ ] 移动端体验评分 > 4.0
- [ ] 系统错误率 < 5%
- [ ] 所有功能兼容主流浏览器

---

*预计总开发时间: 29小时*  
*建议分配: Week 1 (8小时), Week 2 (11小时), Week 3-4 (10小时)*