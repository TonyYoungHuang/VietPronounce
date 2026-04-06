const levels = [
  { id: 'beginner', name: '零基础', subtitle: '从音到词，先把发音底盘练稳。', accent: '入门打底' },
  { id: 'elementary', name: '初级', subtitle: '进入高频短句，开始训练节奏与衔接。', accent: '短句开口' },
  { id: 'intermediate', name: '中等', subtitle: '继续强化句子稳定度与复杂表达。', accent: '表达进阶' }
];

const trialItems = {
  north: {
    id: 'north-trial-1',
    lessonId: 'north-beginner-lesson-1',
    levelId: 'beginner',
    type: 'sentence',
    text: 'xin chào',
    translation: '你好',
    hint: '近似：辛 招（仅作入门提示）',
    demoAudio: '/assets/audio/north-demo.wav',
    segments: [
      { text: 'xin', tip: '起音要更轻更细，摩擦感不要丢。' },
      { text: 'chào', tip: '声调下落不够，尾音要更沉一点。' }
    ]
  },
  south: {
    id: 'south-trial-1',
    lessonId: 'south-beginner-lesson-1',
    levelId: 'beginner',
    type: 'sentence',
    text: 'xin chào',
    translation: '你好',
    hint: '近似：辛 赵（仅作入门提示）',
    demoAudio: '/assets/audio/south-demo.wav',
    segments: [
      { text: 'xin', tip: '首音可以更松一些，不要读得太硬。' },
      { text: 'chào', tip: '南越版本更顺，尾部不要压得太死。' }
    ]
  }
};

const catalog = {
  north: {
    id: 'north',
    name: '北越',
    description: '更适合走标准、清晰、音调区分更明显的训练路线。',
    previewAudio: '/assets/audio/north-demo.wav',
    levels: [
      {
        id: 'beginner',
        name: '零基础',
        lessons: [
          {
            id: 'north-beginner-lesson-1',
            title: '招呼音入门',
            summary: '先练问候里最常见的几个音和短词。',
            items: [
              {
                id: 'north-beginner-1',
                type: 'syllable',
                text: 'xin',
                translation: '问候开头音节',
                hint: '近似：辛',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: 'xin', tip: 'x 的摩擦感要更细，不要读成普通的“辛”。' }]
              },
              {
                id: 'north-beginner-2',
                type: 'word',
                text: 'chào',
                translation: '你好里的后半词',
                hint: '近似：招（仅近似）',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: 'chào', tip: '北越下落更明显，收尾再沉一点。' }]
              },
              {
                id: 'north-beginner-3',
                type: 'sentence',
                text: 'xin chào',
                translation: '你好',
                hint: '近似：辛 招',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [
                  { text: 'xin', tip: '起音要更清。' },
                  { text: 'chào', tip: '声调不要走平。' }
                ]
              }
            ]
          },
          {
            id: 'north-beginner-lesson-2',
            title: '礼貌表达',
            summary: '开始加入感谢与回应。',
            items: [
              {
                id: 'north-beginner-4',
                type: 'word',
                text: 'cảm ơn',
                translation: '谢谢',
                hint: '近似：感 恩',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [
                  { text: 'cảm', tip: '鼻化和调值要更稳。' },
                  { text: 'ơn', tip: '央元音不要挤成“恩”。' }
                ]
              },
              {
                id: 'north-beginner-5',
                type: 'sentence',
                text: 'cảm ơn bạn',
                translation: '谢谢你',
                hint: '近似：感 恩 半',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [
                  { text: 'cảm', tip: '起音不要发得太扁。' },
                  { text: 'ơn', tip: '尾部口型要更开。' },
                  { text: 'bạn', tip: '尾音收得太快，保留鼻音。' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'elementary',
        name: '初级',
        lessons: [
          {
            id: 'north-elementary-lesson-1',
            title: '自我介绍短句',
            summary: '开始进入完整短句节奏。',
            items: [
              {
                id: 'north-elementary-1',
                type: 'sentence',
                text: 'Tôi là Linh',
                translation: '我是 Linh。',
                hint: '近似：多一 拉 玲',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [
                  { text: 'Tôi', tip: '双元音起伏不够明显。' },
                  { text: 'là', tip: '轻重落点要更自然。' },
                  { text: 'Linh', tip: '尾音别丢。' }
                ]
              },
              {
                id: 'north-elementary-2',
                type: 'sentence',
                text: 'Tôi đến từ Trung Quốc',
                translation: '我来自中国。',
                hint: '近似：多一 登 子 中 国',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [
                  { text: 'đến', tip: '调值上扬不足。' },
                  { text: 'từ', tip: '元音位置偏前。' },
                  { text: 'Quốc', tip: '尾部收束不够利落。' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'intermediate',
        name: '中等',
        lessons: [
          {
            id: 'north-intermediate-lesson-1',
            title: '服务场景短句',
            summary: '用更长一点的句子检查稳定度。',
            items: [
              {
                id: 'north-intermediate-1',
                type: 'sentence',
                text: 'Cho tôi xem thực đơn',
                translation: '请给我看看菜单。',
                hint: '近似：揪 多一 先 特 登',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [
                  { text: 'Cho', tip: '起音可以更圆。' },
                  { text: 'thực', tip: '辅音束太弱。' },
                  { text: 'đơn', tip: '尾音要更清晰。' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  south: {
    id: 'south',
    name: '南越',
    description: '更偏自然顺口、语流更柔和，适合南越表达习惯。',
    previewAudio: '/assets/audio/south-demo.wav',
    levels: [
      {
        id: 'beginner',
        name: '零基础',
        lessons: [
          {
            id: 'south-beginner-lesson-1',
            title: '问候起步',
            summary: '从最常见的招呼表达开始进入南越节奏。',
            items: [
              {
                id: 'south-beginner-1',
                type: 'syllable',
                text: 'xin',
                translation: '问候开头音节',
                hint: '近似：辛',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: 'xin', tip: '南越更顺，别发得太紧。' }]
              },
              {
                id: 'south-beginner-2',
                type: 'word',
                text: 'chào',
                translation: '你好里的后半词',
                hint: '近似：招 / 赵',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: 'chào', tip: '收尾别压死，带一点顺滑感。' }]
              },
              {
                id: 'south-beginner-3',
                type: 'sentence',
                text: 'xin chào',
                translation: '你好',
                hint: '近似：辛 赵',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [
                  { text: 'xin', tip: '起音不要太硬。' },
                  { text: 'chào', tip: '尾部放松一点。' }
                ]
              }
            ]
          },
          {
            id: 'south-beginner-lesson-2',
            title: '礼貌回应',
            summary: '加入谢谢和回答句。',
            items: [
              {
                id: 'south-beginner-4',
                type: 'word',
                text: 'cảm ơn',
                translation: '谢谢',
                hint: '近似：感 恩',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [
                  { text: 'cảm', tip: '起音别太扁。' },
                  { text: 'ơn', tip: '南越这里更柔一点。' }
                ]
              },
              {
                id: 'south-beginner-5',
                type: 'sentence',
                text: 'cảm ơn nhiều',
                translation: '非常感谢',
                hint: '近似：感 恩 妞',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [
                  { text: 'cảm', tip: '鼻化要稳。' },
                  { text: 'ơn', tip: '不要压成普通话“恩”。' },
                  { text: 'nhiều', tip: '双元音不要缩得太短。' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'elementary',
        name: '初级',
        lessons: [
          {
            id: 'south-elementary-lesson-1',
            title: '自我介绍短句',
            summary: '保持南越语流的自然感。',
            items: [
              {
                id: 'south-elementary-1',
                type: 'sentence',
                text: 'Tôi tên là Mai',
                translation: '我叫 Mai。',
                hint: '近似：多一 登 拉 麦',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [
                  { text: 'Tôi', tip: '双元音起伏不足。' },
                  { text: 'tên', tip: '元音别太扁。' },
                  { text: 'Mai', tip: '尾部别收太快。' }
                ]
              },
              {
                id: 'south-elementary-2',
                type: 'sentence',
                text: 'Tôi đến từ Thượng Hải',
                translation: '我来自上海。',
                hint: '近似：多一 登 子 上 海',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [
                  { text: 'đến', tip: '起落变化偏弱。' },
                  { text: 'Thượng', tip: '送气要再清一点。' },
                  { text: 'Hải', tip: '尾音不要散。' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'intermediate',
        name: '中等',
        lessons: [
          {
            id: 'south-intermediate-lesson-1',
            title: '点餐场景短句',
            summary: '用轻服务场景练连续表达。',
            items: [
              {
                id: 'south-intermediate-1',
                type: 'sentence',
                text: 'Cho tôi một ly cà phê',
                translation: '请给我一杯咖啡。',
                hint: '近似：揪 多一 莫 李 咖 飞',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [
                  { text: 'một', tip: '收尾太急。' },
                  { text: 'ly', tip: '元音偏窄。' },
                  { text: 'phê', tip: '尾部再顺一点。' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

const redeemCodes = ['VIET-2026-OPEN', 'VIET-2026-PLUS', 'VIET-2026-TRIAL'];

module.exports = {
  catalog,
  levels,
  trialItems,
  redeemCodes
};
