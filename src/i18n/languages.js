// 多语言配置文件
export const languages = {
  zh: {
    name: '中文',
    code: 'zh-CN',
    flag: '🇨🇳'
  },
  en: {
    name: 'English', 
    code: 'en-US',
    flag: '🇺🇸'
  }
};

// 文本翻译数据
export const translations = {
  zh: {
    // 网站标题和描述
    siteTitle: 'AI风水分析助手',
    siteSubtitle: '传统智慧与现代科技的完美结合',
    logoText: 'AI风水分析',
    
    // 导航菜单
    nav: {
      home: '首页',
      analysis: '风水分析', 
      about: '关于我们',
      contact: '联系我们',
      language: '语言'
    },
    
    // 主页内容
    hero: {
      title: 'AI智能风水分析',
      subtitle: '让传统风水智慧指引您的人生',
      description: '结合千年风水学理论与现代AI技术，为您提供专业、准确的风水分析服务',
      startButton: '开始风水分析',
      uploadButton: '上传照片分析'
    },
    
    // 分析表单
    form: {
      title: '请填写您的风水分析信息',
      personalInfo: '个人信息',
      name: '姓名',
      namePlaceholder: '请输入您的姓名',
      birthDate: '出生日期',
      gender: '性别',
      genderMale: '男',
      genderFemale: '女',
      
      propertyInfo: '房屋信息',
      propertyType: '🏠 房屋类型',
      propertyTypePlaceholder: '请选择房屋类型',
      propertyTypeOptions: {
        residential: '住宅',
        office: '办公室',
        shop: '商铺',
        factory: '工厂',
        other: '其他'
      },
      address: '房屋地址',
      addressPlaceholder: '请输入详细地址',
      direction: '🧭 房屋朝向',
      directionPlaceholder: '请选择主要朝向',
      directionOptions: {
        north: '正北 (坎卦)',
        northeast: '东北 (艮卦)',
        east: '正东 (震卦)', 
        southeast: '东南 (巽卦)',
        south: '正南 (离卦)',
        southwest: '西南 (坤卦)',
        west: '正西 (兑卦)',
        northwest: '西北 (乾卦)'
      },
      
      layoutInfo: '布局信息',
      roomCount: '房间数量',
      floorPlan: '🏗️ 户型布局',
      floorPlanPlaceholder: '例如：三室两厅一卫',
      
      photoUpload: '📸 上传房屋照片 (可选)',
      photoUploadDesc: '上传房屋照片，获得更准确的分析',
      photoUploadHint: '支持JPG、PNG格式，最大5MB',
      dragUpload: '点击或拖拽上传照片',
      
      area: '📏 房屋面积 (平方米)',
      areaPlaceholder: '例如：120',
      
      purpose: '🎯 主要用途',
      purposePlaceholder: '请选择主要用途',
      purposeOptions: {
        residential: '居住',
        office: '办公',
        business: '经营',
        leisure: '休闲',
        study: '学习'
      },
      
      concerns: '❓ 特殊关注点或问题描述',
      concernsPlaceholder: '请描述您想要改善的具体问题，如：财运不佳、睡眠质量差、工作不顺等...',
      
      submitButton: '🔮 开始AI深度分析',
      analyzing: '🔄 分析中...',
      analysisTime: '预计分析时间：30-60秒'
    },
    
    // 分析结果
    results: {
      title: '📊 AI风水分析报告',
      overallScore: '综合评分',
      scoreOut: '分（满分100分）',
      directions: '方位分析',
      layout: '布局建议', 
      improvements: '改善措施',
      timing: '时间建议',
      warnings: '注意事项',
      recommendations: '产品推荐',
      
      downloadReport: '下载完整报告',
      shareReport: '分享报告',
      newAnalysis: '重新分析',
      
      loadingTitle: '正在为您分析...',
      loadingMessages: [
        '正在解读您的房屋气场...',
        '分析五行相生相克关系...',
        '计算最佳布局方案...',
        '生成个性化建议...'
      ]
    },
    
    // 产品推荐
    products: {
      title: '根据您的分析结果，推荐以下风水产品',
      buyNow: '立即购买',
      learnMore: '了解更多',
      categories: {
        mirrors: '镜子类',
        plants: '植物类', 
        crystals: '水晶类',
        ornaments: '摆件类',
        lighting: '灯具类'
      }
    },
    
    // 特色功能
    features: {
      residential: {
        title: '智能住宅分析',
        description: '运用先进AI技术，结合传统风水理论，为您的居住环境提供专业分析和改善建议'
      },
      direction: {
        title: '方位能量测算',
        description: '基于八卦方位和五行理论，精确测算各个方位的能量分布，优化空间布局'
      },
      instant: {
        title: '即时智能建议',
        description: '24小时在线AI助手，提供个性化的风水改善方案和实用指导建议'
      }
    },

    // 页脚
    footer: {
      copyright: '版权所有',
      privacy: '隐私政策',
      terms: '服务条款',
      contact: '联系我们',
      wechat: '微信客服',
      email: '邮箱咨询',
      copyrightText: '© 2024 AI风水分析助手 | 传承古典智慧，拥抱科技未来'
    },
    
    // 错误和提示信息
    messages: {
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '提示',
      
      formValidation: {
        nameRequired: '请输入姓名',
        birthDateRequired: '请选择出生日期',
        addressRequired: '请输入房屋地址',
        directionRequired: '请选择房屋朝向',
        floorPlanRequired: '请描述房间布局'
      },
      
      uploadMessages: {
        uploading: '正在上传...',
        uploadSuccess: '上传成功',
        uploadError: '上传失败，请重试',
        fileTooLarge: '文件过大，请选择小于5MB的图片',
        invalidFormat: '不支持的文件格式，请选择JPG或PNG图片'
      },
      
      analysisMessages: {
        analysisStarted: '分析已开始，请耐心等待...',
        analysisComplete: '分析完成！',
        analysisError: '分析过程中出现错误，请重试',
        noResults: '未获取到分析结果，请检查输入信息'
      }
    },
    
    // 分析报告
    report: {
      title: "AI风水分析报告",
      generatedBy: "AI深度思考分析报告 · 由 deepseek-reasoner 生成",
      analysisTime: "分析时间",
      overallScore: "风水综合评分",
      overallRating: "良好 - 略有改善空间",
      directionScore: "方位评分",
      layoutScore: "布局评分",
      usageScore: "用途适配",
      comprehensiveAnalysis: "总体评分",
      comprehensive: "综合",
      analysisInfo: "分析信息摘要",
      propertyType: "房屋类型",
      orientation: "朝向方位",
      buildingArea: "建筑面积",
      floorPlan: "户型布局",
      mainUse: "主要用途",
      exportReport: "📄 导出报告",
      reanalyze: "🔄 重新分析"
    }
  },
  
  en: {
    // Website title and description
    siteTitle: 'AI Feng Shui Analysis Assistant',
    siteSubtitle: 'Perfect Combination of Traditional Wisdom and Modern Technology',
    logoText: 'AI Feng Shui',
    
    // Navigation menu
    nav: {
      home: 'Home',
      analysis: 'Feng Shui Analysis',
      about: 'About Us', 
      contact: 'Contact',
      language: 'Language'
    },
    
    // Homepage content
    hero: {
      title: 'AI Intelligent Feng Shui Analysis',
      subtitle: 'Let Traditional Feng Shui Wisdom Guide Your Life',
      description: 'Combining thousand-year Feng Shui theory with modern AI technology to provide professional and accurate Feng Shui analysis services',
      startButton: 'Start Feng Shui Analysis',
      uploadButton: 'Upload Photo Analysis'
    },
    
    // Analysis form
    form: {
      title: 'Please Fill in Your Feng Shui Analysis Information',
      personalInfo: 'Personal Information',
      name: 'Name',
      namePlaceholder: 'Please enter your name',
      birthDate: 'Birth Date',
      gender: 'Gender',
      genderMale: 'Male',
      genderFemale: 'Female',
      
      propertyInfo: 'Property Information',
      propertyType: '🏠 Property Type',
      propertyTypePlaceholder: 'Please select property type',
      propertyTypeOptions: {
        residential: 'Residential',
        office: 'Office',
        shop: 'Shop',
        factory: 'Factory',
        other: 'Other'
      },
      address: 'Property Address',
      addressPlaceholder: 'Please enter detailed address',
      direction: '🧭 Property Orientation',
      directionPlaceholder: 'Please select main orientation',
      directionOptions: {
        north: 'North (Kan)',
        northeast: 'Northeast (Gen)',
        east: 'East (Zhen)',
        southeast: 'Southeast (Xun)',  
        south: 'South (Li)',
        southwest: 'Southwest (Kun)',
        west: 'West (Dui)',
        northwest: 'Northwest (Qian)'
      },
      
      area: '📏 Property Area (sq.m)',
      areaPlaceholder: 'e.g., 120',
      
      layoutInfo: 'Layout Information',
      roomCount: 'Number of Rooms',
      floorPlan: '🏗️ Floor Plan Description',
      floorPlanPlaceholder: 'e.g., 3 bedrooms, 2 living rooms, 1 bathroom',
      
      purpose: '🎯 Main Purpose',
      purposePlaceholder: 'Please select main purpose',
      purposeOptions: {
        residential: 'Residential',
        office: 'Office',
        business: 'Business',
        leisure: 'Leisure',
        study: 'Study'
      },
      
      photoUpload: '📸 Upload Property Photos (Optional)',
      photoUploadDesc: 'Upload property photos for more accurate analysis',
      photoUploadHint: 'Supports JPG, PNG format, max 5MB',
      dragUpload: 'Click or drag to upload photos',
      
      concerns: '❓ Special Concerns or Problem Description',
      concernsPlaceholder: 'Please describe specific issues you want to improve, such as: poor wealth luck, poor sleep quality, work problems, etc...',
      
      submitButton: '🔮 Start AI Deep Analysis',
      analyzing: 'Analyzing...',
      analysisTime: 'Estimated analysis time: 30-60 seconds'
    },
    
    // Analysis results
    results: {
      title: '📊 Your Feng Shui Analysis Report',
      overallScore: 'Overall Score',
      scoreOut: ' out of 100',
      directions: 'Direction Analysis',
      layout: 'Layout Suggestions',
      improvements: 'Improvement Measures', 
      timing: 'Timing Recommendations',
      warnings: 'Precautions',
      recommendations: 'Product Recommendations',
      
      downloadReport: 'Download Full Report',
      shareReport: 'Share Report',
      newAnalysis: 'New Analysis',
      
      loadingTitle: 'Analyzing for you...',
      loadingMessages: [
        'Reading your property energy field...',
        'Analyzing Five Elements interactions...',
        'Calculating optimal layout solutions...',
        'Generating personalized recommendations...'
      ]
    },
    
    // Report content
    report: {
      title: 'AI Feng Shui Analysis Report',
      generatedBy: 'AI Deep Thinking Analysis Report · Generated by deepseek-reasoner',
      analysisTime: 'Analysis Time',
      overallScore: 'Feng Shui Overall Score',
      overallRating: 'Good - Room for Improvement',
      directionScore: 'Direction Score',
      layoutScore: 'Layout Score',
      usageScore: 'Usage Compatibility',
      comprehensiveAnalysis: 'Comprehensive Analysis',
      comprehensive: 'Comprehensive',
      analysisInfo: 'Analysis Information Summary',
      propertyType: 'Property Type',
      orientation: 'Orientation',
      buildingArea: 'Building Area',
      floorPlan: 'Floor Plan',
      mainUse: 'Main Use',
      exportReport: '📄 Export Report',
      reanalyze: '🔄 Re-analyze'
    },
    
    // Product recommendations
    products: {
      title: 'Based on your analysis results, we recommend the following Feng Shui products',
      buyNow: 'Buy Now',
      learnMore: 'Learn More',
      categories: {
        mirrors: 'Mirrors',
        plants: 'Plants',
        crystals: 'Crystals', 
        ornaments: 'Ornaments',
        lighting: 'Lighting'
      }
    },
    
    // Features
    features: {
      residential: {
        title: 'Smart Residential Analysis',
        description: 'Using advanced AI technology combined with traditional Feng Shui theory to provide professional analysis and improvement suggestions for your living environment'
      },
      direction: {
        title: 'Directional Energy Calculation',
        description: 'Based on Bagua directions and Five Elements theory, accurately calculate energy distribution in all directions and optimize spatial layout'
      },
      instant: {
        title: 'Instant Smart Recommendations',
        description: '24/7 online AI assistant providing personalized Feng Shui improvement plans and practical guidance recommendations'
      }
    },

    // Footer
    footer: {
      copyright: 'All Rights Reserved',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact Us',
      wechat: 'WeChat Support',
      email: 'Email Inquiry',
      copyrightText: '© 2024 AI Feng Shui Analysis | Inheriting Classical Wisdom, Embracing Technological Future'
    },
    
    // Error and notification messages
    messages: {
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      
      formValidation: {
        nameRequired: 'Please enter your name',
        birthDateRequired: 'Please select birth date',
        addressRequired: 'Please enter property address',
        directionRequired: 'Please select property orientation',
        floorPlanRequired: 'Please describe room layout'
      },
      
      uploadMessages: {
        uploading: 'Uploading...',
        uploadSuccess: 'Upload successful',
        uploadError: 'Upload failed, please try again',
        fileTooLarge: 'File too large, please select image under 5MB',
        invalidFormat: 'Unsupported file format, please select JPG or PNG image'
      },
      
      analysisMessages: {
        analysisStarted: 'Analysis started, please wait patiently...',
        analysisComplete: 'Analysis complete!',
        analysisError: 'Error occurred during analysis, please try again',
        noResults: 'No analysis results obtained, please check input information'
      }
    }
  }
};

// 默认语言
export const defaultLanguage = 'zh';

// 获取浏览器语言
export function getBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

// 获取翻译文本
export function getTranslation(key, lang = defaultLanguage) {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // 如果找不到翻译，返回key本身
    }
  }
  
  return value || key;
}

// 设置页面语言
export function setPageLanguage(lang) {
  document.documentElement.lang = languages[lang]?.code || languages[defaultLanguage].code;
  localStorage.setItem('preferred-language', lang);
}

// 获取保存的语言设置
export function getSavedLanguage() {
  return localStorage.getItem('preferred-language') || getBrowserLanguage();
} 