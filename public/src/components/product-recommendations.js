// 多语言产品推荐系统
import { getTranslation } from '../utils/i18n-manager.js';

class ProductRecommendationSystem {
  constructor() {
    this.currentLang = localStorage.getItem('preferred-language') || 'zh';
    this.products = this.initializeProducts();
    this.categories = this.getCategories();
    
    // 监听语言切换事件
    document.addEventListener('languageChanged', (event) => {
      this.updateLanguage(event.detail.newLang);
    });
  }
  
  // 更新语言设置
  updateLanguage(newLang) {
    if (this.currentLang !== newLang) {
      this.currentLang = newLang;
      this.products = this.initializeProducts();
      this.categories = this.getCategories();
      console.log(`🛍️ 产品推荐系统语言已更新: ${newLang}`);
    }
  }

  // 获取分类翻译
  getCategories() {
    return {
      mirrors: this.currentLang === 'zh' ? '镜子类' : 'Mirrors',
      plants: this.currentLang === 'zh' ? '植物类' : 'Plants',
      crystals: this.currentLang === 'zh' ? '水晶类' : 'Crystals',
      ornaments: this.currentLang === 'zh' ? '摆件类' : 'Ornaments',
      lighting: this.currentLang === 'zh' ? '灯具类' : 'Lighting',
      furniture: this.currentLang === 'zh' ? '家具类' : 'Furniture'
    };
  }

  // 初始化产品数据库 - 支持多语言
  initializeProducts() {
    const isZh = this.currentLang === 'zh';
    
    return [
      // 镜子类
      {
        id: 'mirror001',
        name: isZh ? '八卦凸镜' : 'Bagua Convex Mirror',
        category: 'mirrors',
        price: isZh ? 88 : 12,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '化解门前煞气，保护家宅平安' : 'Resolve negative energy at the entrance, protect home safety',
        fengshuiBenefits: isZh ? ['化煞', '辟邪', '保平安'] : ['Resolve Sha', 'Ward off Evil', 'Ensure Safety'],
        placement: isZh ? ['门外', '窗户'] : ['Outside Door', 'Window'],
        situations: isZh ? ['门冲', '路冲', '尖角煞'] : ['Door Rush', 'Road Rush', 'Sharp Corner Sha'],
        rating: 4.8,
        reviews: 156
      },
      {
        id: 'mirror002', 
        name: isZh ? '山海镇镜' : 'Shanhai Mirror',
        category: 'mirrors',
        price: isZh ? 128 : 18,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '化解各种形煞，调节风水气场' : 'Resolve various negative forms, adjust feng shui energy field',
        fengshuiBenefits: isZh ? ['化煞', '调气场', '镇宅'] : ['Resolve Sha', 'Adjust Energy', 'Protect Home'],
        placement: isZh ? ['客厅', '玄关'] : ['Living Room', 'Entrance'],
        situations: isZh ? ['形煞', '气场不佳'] : ['Form Sha', 'Poor Energy Field'],
        rating: 4.9,
        reviews: 203
      },

      // 植物类
      {
        id: 'plant001',
        name: isZh ? '发财树' : 'Money Tree',
        category: 'plants',
        price: isZh ? 168 : 24,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1509423350716-97f2360af03e?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '招财进宝，提升财运' : 'Attract wealth and prosperity, enhance financial luck',
        fengshuiBenefits: isZh ? ['招财', '聚气', '净化空气'] : ['Attract Wealth', 'Gather Qi', 'Purify Air'],
        placement: isZh ? ['客厅', '办公室', '店铺'] : ['Living Room', 'Office', 'Shop'],
        situations: isZh ? ['财运不佳', '事业发展'] : ['Poor Financial Luck', 'Career Development'],
        rating: 4.7,
        reviews: 342
      },
      {
        id: 'plant002',
        name: isZh ? '富贵竹' : 'Lucky Bamboo',
        category: 'plants',
        price: isZh ? 58 : 8,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '节节高升，富贵吉祥' : 'Step by step promotion, wealth and prosperity',
        fengshuiBenefits: isZh ? ['招财', '升职', '学业进步'] : ['Attract Wealth', 'Promotion', 'Academic Progress'],
        placement: isZh ? ['书房', '办公桌', '客厅'] : ['Study', 'Desk', 'Living Room'],
        situations: isZh ? ['事业停滞', '学业不顺'] : ['Career Stagnation', 'Academic Difficulties'],
        rating: 4.6,
        reviews: 288
      },
      {
        id: 'plant003',
        name: isZh ? '金钱树' : 'Money Plant',
        category: 'plants',
        price: isZh ? 188 : 26,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '金钱满屋，财源广进' : 'Money fills the house, wealth flows abundantly',
        fengshuiBenefits: isZh ? ['招财', '聚财', '旺运'] : ['Attract Wealth', 'Accumulate Wealth', 'Boost Luck'],
        placement: isZh ? ['财位', '客厅', '办公室'] : ['Wealth Corner', 'Living Room', 'Office'],
        situations: isZh ? ['财运不佳', '投资不顺'] : ['Poor Financial Luck', 'Investment Problems'],
        rating: 4.8,
        reviews: 195
      },

      // 水晶类
      {
        id: 'crystal001',
        name: isZh ? '紫水晶洞' : 'Amethyst Cave',
        category: 'crystals',
        price: isZh ? 388 : 55,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '净化磁场，提升智慧和直觉' : 'Purify magnetic field, enhance wisdom and intuition',
        fengshuiBenefits: isZh ? ['净化磁场', '开智慧', '改善睡眠'] : ['Purify Field', 'Enhance Wisdom', 'Improve Sleep'],
        placement: isZh ? ['卧室', '书房', '冥想区'] : ['Bedroom', 'Study', 'Meditation Area'],
        situations: isZh ? ['失眠', '思维混乱', '学习困难'] : ['Insomnia', 'Confused Thinking', 'Learning Difficulties'],
        rating: 4.9,
        reviews: 124
      },
      {
        id: 'crystal002',
        name: isZh ? '黄水晶球' : 'Citrine Ball',
        category: 'crystals',
        price: isZh ? 268 : 38,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '招财聚宝，增强财运' : 'Attract wealth and treasures, enhance financial luck',
        fengshuiBenefits: isZh ? ['招财', '聚财', '提升自信'] : ['Attract Wealth', 'Accumulate Wealth', 'Boost Confidence'],
        placement: isZh ? ['财位', '办公桌', '收银台'] : ['Wealth Corner', 'Desk', 'Cash Register'],
        situations: isZh ? ['财运不佳', '缺乏自信'] : ['Poor Financial Luck', 'Lack of Confidence'],
        rating: 4.7,
        reviews: 167
      },
      {
        id: 'crystal003',
        name: isZh ? '粉水晶树' : 'Rose Quartz Tree',
        category: 'crystals',
        price: isZh ? 158 : 22,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '增进人际关系，招桃花运' : 'Improve relationships, attract love luck',
        fengshuiBenefits: isZh ? ['招桃花', '改善人际', '增进和谐'] : ['Attract Love', 'Improve Relations', 'Enhance Harmony'],
        placement: isZh ? ['卧室', '客厅', '桃花位'] : ['Bedroom', 'Living Room', 'Love Corner'],
        situations: isZh ? ['单身', '人际关系差', '夫妻不和'] : ['Single', 'Poor Relations', 'Marital Discord'],
        rating: 4.5,
        reviews: 298
      },

      // 摆件类
      {
        id: 'ornament001',
        name: isZh ? '貔貅摆件' : 'Pixiu Ornament',
        category: 'ornaments',
        price: isZh ? 288 : 40,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '招财进宝，镇宅辟邪' : 'Attract wealth and treasures, protect home from evil',
        fengshuiBenefits: isZh ? ['招财', '守财', '辟邪', '镇宅'] : ['Attract Wealth', 'Guard Wealth', 'Ward off Evil', 'Protect Home'],
        placement: isZh ? ['客厅', '办公室', '店铺'] : ['Living Room', 'Office', 'Shop'],
        situations: isZh ? ['财运不佳', '破财', '小人作祟'] : ['Poor Financial Luck', 'Money Loss', 'Villain Troubles'],
        rating: 4.8,
        reviews: 234
      },
      {
        id: 'ornament002',
        name: isZh ? '龙凤呈祥' : 'Dragon Phoenix Harmony',
        category: 'ornaments',
        price: isZh ? 368 : 52,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '夫妻和睦，家庭幸福' : 'Marital harmony, family happiness',
        fengshuiBenefits: isZh ? ['促进感情', '家庭和谐', '贵人运'] : ['Enhance Relationship', 'Family Harmony', 'Noble Person Luck'],
        placement: isZh ? ['卧室', '客厅', '新房'] : ['Bedroom', 'Living Room', 'New Home'],
        situations: isZh ? ['夫妻不和', '感情不顺', '家庭矛盾'] : ['Marital Discord', 'Relationship Problems', 'Family Conflicts'],
        rating: 4.6,
        reviews: 156
      },
      {
        id: 'ornament003',
        name: isZh ? '麒麟送子' : 'Qilin Bringing Children',
        category: 'ornaments',
        price: isZh ? 318 : 45,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '求子送福，家族兴旺' : 'Blessing for children, family prosperity',
        fengshuiBenefits: isZh ? ['求子', '家族兴旺', '贵人扶持'] : ['Fertility', 'Family Prosperity', 'Noble Support'],
        placement: isZh ? ['卧室', '客厅', '祖先位'] : ['Bedroom', 'Living Room', 'Ancestral Area'],
        situations: isZh ? ['求子', '家族运势不佳'] : ['Seeking Children', 'Poor Family Fortune'],
        rating: 4.7,
        reviews: 98
      },

      // 灯具类
      {
        id: 'light001',
        name: isZh ? '莲花造型灯' : 'Lotus Shaped Lamp',
        category: 'lighting',
        price: isZh ? 228 : 32,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '净化空间，提升正能量' : 'Purify space, enhance positive energy',
        fengshuiBenefits: isZh ? ['净化磁场', '提升正能量', '改善运势'] : ['Purify Field', 'Boost Positive Energy', 'Improve Fortune'],
        placement: isZh ? ['客厅', '佛堂', '冥想区'] : ['Living Room', 'Buddha Hall', 'Meditation Area'],
        situations: isZh ? ['负能量重', '运势低迷'] : ['Heavy Negative Energy', 'Poor Fortune'],
        rating: 4.5,
        reviews: 78
      },
      {
        id: 'light002',
        name: isZh ? '水晶吊灯' : 'Crystal Chandelier',
        category: 'lighting',
        price: isZh ? 888 : 125,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '聚集财气，提升家宅档次' : 'Gather wealth energy, enhance home elegance',
        fengshuiBenefits: isZh ? ['聚财', '提升气场', '增加贵气'] : ['Gather Wealth', 'Enhance Aura', 'Add Nobility'],
        placement: isZh ? ['客厅', '餐厅', '玄关'] : ['Living Room', 'Dining Room', 'Entrance'],
        situations: isZh ? ['财运不聚', '缺乏贵气'] : ['Wealth Not Gathering', 'Lack of Nobility'],
        rating: 4.9,
        reviews: 67
      },

      // 家具类
      {
        id: 'furniture001',
        name: isZh ? '实木屏风' : 'Solid Wood Screen',
        category: 'furniture',
        price: isZh ? 688 : 95,
        currency: isZh ? '¥' : '$',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&auto=format',
        description: isZh ? '阻挡煞气，营造私密空间' : 'Block negative energy, create private space',
        fengshuiBenefits: isZh ? ['阻挡煞气', '增加隐私', '美化空间'] : ['Block Sha Qi', 'Increase Privacy', 'Beautify Space'],
        placement: isZh ? ['客厅', '卧室', '办公室'] : ['Living Room', 'Bedroom', 'Office'],
        situations: isZh ? ['空间过于开放', '缺乏隐私'] : ['Too Open Space', 'Lack of Privacy'],
        rating: 4.4,
        reviews: 89
      }
    ];
  }

  // 基于分析结果推荐产品
  recommendProducts(analysisResult, maxRecommendations = 6) {
    try {
      const keywords = this.extractKeywords(analysisResult);
      const situations = this.identifySituations(analysisResult);
      
      // 计算每个产品的匹配分数
      const scoredProducts = this.products.map(product => {
        const score = this.calculateMatchScore(product, keywords, situations);
        const reasons = this.getMatchReasons(product, keywords, situations);
        
        return {
          ...product,
          matchScore: score,
          recommendationReasons: reasons
        };
      });
      
      // 按匹配分数排序并返回前N个
      return scoredProducts
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxRecommendations);
    } catch (error) {
      console.error('推荐产品时出错:', error);
      return this.products.slice(0, maxRecommendations);
    }
  }

  // 从分析结果中提取关键词
  extractKeywords(analysisResult) {
    const text = JSON.stringify(analysisResult).toLowerCase();
    const keywordMap = this.currentLang === 'zh' ? {
      财运: ['财运', '财富', '金钱', '收入', '经济'],
      健康: ['健康', '身体', '疾病', '睡眠'],
      事业: ['事业', '工作', '职业', '升职'],
      感情: ['感情', '爱情', '婚姻', '夫妻', '桃花'],
      学业: ['学业', '学习', '考试', '智慧'],
      家庭: ['家庭', '家人', '和谐', '矛盾'],
      化煞: ['煞气', '形煞', '冲煞', '尖角'],
      净化: ['负能量', '磁场', '净化', '清洁']
    } : {
      wealth: ['wealth', 'money', 'financial', 'income', 'prosperity'],
      health: ['health', 'body', 'disease', 'sleep'],
      career: ['career', 'work', 'job', 'promotion'],
      love: ['love', 'relationship', 'marriage', 'couple'],
      study: ['study', 'learning', 'education', 'wisdom'],
      family: ['family', 'harmony', 'conflict'],
      sha: ['sha', 'negative', 'sharp', 'rush'],
      purify: ['negative energy', 'purify', 'clean', 'field']
    };
    
    const foundKeywords = [];
    Object.keys(keywordMap).forEach(category => {
      keywordMap[category].forEach(keyword => {
        if (text.includes(keyword)) {
          foundKeywords.push(category);
        }
      });
    });
    
    return [...new Set(foundKeywords)];
  }

  // 识别具体情况
  identifySituations(analysisResult) {
    const text = JSON.stringify(analysisResult).toLowerCase();
    const situationMap = this.currentLang === 'zh' ? {
      门冲: ['门冲', '大门对', '直冲'],
      财运不佳: ['财运不佳', '破财', '收入不稳'],
      睡眠问题: ['失眠', '睡眠', '多梦'],
      事业停滞: ['事业不顺', '工作不顺', '升职困难'],
      感情问题: ['单身', '感情不顺', '夫妻不和'],
      学习困难: ['学习困难', '考试不顺', '注意力不集中']
    } : {
      door_rush: ['door rush', 'direct facing', 'straight line'],
      poor_wealth: ['poor financial', 'money loss', 'unstable income'],
      sleep_issues: ['insomnia', 'sleep problems', 'dreams'],
      career_stagnation: ['career problems', 'work issues', 'promotion difficulties'],
      relationship_issues: ['single', 'relationship problems', 'marital discord'],
      learning_difficulties: ['learning difficulties', 'exam problems', 'concentration issues']
    };
    
    const foundSituations = [];
    Object.keys(situationMap).forEach(situation => {
      situationMap[situation].forEach(keyword => {
        if (text.includes(keyword)) {
          foundSituations.push(situation);
        }
      });
    });
    
    return [...new Set(foundSituations)];
  }

  // 计算产品匹配分数
  calculateMatchScore(product, keywords, situations) {
    let score = 0;
    
    // 基于关键词匹配
    keywords.forEach(keyword => {
      if (product.fengshuiBenefits.some(benefit => 
        benefit.toLowerCase().includes(keyword.toLowerCase()))) {
        score += 10;
      }
    });
    
    // 基于具体情况匹配
    situations.forEach(situation => {
      if (product.situations.some(productSituation => 
        productSituation.toLowerCase().includes(situation.toLowerCase()))) {
        score += 15;
      }
    });
    
    // 基于评分加权
    score += product.rating * 2;
    
    return score;
  }

  // 获取推荐理由
  getMatchReasons(product, keywords, situations) {
    const reasons = [];
    const isZh = this.currentLang === 'zh';
    
    keywords.forEach(keyword => {
      if (product.fengshuiBenefits.some(benefit => 
        benefit.toLowerCase().includes(keyword.toLowerCase()))) {
        reasons.push(isZh ? `有助于改善${keyword}` : `Helps improve ${keyword}`);
      }
    });
    
    return reasons.slice(0, 2); // 最多返回2个理由
  }

  // 生成推荐HTML
  generateRecommendationHTML(recommendations) {
    const isZh = this.currentLang === 'zh';
    const title = isZh ? '智能产品推荐' : 'Smart Product Recommendations';
    const subtitle = isZh ? '基于分析结果' : 'Based on Analysis Results';
    
    return `
      <div class="product-recommendations">
        <div class="recommendations-header">
          <h3>🛍️ ${title}</h3>
          <p class="recommendations-subtitle">${subtitle}</p>
        </div>
        <div class="products-grid">
          ${recommendations.map(product => `
            <div class="product-card" onclick="showProductModal('${product.id}')">
              <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-rating">
                  <span class="stars">★★★★★</span>
                  <span class="rating-number">${product.rating}</span>
                </div>
              </div>
              <div class="product-content">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-description">${product.description}</p>
                <div class="product-benefits">
                  <span class="benefits-label">${isZh ? '风水功效:' : 'Feng Shui Benefits:'}</span>
                  <div class="benefits-tags">
                    ${product.fengshuiBenefits.slice(0, 3).map(benefit => 
                      `<span class="benefit-tag">${benefit}</span>`
                    ).join('')}
                  </div>
                </div>
                ${product.recommendationReasons.length > 0 ? `
                  <div class="recommendation-reasons">
                    <span class="reasons-label">${isZh ? '推荐理由:' : 'Recommendation Reasons:'}</span>
                    <ul class="reasons-list">
                      ${product.recommendationReasons.map(reason => 
                        `<li>• ${reason}</li>`
                      ).join('')}
                    </ul>
                  </div>
                ` : ''}
                <div class="product-placement">
                  <span class="placement-label">${isZh ? '适合位置:' : 'Suitable Placement:'}</span>
                  <span class="placement-text">${product.placement.join('、')}</span>
                </div>
              </div>
              <div class="product-footer">
                <div class="product-price">
                  <span class="price-currency">${product.currency}</span>
                  <span class="price-amount">${product.price}</span>
                </div>
                <div class="product-actions">
                  <button class="btn-details" onclick="event.stopPropagation(); showProductModal('${product.id}')">
                    ${isZh ? '了解详情' : 'Learn More'}
                  </button>
                  <button class="btn-buy" onclick="event.stopPropagation(); buyProduct('${product.id}')">
                    ${isZh ? '立即购买' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 获取产品详情
  getProductDetails(productId) {
    return this.products.find(p => p.id === productId);
  }

  // 按分类获取产品
  getProductsByCategory(category) {
    return this.products.filter(p => p.category === category);
  }

  // 搜索产品
  searchProducts(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.fengshuiBenefits.some(benefit => 
        benefit.toLowerCase().includes(lowercaseQuery)
      )
    );
  }
}

// 只在window对象不存在实例时创建
if (!window.productRecommendationSystem) {
  window.productRecommendationSystem = new ProductRecommendationSystem();
}

// 显示产品详情模态框
function showProductModal(productId) {
  const product = window.productRecommendationSystem.getProductDetails(productId);
  if (!product) return;
  
  const isZh = localStorage.getItem('preferred-language') === 'zh';
  
  const modalHTML = `
    <div class="product-modal-overlay" onclick="closeProductModal()">
      <div class="product-modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>${product.name}</h3>
          <button class="modal-close" onclick="closeProductModal()">×</button>
        </div>
        <div class="modal-content">
          <div class="modal-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="modal-details">
            <div class="product-rating-detailed">
              <div class="stars">★★★★★</div>
              <span class="rating-text">${product.rating} (${product.reviews} ${isZh ? '评价' : 'reviews'})</span>
            </div>
            <p class="product-description-detailed">${product.description}</p>
            <div class="product-benefits-detailed">
              <h4>${isZh ? '风水功效' : 'Feng Shui Benefits'}</h4>
              <div class="benefits-grid">
                ${product.fengshuiBenefits.map(benefit => 
                  `<span class="benefit-tag-large">${benefit}</span>`
                ).join('')}
              </div>
            </div>
            <div class="product-placement-detailed">
              <h4>${isZh ? '推荐摆放位置' : 'Recommended Placement'}</h4>
              <p>${product.placement.join('、')}</p>
            </div>
            <div class="product-situations-detailed">
              <h4>${isZh ? '适用情况' : 'Applicable Situations'}</h4>
              <ul>
                ${product.situations.map(situation => 
                  `<li>${situation}</li>`
                ).join('')}
              </ul>
            </div>
            <div class="product-price-detailed">
              <span class="price-label">${isZh ? '价格:' : 'Price:'}</span>
              <span class="price-amount-large">${product.currency}${product.price}</span>
            </div>
            <div class="modal-actions">
              <button class="btn-buy-large" onclick="buyProduct('${product.id}')">
                ${isZh ? '立即购买' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden';
}

// 关闭产品模态框
function closeProductModal() {
  const modal = document.querySelector('.product-modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// 购买产品
function buyProduct(productId) {
  const product = window.productRecommendationSystem.getProductDetails(productId);
  const isZh = localStorage.getItem('preferred-language') === 'zh';
  
  alert(isZh ? 
    `感谢您的购买意向！${product.name} 将为您带来好运。请联系客服完成购买。` :
    `Thank you for your purchase interest! ${product.name} will bring you good luck. Please contact customer service to complete the purchase.`
  );
}

// 导出系统
export { ProductRecommendationSystem }; 