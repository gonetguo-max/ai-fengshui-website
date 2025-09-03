// 风水知识库 - 基于《周易今注今译》等经典著作
export const fengshuiKnowledgeBase = {
  // 基础理论
  basicTheory: {
    yinYang: {
      title: "阴阳理论",
      content: [
        // 请在这里添加阴阳相关内容
        "阴阳是中国古代哲学的重要概念...",
      ],
      examples: [],
      applications: []
    },
    wuXing: {
      title: "五行学说", 
      content: [
        // 请在这里添加五行相关内容
      ],
      elements: ["金", "木", "水", "火", "土"],
      relationships: {
        generate: "金生水，水生木，木生火，火生土，土生金",
        overcome: "金克木，木克土，土克水，水克火，火克金"
      }
    }
  },

  // 八卦知识
  bagua: {
    eightGua: {
      qian: { name: "乾", symbol: "☰", element: "金", direction: "西北", meaning: "天" },
      kun: { name: "坤", symbol: "☷", element: "土", direction: "西南", meaning: "地" },
      zhen: { name: "震", symbol: "☳", element: "木", direction: "东", meaning: "雷" },
      xun: { name: "巽", symbol: "☴", element: "木", direction: "东南", meaning: "风" },
      kan: { name: "坎", symbol: "☵", element: "水", direction: "北", meaning: "水" },
      li: { name: "离", symbol: "☲", element: "火", direction: "南", meaning: "火" },
      gen: { name: "艮", symbol: "☶", element: "土", direction: "东北", meaning: "山" },
      dui: { name: "兑", symbol: "☱", element: "金", direction: "西", meaning: "泽" }
    }
  },

  // 住宅风水
  residentialFengshui: {
    roomLayout: {
      title: "房间布局",
      content: [
        // 请添加房间布局相关内容
      ]
    },
    doorWindow: {
      title: "门窗朝向",
      content: [
        // 请添加门窗朝向相关内容  
      ]
    }
  },

  // 办公风水
  officeFengshui: {
    deskPlacement: {
      title: "办公桌摆放",
      content: [
        // 请添加办公桌摆放相关内容
      ]
    }
  },

  // 经典案例
  classicCases: [
    {
      title: "案例标题",
      description: "案例描述",
      analysis: "风水分析",
      solution: "解决方案",
      source: "《周易今注今译》第X页"
    }
  ],

  // 常用公式和计算方法
  formulas: {
    luopan: {
      title: "罗盘使用方法",
      steps: [
        // 请添加罗盘使用步骤
      ]
    }
  },

  // 禁忌和注意事项
  taboos: [
    {
      category: "住宅",
      items: [
        // 请添加住宅风水禁忌
      ]
    }
  ]
};

// 知识搜索功能
export function searchKnowledge(keyword) {
  const results = [];
  
  function searchInObject(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
        results.push({
          path: currentPath,
          content: value,
          type: 'text'
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && item.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({
              path: `${currentPath}[${index}]`,
              content: item,
              type: 'array_item'
            });
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        searchInObject(value, currentPath);
      }
    }
  }
  
  searchInObject(fengshuiKnowledgeBase);
  return results;
}

// 获取随机风水小贴士
export function getRandomTip() {
  const allTips = [];
  
  // 收集所有content数组中的内容
  function collectTips(obj) {
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value.content)) {
          allTips.push(...value.content);
        } else {
          collectTips(value);
        }
      }
    }
  }
  
  collectTips(fengshuiKnowledgeBase);
  
  if (allTips.length > 0) {
    return allTips[Math.floor(Math.random() * allTips.length)];
  }
  
  return "学习风水，从理解阴阳五行开始。";
} 