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
    text: 'Cà phê sữa đá ngon quá',
    translation: '冰咖啡太好喝了',
    hint: '先稳住 cà phê 的下落，再把 sữa đá 的声调拉开。',
    demoAudio: '/assets/audio/north-demo.wav',
    segments: [
      { text: 'Cà phê', tip: 'cà 的下落调要稳，phê 的元音保持清亮。' },
      { text: 'sữa đá', tip: 'sữa 的弯曲感要出来，đá 轻快抬起。' },
      { text: 'ngon quá', tip: 'ngon 的鼻音收住，quá 不要读得太冲。' }
    ]
  },
  south: {
    id: 'south-trial-1',
    lessonId: 'south-beginner-lesson-1',
    levelId: 'beginner',
    type: 'sentence',
    text: 'Cà phê sữa đá ngon quá',
    translation: '冰咖啡太好喝了',
    hint: '整体读得顺一点，sữa đá 不要压得太紧。',
    demoAudio: '/assets/audio/south-demo.wav',
    segments: [
      { text: 'Cà phê', tip: '南越读得更松，两个音节要连得自然。' },
      { text: 'sữa đá', tip: 'sữa 保持圆润，đá 不要冲得太硬。' },
      { text: 'ngon quá', tip: 'ngon 的尾音不要拖长，quá 保持轻快。' }
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
          },
          {
            id: 'north-beginner-lesson-3',
            title: '声调与尾音起步',
            summary: '用 an / át / bàn / bát 先区分北越里的调值变化和塞音尾收口。',
            items: [
              {
                id: 'north-beginner-lesson-3-item-1',
                type: 'syllable',
                text: 'an',
                translation: '开口音节 an',
                hint: '近似：安',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: 'an', tip: '舌尖轻碰上齿龈，尾音 n 要收住，不要拖成“安呐”。' }]
              },
              {
                id: 'north-beginner-lesson-3-item-2',
                type: 'syllable',
                text: 'át',
                translation: '带 sắc 调和 t 尾的音节',
                hint: '近似：阿特（短收）',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: 'át', tip: '元音短一点，尾部 t 只收口不送气。' }]
              },
              {
                id: 'north-beginner-lesson-3-item-3',
                type: 'word',
                text: 'bàn',
                translation: '桌子',
                hint: '近似：板（仅近似）',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: 'bàn', tip: 'huyền 调往下落，n 结尾保持清楚。' }]
              },
              {
                id: 'north-beginner-lesson-3-item-4',
                type: 'word',
                text: 'bát',
                translation: '碗',
                hint: '近似：巴特（短收）',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: 'bát', tip: 'sắc 调抬起更快，t 尾戛然而止。' }]
              },
              {
                id: 'north-beginner-lesson-3-item-5',
                type: 'sentence',
                text: 'Đây là bàn.',
                translation: '这是桌子。',
                hint: '近似：得 也 拉 板',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [
                  { text: 'Đây', tip: '开头 đ 要浊而稳，不要变成普通话 d。' },
                  { text: 'là', tip: '北越下落感更明确。' },
                  { text: 'bàn', tip: '尾音 n 清楚，别吞掉。' }
                ]
              },
              {
                id: 'north-beginner-lesson-3-item-6',
                type: 'sentence',
                text: 'Đó là bát.',
                translation: '那是碗。',
                hint: '近似：朵 拉 巴特',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [
                  { text: 'Đó', tip: '元音拉够，但别拖长。' },
                  { text: 'là', tip: '和后词之间不断开。' },
                  { text: 'bát', tip: '末尾 t 只封口，不要读出完整“特”。' }
                ]
              }
            ]
          },
          {
            id: 'north-beginner-lesson-4',
            title: '数字与数量起步',
            summary: '先放入北越零基础镜像骨架，后续补数字、量词与数量表达。',
            items: [
              {
                id: 'north-beginner-lesson-4-item-1',
                type: 'syllable',
                text: '[待补充北越音节 3]',
                translation: '待补充：北越数字音节起步项',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-4-item-2',
                type: 'word',
                text: '[待补充北越单词 3]',
                translation: '待补充：北越数字词项 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-4-item-3',
                type: 'word',
                text: '[待补充北越单词 4]',
                translation: '待补充：北越数量词项 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-4-item-4',
                type: 'sentence',
                text: '[待补充北越短句 3]',
                translation: '待补充：北越数量短句 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-4-item-5',
                type: 'sentence',
                text: '[待补充北越短句 4]',
                translation: '待补充：北越数字短句 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-4-item-6',
                type: 'sentence',
                text: '[待补充北越短句 5]',
                translation: '待补充：北越数字短句 3',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              }
            ]
          },
          {
            id: 'north-beginner-lesson-5',
            title: '称呼与自我介绍起步',
            summary: '先放入北越零基础镜像骨架，后续补称呼、自称和基本介绍句。',
            items: [
              {
                id: 'north-beginner-lesson-5-item-1',
                type: 'word',
                text: '[待补充北越单词 5]',
                translation: '待补充：北越称呼词 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-5-item-2',
                type: 'word',
                text: '[待补充北越单词 6]',
                translation: '待补充：北越自称词 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-5-item-3',
                type: 'sentence',
                text: '[待补充北越短句 6]',
                translation: '待补充：北越自我介绍短句 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-5-item-4',
                type: 'sentence',
                text: '[待补充北越短句 7]',
                translation: '待补充：北越自我介绍短句 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-5-item-5',
                type: 'sentence',
                text: '[待补充北越短句 8]',
                translation: '待补充：北越称呼短句 3',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-5-item-6',
                type: 'sentence',
                text: '[待补充北越短句 9]',
                translation: '待补充：北越问候短句 4',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              }
            ]
          },
          {
            id: 'north-beginner-lesson-6',
            title: '常见问句开口',
            summary: '先放入北越零基础镜像骨架，后续补最常用的提问开口句。',
            items: [
              {
                id: 'north-beginner-lesson-6-item-1',
                type: 'word',
                text: '[待补充北越单词 7]',
                translation: '待补充：北越问句词项 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-6-item-2',
                type: 'word',
                text: '[待补充北越单词 8]',
                translation: '待补充：北越疑问词项 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-6-item-3',
                type: 'sentence',
                text: '[待补充北越短句 10]',
                translation: '待补充：北越问句短句 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-6-item-4',
                type: 'sentence',
                text: '[待补充北越短句 11]',
                translation: '待补充：北越问句短句 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-6-item-5',
                type: 'sentence',
                text: '[待补充北越短句 12]',
                translation: '待补充：北越问句短句 3',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-6-item-6',
                type: 'sentence',
                text: '[待补充北越短句 13]',
                translation: '待补充：北越问句短句 4',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              }
            ]
          },
          {
            id: 'north-beginner-lesson-7',
            title: '购物与价格短句',
            summary: '先放入北越零基础镜像骨架，后续补购物开口和价格表达。',
            items: [
              {
                id: 'north-beginner-lesson-7-item-1',
                type: 'word',
                text: '[待补充北越单词 9]',
                translation: '待补充：北越购物词项 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-7-item-2',
                type: 'word',
                text: '[待补充北越单词 10]',
                translation: '待补充：北越价格词项 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-7-item-3',
                type: 'sentence',
                text: '[待补充北越短句 14]',
                translation: '待补充：北越购物短句 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-7-item-4',
                type: 'sentence',
                text: '[待补充北越短句 15]',
                translation: '待补充：北越购物短句 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-7-item-5',
                type: 'sentence',
                text: '[待补充北越短句 16]',
                translation: '待补充：北越价格短句 3',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-7-item-6',
                type: 'sentence',
                text: '[待补充北越短句 17]',
                translation: '待补充：北越价格短句 4',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              }
            ]
          },
          {
            id: 'north-beginner-lesson-8',
            title: '点餐与礼貌请求',
            summary: '先放入北越零基础镜像骨架，后续补点餐与礼貌请求场景短句。',
            items: [
              {
                id: 'north-beginner-lesson-8-item-1',
                type: 'word',
                text: '[待补充北越单词 11]',
                translation: '待补充：北越点餐词项 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-8-item-2',
                type: 'word',
                text: '[待补充北越单词 12]',
                translation: '待补充：北越请求词项 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-8-item-3',
                type: 'sentence',
                text: '[待补充北越短句 18]',
                translation: '待补充：北越点餐短句 1',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-8-item-4',
                type: 'sentence',
                text: '[待补充北越短句 19]',
                translation: '待补充：北越点餐短句 2',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-8-item-5',
                type: 'sentence',
                text: '[待补充北越短句 20]',
                translation: '待补充：北越请求短句 3',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
              },
              {
                id: 'north-beginner-lesson-8-item-6',
                type: 'sentence',
                text: '[待补充北越短句 21]',
                translation: '待补充：北越请求短句 4',
                hint: '待补充北越入门提示',
                demoAudio: '/assets/audio/north-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充北越纠音提示' }]
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
          },
          {
            id: 'south-beginner-lesson-3',
            title: '声调与尾音起步',
            summary: '用 an / át / bàn / bát 先熟悉南越更顺的语流和塞音尾收口。',
            items: [
              {
                id: 'south-beginner-lesson-3-item-1',
                type: 'syllable',
                text: 'an',
                translation: '开口音节 an',
                hint: '近似：安',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: 'an', tip: '南越口型更放松，n 收住但别太硬。' }]
              },
              {
                id: 'south-beginner-lesson-3-item-2',
                type: 'syllable',
                text: 'át',
                translation: '带 sắc 调和 t 尾的音节',
                hint: '近似：阿特（短收）',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: 'át', tip: '升感别做得太尖，尾部 t 轻收即可。' }]
              },
              {
                id: 'south-beginner-lesson-3-item-3',
                type: 'word',
                text: 'bàn',
                translation: '桌子',
                hint: '近似：板（仅近似）',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: 'bàn', tip: '南越整体更顺，调值别压得太死。' }]
              },
              {
                id: 'south-beginner-lesson-3-item-4',
                type: 'word',
                text: 'bát',
                translation: '碗',
                hint: '近似：巴特（短收）',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: 'bát', tip: '先把元音拉开，再迅速收 t。' }]
              },
              {
                id: 'south-beginner-lesson-3-item-5',
                type: 'sentence',
                text: 'Đây là bàn.',
                translation: '这是桌子。',
                hint: '近似：得 也 拉 板',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [
                  { text: 'Đây', tip: '起音自然连出，不要太用力。' },
                  { text: 'là', tip: '南越这里更顺滑一些。' },
                  { text: 'bàn', tip: '尾音 n 保留，但不用过分顶舌。' }
                ]
              },
              {
                id: 'south-beginner-lesson-3-item-6',
                type: 'sentence',
                text: 'Đó là bát.',
                translation: '那是碗。',
                hint: '近似：朵 拉 巴特',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [
                  { text: 'Đó', tip: '保持圆润，不要突然压扁。' },
                  { text: 'là', tip: '和前后词连起来说。' },
                  { text: 'bát', tip: 't 尾轻短收住，别放成完整“特”。' }
                ]
              }
            ]
          },
          {
            id: 'south-beginner-lesson-4',
            title: '数字与数量起步',
            summary: '先放入南越零基础镜像骨架，后续补数字、量词与数量表达。',
            items: [
              {
                id: 'south-beginner-lesson-4-item-1',
                type: 'syllable',
                text: '[待补充南越音节 3]',
                translation: '待补充：南越数字音节起步项',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-4-item-2',
                type: 'word',
                text: '[待补充南越单词 3]',
                translation: '待补充：南越数字词项 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-4-item-3',
                type: 'word',
                text: '[待补充南越单词 4]',
                translation: '待补充：南越数量词项 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-4-item-4',
                type: 'sentence',
                text: '[待补充南越短句 3]',
                translation: '待补充：南越数量短句 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-4-item-5',
                type: 'sentence',
                text: '[待补充南越短句 4]',
                translation: '待补充：南越数字短句 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-4-item-6',
                type: 'sentence',
                text: '[待补充南越短句 5]',
                translation: '待补充：南越数字短句 3',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              }
            ]
          },
          {
            id: 'south-beginner-lesson-5',
            title: '称呼与自我介绍起步',
            summary: '先放入南越零基础镜像骨架，后续补称呼、自称和基本介绍句。',
            items: [
              {
                id: 'south-beginner-lesson-5-item-1',
                type: 'word',
                text: '[待补充南越单词 5]',
                translation: '待补充：南越称呼词 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-5-item-2',
                type: 'word',
                text: '[待补充南越单词 6]',
                translation: '待补充：南越自称词 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-5-item-3',
                type: 'sentence',
                text: '[待补充南越短句 6]',
                translation: '待补充：南越自我介绍短句 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-5-item-4',
                type: 'sentence',
                text: '[待补充南越短句 7]',
                translation: '待补充：南越自我介绍短句 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-5-item-5',
                type: 'sentence',
                text: '[待补充南越短句 8]',
                translation: '待补充：南越称呼短句 3',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-5-item-6',
                type: 'sentence',
                text: '[待补充南越短句 9]',
                translation: '待补充：南越问候短句 4',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              }
            ]
          },
          {
            id: 'south-beginner-lesson-6',
            title: '常见问句开口',
            summary: '先放入南越零基础镜像骨架，后续补最常用的提问开口句。',
            items: [
              {
                id: 'south-beginner-lesson-6-item-1',
                type: 'word',
                text: '[待补充南越单词 7]',
                translation: '待补充：南越问句词项 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-6-item-2',
                type: 'word',
                text: '[待补充南越单词 8]',
                translation: '待补充：南越疑问词项 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-6-item-3',
                type: 'sentence',
                text: '[待补充南越短句 10]',
                translation: '待补充：南越问句短句 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-6-item-4',
                type: 'sentence',
                text: '[待补充南越短句 11]',
                translation: '待补充：南越问句短句 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-6-item-5',
                type: 'sentence',
                text: '[待补充南越短句 12]',
                translation: '待补充：南越问句短句 3',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-6-item-6',
                type: 'sentence',
                text: '[待补充南越短句 13]',
                translation: '待补充：南越问句短句 4',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              }
            ]
          },
          {
            id: 'south-beginner-lesson-7',
            title: '购物与价格短句',
            summary: '先放入南越零基础镜像骨架，后续补购物开口和价格表达。',
            items: [
              {
                id: 'south-beginner-lesson-7-item-1',
                type: 'word',
                text: '[待补充南越单词 9]',
                translation: '待补充：南越购物词项 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-7-item-2',
                type: 'word',
                text: '[待补充南越单词 10]',
                translation: '待补充：南越价格词项 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-7-item-3',
                type: 'sentence',
                text: '[待补充南越短句 14]',
                translation: '待补充：南越购物短句 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-7-item-4',
                type: 'sentence',
                text: '[待补充南越短句 15]',
                translation: '待补充：南越购物短句 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-7-item-5',
                type: 'sentence',
                text: '[待补充南越短句 16]',
                translation: '待补充：南越价格短句 3',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-7-item-6',
                type: 'sentence',
                text: '[待补充南越短句 17]',
                translation: '待补充：南越价格短句 4',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              }
            ]
          },
          {
            id: 'south-beginner-lesson-8',
            title: '点餐与礼貌请求',
            summary: '先放入南越零基础镜像骨架，后续补点餐与礼貌请求场景短句。',
            items: [
              {
                id: 'south-beginner-lesson-8-item-1',
                type: 'word',
                text: '[待补充南越单词 11]',
                translation: '待补充：南越点餐词项 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-8-item-2',
                type: 'word',
                text: '[待补充南越单词 12]',
                translation: '待补充：南越请求词项 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-8-item-3',
                type: 'sentence',
                text: '[待补充南越短句 18]',
                translation: '待补充：南越点餐短句 1',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-8-item-4',
                type: 'sentence',
                text: '[待补充南越短句 19]',
                translation: '待补充：南越点餐短句 2',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-8-item-5',
                type: 'sentence',
                text: '[待补充南越短句 20]',
                translation: '待补充：南越请求短句 3',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
              },
              {
                id: 'south-beginner-lesson-8-item-6',
                type: 'sentence',
                text: '[待补充南越短句 21]',
                translation: '待补充：南越请求短句 4',
                hint: '待补充南越入门提示',
                demoAudio: '/assets/audio/south-demo.wav',
                segments: [{ text: '[待补充分段]', tip: '待补充南越纠音提示' }]
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

const extraLanguageDefinitions = {
  thai: {
    name: '泰语',
    description: '从泰语声调、长短元音和礼貌表达开始，适合旅行与日常沟通。',
    previewAudio: '/assets/audio/thai-demo.wav',
    trial: {
      text: 'กาแฟเย็นอร่อยมาก',
      translation: '冰咖啡很好喝',
      hint: '先把 กาแฟ 两个音节读稳，再让 อร่อยมาก 自然收尾。',
      segments: [
        { text: 'กาแฟ', tip: 'กา 的长元音要打开，แฟ 不要读得太短。' },
        { text: 'เย็น', tip: 'เย็น 的收尾鼻音要轻轻收住。' },
        { text: 'อร่อยมาก', tip: '注意重音放松，มาก 不要拖得太长。' }
      ]
    },
    beginner: [
      { type: 'syllable', text: 'กา', translation: '长元音音节', hint: '口型打开，声音拉稳。', segments: [{ text: 'กา', tip: '长元音保持平稳，不要读成短促的“嘎”。' }] },
      { type: 'word', text: 'กาแฟ', translation: '咖啡', hint: '两个音节连起来更自然。', segments: [{ text: 'กา', tip: '第一个音节保持清楚。' }, { text: 'แฟ', tip: 'แฟ 的元音不要压扁。' }] },
      { type: 'sentence', text: 'กาแฟเย็นอร่อยมาก', translation: '冰咖啡很好喝', hint: '像点单后夸一句，语气轻松。', segments: [{ text: 'กาแฟ', tip: '先读稳咖啡。' }, { text: 'เย็น', tip: '鼻音轻收。' }, { text: 'อร่อยมาก', tip: '结尾自然，不要拖长。' }] }
    ],
    elementary: [
      { type: 'word', text: 'ขอบคุณ', translation: '谢谢', hint: '礼貌表达要读得轻松。', segments: [{ text: 'ขอบ', tip: '开头送气轻一点。' }, { text: 'คุณ', tip: '尾部鼻音收住。' }] },
      { type: 'sentence', text: 'ฉันอยากกินข้าว', translation: '我想吃饭', hint: '日常句子要注意节奏。', segments: [{ text: 'ฉันอยาก', tip: '前半句不要断得太开。' }, { text: 'กินข้าว', tip: 'ข้าว 的声调要扬起来。' }] }
    ],
    intermediate: [
      { type: 'sentence', text: 'วันนี้อากาศดีมาก เราไปเดินเล่นกันไหม', translation: '今天天气很好，我们去散步好吗', hint: '长句先分两段，再连成自然语流。', segments: [{ text: 'วันนี้อากาศดีมาก', tip: '前半句保持平稳。' }, { text: 'เราไปเดินเล่นกันไหม', tip: '疑问语气轻轻抬起。' }] }
    ]
  },
  malay: {
    name: '马来语',
    description: '从清晰音节、重音和高频生活短句开始，适合马来西亚场景。',
    previewAudio: '/assets/audio/malay-demo.wav',
    trial: {
      text: 'Kopi ais ini memang sedap',
      translation: '这杯冰咖啡真的好喝',
      hint: '保持马来语音节清楚，kopi ais 不要连糊。',
      segments: [
        { text: 'Kopi ais', tip: 'kopi 和 ais 之间留一点轻停顿。' },
        { text: 'ini memang', tip: 'ini 轻读，memang 的重音更稳。' },
        { text: 'sedap', tip: '结尾 p 只收口，不要加出多余尾音。' }
      ]
    },
    beginner: [
      { type: 'syllable', text: 'ko', translation: '开口音节', hint: '元音清楚，别压扁。', segments: [{ text: 'ko', tip: 'o 的口型保持圆一点。' }] },
      { type: 'word', text: 'kopi', translation: '咖啡', hint: '两个音节读清楚。', segments: [{ text: 'ko', tip: '开头稳定。' }, { text: 'pi', tip: '结尾轻快。' }] },
      { type: 'sentence', text: 'Kopi ais ini sedap', translation: '这杯冰咖啡好喝', hint: '像自然夸一句。', segments: [{ text: 'Kopi ais', tip: '词间不要粘住。' }, { text: 'ini sedap', tip: 'sedap 的 p 轻收。' }] }
    ],
    elementary: [
      { type: 'word', text: 'terima kasih', translation: '谢谢', hint: '常用礼貌表达。', segments: [{ text: 'terima', tip: '三段音节保持均匀。' }, { text: 'kasih', tip: 'h 轻轻带出，不要太重。' }] },
      { type: 'sentence', text: 'Saya mahu makan nasi', translation: '我想吃饭', hint: '保持每个词清楚。', segments: [{ text: 'Saya mahu', tip: 'mahu 不要读得太急。' }, { text: 'makan nasi', tip: 'nasi 的元音保持明亮。' }] }
    ],
    intermediate: [
      { type: 'sentence', text: 'Cuaca hari ini baik, kita pergi berjalan sekejap', translation: '今天天气不错，我们去走一会儿', hint: '长句注意停顿。', segments: [{ text: 'Cuaca hari ini baik', tip: '前半句轻轻收住。' }, { text: 'kita pergi berjalan sekejap', tip: 'berjalan 保持节奏均匀。' }] }
    ]
  },
  indo: {
    name: '印尼语',
    description: '从清晰音节、常用问候和生活短句开始，适合印尼旅行、商务和日常沟通场景。',
    previewAudio: '/assets/audio/indo-demo.wav',
    trial: {
      text: 'Es kopi ini enak sekali',
      translation: '这杯冰咖啡很好喝',
      hint: '保持印尼语音节清楚，enak sekali 要自然连起来，不要逐字用力。',
      segments: [
        { text: 'Es kopi', tip: 'es 轻轻收住，kopi 两个音节读清楚。' },
        { text: 'ini enak', tip: 'ini 轻读，enak 的 e 不要压得太扁。' },
        { text: 'sekali', tip: 'sekali 三个音节均匀，结尾自然放松。' }
      ]
    },
    beginner: [
      { type: 'syllable', text: 'ko', translation: '开口音节', hint: '口型放松，元音保持明亮。', segments: [{ text: 'ko', tip: 'o 的口型保持圆一点，不要压成普通话的“颗”。' }] },
      { type: 'word', text: 'kopi', translation: '咖啡', hint: '两个音节读清楚，重音不要太硬。', segments: [{ text: 'ko', tip: '开头稳定。' }, { text: 'pi', tip: '结尾轻快，不要拖长。' }] },
      { type: 'sentence', text: 'Es kopi ini enak', translation: '这杯冰咖啡好喝', hint: '像自然评价一句，语气轻松。', segments: [{ text: 'Es kopi', tip: '词间不要粘住。' }, { text: 'ini enak', tip: 'enak 的 k 轻收。' }] }
    ],
    elementary: [
      { type: 'word', text: 'terima kasih', translation: '谢谢', hint: '礼貌表达要读得轻松自然。', segments: [{ text: 'terima', tip: '三个音节保持均匀。' }, { text: 'kasih', tip: 'h 轻轻带出，不要太重。' }] },
      { type: 'sentence', text: 'Saya mau makan nasi', translation: '我想吃饭', hint: '日常句子保持每个词清楚。', segments: [{ text: 'Saya mau', tip: 'mau 不要读得太急。' }, { text: 'makan nasi', tip: 'nasi 的元音保持明亮。' }] }
    ],
    intermediate: [
      { type: 'sentence', text: 'Cuaca hari ini bagus, kita jalan sebentar', translation: '今天天气很好，我们走一会儿吧', hint: '长句先分两段，再连成自然语流。', segments: [{ text: 'Cuaca hari ini bagus', tip: '前半句保持平稳。' }, { text: 'kita jalan sebentar', tip: 'jalan sebentar 节奏均匀，不要逐字顿开。' }] }
    ]
  },
  tagalog: {
    name: '菲律宾语',
    description: '围绕 Tagalog 高频问候、重音和自然语流，适合菲律宾生活交流。',
    previewAudio: '/assets/audio/tagalog-demo.wav',
    trial: {
      text: 'Masarap ang malamig na kape',
      translation: '冰咖啡很好喝',
      hint: '注意 masarap 的重音和 kape 的轻快收尾。',
      segments: [
        { text: 'Masarap ang', tip: 'masarap 不要读得太平，ang 轻轻带过。' },
        { text: 'malamig na', tip: 'malamig 音节均匀，na 轻读。' },
        { text: 'kape', tip: 'kape 两个音节清楚，结尾不要拖。' }
      ]
    },
    beginner: [
      { type: 'syllable', text: 'ma', translation: '开口音节', hint: '先把元音读开。', segments: [{ text: 'ma', tip: 'a 的口型打开，声音不要挤。' }] },
      { type: 'word', text: 'kape', translation: '咖啡', hint: '两个音节轻快。', segments: [{ text: 'ka', tip: '开头清楚。' }, { text: 'pe', tip: '结尾轻快收住。' }] },
      { type: 'sentence', text: 'Masarap ang kape', translation: '咖啡很好喝', hint: '重音自然，不要逐字硬读。', segments: [{ text: 'Masarap ang', tip: '前半句连起来。' }, { text: 'kape', tip: 'kape 不要拖尾。' }] }
    ],
    elementary: [
      { type: 'word', text: 'salamat', translation: '谢谢', hint: '高频礼貌表达。', segments: [{ text: 'sa', tip: '起音轻。' }, { text: 'lamat', tip: '末尾 t 轻收。' }] },
      { type: 'sentence', text: 'Gusto kong kumain', translation: '我想吃东西', hint: '注意 kong 的鼻音。', segments: [{ text: 'Gusto kong', tip: 'kong 鼻音收住。' }, { text: 'kumain', tip: '三个音节读均匀。' }] }
    ],
    intermediate: [
      { type: 'sentence', text: 'Maganda ang panahon ngayon, lakad tayo mamaya', translation: '今天天气很好，晚点我们散步吧', hint: '长句分段练，再连起来。', segments: [{ text: 'Maganda ang panahon ngayon', tip: '前半句语气自然。' }, { text: 'lakad tayo mamaya', tip: 'tayo mamaya 不要读散。' }] }
    ]
  },
  hindi: {
    name: '印地语',
    description: '从天城文常用音节、问候和生活短句开始，适合印度电商、旅行和日常沟通场景。',
    previewAudio: '/assets/audio/hindi-demo.wav',
    trial: {
      text: 'यह चाय बहुत अच्छी है',
      translation: '这杯茶很好喝',
      hint: '先把 बहुत 的送气和 अच्छी 的卷舌感读清楚，再让整句自然连起来。',
      segments: [
        { text: 'यह चाय', tip: 'यह 轻读，चाय 的元音要打开。' },
        { text: 'बहुत अच्छी', tip: 'बहुत 的 h 轻轻带出，अच्छी 不要读得太硬。' },
        { text: 'है', tip: '句尾 nhẹ 收，不要拖得太长。' }
      ]
    },
    beginner: [
      { type: 'syllable', text: 'चा', translation: '茶的核心音节', hint: '元音打开，声母不要挤。', segments: [{ text: 'चा', tip: 'चा 的 a 要饱满，不要压成很短的“恰”。' }] },
      { type: 'word', text: 'चाय', translation: '茶', hint: '尾部轻轻收住。', segments: [{ text: 'चा', tip: '开头清楚。' }, { text: 'य', tip: '尾部 y 轻带，不要拖长。' }] },
      { type: 'sentence', text: 'यह चाय अच्छी है', translation: '这杯茶好喝', hint: '像自然评价一句，保持轻松。', segments: [{ text: 'यह चाय', tip: '前两个词不要粘太紧。' }, { text: 'अच्छी है', tip: 'अच्छी 的 chh 保持清楚。' }] }
    ],
    elementary: [
      { type: 'word', text: 'धन्यवाद', translation: '谢谢', hint: '礼貌表达要读得稳定。', segments: [{ text: 'धन्य', tip: 'ध 的送气轻一些，别喷太重。' }, { text: 'वाद', tip: 'वाद 收尾干净。' }] },
      { type: 'sentence', text: 'मुझे खाना खाना है', translation: '我想吃饭', hint: '重复 खाना 时节奏要清楚。', segments: [{ text: 'मुझे खाना', tip: 'मुझे 轻读，khana 第一个音节清楚。' }, { text: 'खाना है', tip: '第二个 खाना 不要含混。' }] }
    ],
    intermediate: [
      { type: 'sentence', text: 'आज मौसम अच्छा है, हम थोड़ी देर चलें', translation: '今天天气不错，我们走一会儿吧', hint: '长句先分两段，再连成自然语流。', segments: [{ text: 'आज मौसम अच्छा है', tip: '前半句保持平稳。' }, { text: 'हम थोड़ी देर चलें', tip: 'थोड़ी 的送气和卷舌要清楚。' }] }
    ]
  },
  tamil: {
    name: '泰米尔语',
    description: '从泰米尔语核心元音、卷舌音和高频表达开始，适合南印度生活与商务沟通。',
    previewAudio: '/assets/audio/tamil-demo.wav',
    trial: {
      text: 'இந்த காபி மிகவும் நல்லது',
      translation: '这杯咖啡很好喝',
      hint: '先把 காபி 的长元音读稳，再让 மிகவும் நல்லது 自然收尾。',
      segments: [
        { text: 'இந்த காபி', tip: 'இந்த 轻读，காபி 的 aa 要拉开一点。' },
        { text: 'மிகவும்', tip: '三个音节保持均匀，不要吞掉中间音。' },
        { text: 'நல்லது', tip: 'ல்ல 的连读要稳，句尾自然放松。' }
      ]
    },
    beginner: [
      { type: 'syllable', text: 'கா', translation: '长元音音节', hint: '长元音打开，声音保持平稳。', segments: [{ text: 'கா', tip: 'aa 拉开一点，不要读成很短的 ka。' }] },
      { type: 'word', text: 'காபி', translation: '咖啡', hint: '两个音节清楚，尾部轻收。', segments: [{ text: 'கா', tip: '长元音稳定。' }, { text: 'பி', tip: 'pi 轻快收住。' }] },
      { type: 'sentence', text: 'இந்த காபி நல்லது', translation: '这杯咖啡好喝', hint: '保持词间自然停顿。', segments: [{ text: 'இந்த காபி', tip: '前半句不要读散。' }, { text: 'நல்லது', tip: 'lla 连读清楚。' }] }
    ],
    elementary: [
      { type: 'word', text: 'நன்றி', translation: '谢谢', hint: '常用礼貌表达，收尾要轻。', segments: [{ text: 'நன்', tip: 'n 音收住。' }, { text: 'றி', tip: 'றி 不要拖长。' }] },
      { type: 'sentence', text: 'நான் சாப்பாடு சாப்பிட விரும்புகிறேன்', translation: '我想吃饭', hint: '长一点的日常表达，先分段再连读。', segments: [{ text: 'நான் சாப்பாடு', tip: 'சாப்பாடு 的长音保持稳定。' }, { text: 'சாப்பிட விரும்புகிறேன்', tip: '后半句保持节奏，不要越读越快。' }] }
    ],
    intermediate: [
      { type: 'sentence', text: 'இன்று வானிலை நல்லது, நாம் கொஞ்சம் நடப்போம்', translation: '今天天气很好，我们走一会儿吧', hint: '长句注意停顿和自然语气。', segments: [{ text: 'இன்று வானிலை நல்லது', tip: '前半句平稳收住。' }, { text: 'நாம் கொஞ்சம் நடப்போம்', tip: 'கொஞ்சம் 不要读得太急。' }] }
    ]
  }
};

function buildExtraLanguageCatalog(id, definition) {
  const demoAudio = definition.previewAudio;
  const makeItem = (levelId, item, index) => ({
    id: `${id}-${levelId}-${index + 1}`,
    type: item.type,
    text: item.text,
    translation: item.translation,
    hint: item.hint,
    demoAudio,
    segments: item.segments
  });
  return {
    id,
    name: definition.name,
    description: definition.description,
    previewAudio: demoAudio,
    levels: [
      {
        id: 'beginner',
        name: '零基础',
        lessons: [{
          id: `${id}-beginner-lesson-1`,
          title: '生活发音入门',
          summary: '先练核心音节、常用词和一条有场景感的短句。',
          items: definition.beginner.map((item, index) => makeItem('beginner', item, index))
        }]
      },
      {
        id: 'elementary',
        name: '初级',
        lessons: [{
          id: `${id}-elementary-lesson-1`,
          title: '礼貌表达与日常短句',
          summary: '用高频表达训练稳定节奏和自然语流。',
          items: definition.elementary.map((item, index) => makeItem('elementary', item, index))
        }]
      },
      {
        id: 'intermediate',
        name: '中等',
        lessons: [{
          id: `${id}-intermediate-lesson-1`,
          title: '场景长句跟读',
          summary: '把短句连成长句，练停顿、重音和自然度。',
          items: definition.intermediate.map((item, index) => makeItem('intermediate', item, index))
        }]
      }
    ]
  };
}

Object.entries(extraLanguageDefinitions).forEach(([id, definition]) => {
  catalog[id] = buildExtraLanguageCatalog(id, definition);
  trialItems[id] = {
    id: `${id}-trial-1`,
    lessonId: `${id}-beginner-lesson-1`,
    levelId: 'beginner',
    type: 'sentence',
    text: definition.trial.text,
    translation: definition.trial.translation,
    hint: definition.trial.hint,
    demoAudio: definition.previewAudio,
    segments: definition.trial.segments
  };
});

function loadExpandedCurriculumForBackend() {
  if (typeof wx !== 'undefined') return null;
  try {
    const moduleName = './expanded-curriculum';
    return module.require(moduleName);
  } catch (error) {
    return null;
  }
}

const expandedCurriculum = loadExpandedCurriculumForBackend();
if (expandedCurriculum) {
  Object.assign(catalog, expandedCurriculum.catalog);
  Object.assign(trialItems, expandedCurriculum.trialItems);
}

const redeemCodes = ['VIET-2026-OPEN', 'VIET-2026-PLUS', 'VIET-2026-TRIAL'];

module.exports = {
  catalog,
  levels,
  trialItems,
  redeemCodes
};
