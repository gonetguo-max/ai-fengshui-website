// 国际化管理器
import { 
  languages, 
  translations, 
  defaultLanguage, 
  getTranslation, 
  setPageLanguage, 
  getSavedLanguage 
} from '../i18n/languages.js';

class I18nManager {
  constructor() {
    this.currentLanguage = getSavedLanguage();
    this.initialized = false;
  }

  // 初始化国际化系统
  init() {
    if (this.initialized) return;
    
    console.log('🌐 初始化多语言系统...');
    
    // 设置页面语言
    setPageLanguage(this.currentLanguage);
    
    // 创建语言切换器
    this.createLanguageSwitcher();
    
    // 更新页面文本
    this.updatePageTexts();
    
    // 绑定事件监听
    this.bindEvents();
    
    this.initialized = true;
    console.log(`✅ 多语言系统初始化完成，当前语言: ${this.currentLanguage}`);
  }

  // 创建语言切换器
  createLanguageSwitcher() {
    const header = document.querySelector('.header') || document.querySelector('header');
    if (!header) return;

    // 检查是否已存在语言切换器
    if (document.getElementById('language-switcher')) return;

    const languageSwitcher = document.createElement('div');
    languageSwitcher.id = 'language-switcher';
    languageSwitcher.className = 'language-switcher';
    
    languageSwitcher.innerHTML = `
      <div class="language-dropdown">
        <button class="language-btn" id="current-language">
          ${languages[this.currentLanguage].flag} ${languages[this.currentLanguage].name}
          <span class="dropdown-arrow">▼</span>
        </button>
        <div class="language-options" id="language-options">
          ${Object.entries(languages).map(([code, lang]) => `
            <div class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
                 data-lang="${code}">
              ${lang.flag} ${lang.name}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .language-switcher {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 1000;
      }
      
      .language-dropdown {
        position: relative;
      }
      
      .language-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 15px;
        background: rgba(218, 165, 32, 0.1);
        border: 2px solid rgba(218, 165, 32, 0.3);
        border-radius: 25px;
        color: #DAA520;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }
      
      .language-btn:hover {
        background: rgba(218, 165, 32, 0.2);
        border-color: rgba(218, 165, 32, 0.5);
        transform: translateY(-2px);
      }
      
      .dropdown-arrow {
        transition: transform 0.3s ease;
      }
      
      .language-dropdown.open .dropdown-arrow {
        transform: rotate(180deg);
      }
      
      .language-options {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 5px;
        background: rgba(26, 26, 26, 0.95);
        border: 2px solid rgba(218, 165, 32, 0.3);
        border-radius: 15px;
        overflow: hidden;
        min-width: 150px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        backdrop-filter: blur(15px);
      }
      
      .language-dropdown.open .language-options {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .language-option {
        padding: 12px 16px;
        color: #f4f4f4;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .language-option:hover {
        background: rgba(218, 165, 32, 0.2);
        color: #DAA520;
      }
      
      .language-option.active {
        background: rgba(218, 165, 32, 0.3);
        color: #DAA520;
        font-weight: bold;
      }
      
      @media (max-width: 768px) {
        .language-switcher {
          top: 10px;
          right: 10px;
        }
        
        .language-btn {
          padding: 8px 12px;
          font-size: 14px;
        }
      }
    `;
    
    document.head.appendChild(style);
    header.appendChild(languageSwitcher);
  }

  // 绑定事件监听
  bindEvents() {
    // 语言切换器事件
    const languageBtn = document.getElementById('current-language');
    const languageOptions = document.getElementById('language-options');
    const dropdown = document.querySelector('.language-dropdown');

    if (languageBtn && languageOptions && dropdown) {
      // 点击按钮显示/隐藏下拉菜单
      languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });

      // 点击语言选项切换语言
      languageOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.language-option');
        if (option) {
          const newLang = option.dataset.lang;
          this.switchLanguage(newLang);
          dropdown.classList.remove('open');
        }
      });

      // 点击其他区域关闭下拉菜单
      document.addEventListener('click', () => {
        dropdown.classList.remove('open');
      });
    }
  }

  // 切换语言
  switchLanguage(newLang) {
    if (newLang === this.currentLanguage) return;
    
    console.log(`🔄 切换语言: ${this.currentLanguage} → ${newLang}`);
    
    this.currentLanguage = newLang;
    setPageLanguage(newLang);
    
    // 更新语言切换器显示
    this.updateLanguageSwitcher();
    
    // 更新页面所有文本
    this.updatePageTexts();
    
    // 触发语言切换事件
    document.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { 
        oldLang: this.currentLanguage, 
        newLang: newLang 
      } 
    }));
    
    // 重新初始化产品推荐系统
    if (window.productRecommendationSystem) {
      window.productRecommendationSystem.updateLanguage(newLang);
    }
    
    console.log(`✅ 语言切换完成: ${newLang}`);
  }

  // 更新语言切换器显示
  updateLanguageSwitcher() {
    const currentLangBtn = document.getElementById('current-language');
    const options = document.querySelectorAll('.language-option');
    
    if (currentLangBtn) {
      const currentLangInfo = languages[this.currentLanguage];
      currentLangBtn.innerHTML = `
        ${currentLangInfo.flag} ${currentLangInfo.name}
        <span class="dropdown-arrow">▼</span>
      `;
    }
    
    options.forEach(option => {
      option.classList.toggle('active', option.dataset.lang === this.currentLanguage);
    });
  }

  // 更新页面文本
  updatePageTexts() {
    console.log('🔄 更新页面文本...');
    
    // 更新标题
    const title = document.querySelector('title');
    if (title) {
      title.textContent = this.t('siteTitle');
    }
    
    // 更新所有带有 data-i18n 属性的元素
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const text = this.t(key);
      
      if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || element.type === 'number')) {
        element.placeholder = text;
      } else if (element.tagName === 'TEXTAREA') {
        element.placeholder = text;
      } else if (element.tagName === 'OPTION') {
        // 特殊处理下拉选项
        element.textContent = text;
      } else {
        element.textContent = text;
      }
    });
    
    // 更新分析按钮文本
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn && !analyzeBtn.disabled) {
      analyzeBtn.textContent = this.t('form.submitButton');
    }
    
    // 手动更新一些特殊元素
    this.updateSpecialElements();
    
    console.log('✅ 页面文本更新完成');
  }

  // 更新特殊元素
  updateSpecialElements() {
    // 更新网站标题
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.textContent = this.t('hero.title');
    }
    
    // 更新副标题
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
      heroSubtitle.textContent = this.t('hero.subtitle');
    }
    
    // 更新按钮文本
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
      ctaButton.textContent = this.t('hero.startButton');
    }
    
    // 更新表单标题
    const formTitle = document.querySelector('.analysis-section h2');
    if (formTitle) {
      formTitle.textContent = this.t('form.title');
    }
  }

  // 获取翻译文本（简化方法）
  t(key) {
    return getTranslation(key, this.currentLanguage);
  }

  // 获取当前语言
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 获取支持的语言列表
  getSupportedLanguages() {
    return languages;
  }

  // 添加翻译到页面元素
  addTranslations(elements) {
    elements.forEach(({ selector, key, attribute = 'textContent' }) => {
      const element = document.querySelector(selector);
      if (element) {
        if (attribute === 'placeholder') {
          element.placeholder = this.t(key);
        } else {
          element[attribute] = this.t(key);
        }
      }
    });
  }

  // 动态添加新的翻译内容
  addDynamicTranslations(translations) {
    Object.keys(translations).forEach(lang => {
      if (translations[lang] && typeof translations[lang] === 'object') {
        Object.assign(translations[lang], translations[lang]);
      }
    });
  }
}

// 创建全局实例
const i18nManager = new I18nManager();

// 导出
export default i18nManager;

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    i18nManager.init();
  });
} else {
  i18nManager.init();
} 