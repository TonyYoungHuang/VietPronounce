const DIALECTS = ['north', 'south', 'thai', 'malay', 'indo', 'tagalog', 'hindi', 'tamil'];
const VIETNAMESE_DIALECTS = ['north', 'south'];
const LANGUAGE_META = {
  north: {
    id: 'north',
    name: '北越',
    englishName: 'Vietnamese (North)',
    shortName: '越南语',
    locale: 'vi-VN',
    previewAudio: '/assets/audio/north-demo.wav',
    description: '河内标准音路线，声调区分清晰，适合作为越南语发音入门体系。'
  },
  south: {
    id: 'south',
    name: '南越',
    englishName: 'Vietnamese (South)',
    shortName: '越南语',
    locale: 'vi-VN',
    previewAudio: '/assets/audio/south-demo.wav',
    description: '西贡语流路线，口感更松弛，适合生活交流和商务沟通。'
  },
  thai: {
    id: 'thai',
    name: '泰语',
    englishName: 'Thai',
    shortName: '泰语',
    locale: 'th-TH',
    previewAudio: '/assets/audio/thai-demo.wav',
    description: '从常用元音、声调和礼貌表达开始，适合泰国旅行与日常沟通。'
  },
  malay: {
    id: 'malay',
    name: '马来语',
    englishName: 'Bahasa Melayu',
    shortName: '马来语',
    locale: 'ms-MY',
    previewAudio: '/assets/audio/malay-demo.wav',
    description: '先练清晰音节、重音和高频生活短句，适合马来西亚场景。'
  },
  indo: {
    id: 'indo',
    name: '印尼语',
    englishName: 'Bahasa Indonesia',
    shortName: '印尼语',
    locale: 'id-ID',
    previewAudio: '/assets/audio/indo-demo.wav',
    description: '从清晰音节、常用问候和生活短句开始，适合印尼旅行、商务和日常沟通场景。'
  },
  tagalog: {
    id: 'tagalog',
    name: '菲律宾语',
    englishName: 'Filipino / Tagalog',
    shortName: '菲律宾语',
    locale: 'fil-PH',
    previewAudio: '/assets/audio/tagalog-demo.wav',
    description: '围绕 Tagalog 高频问候、重音和自然语流，适合菲律宾生活交流。'
  },
  hindi: {
    id: 'hindi',
    name: '印地语',
    englishName: 'Hindi',
    shortName: '印地语',
    locale: 'hi-IN',
    previewAudio: '/assets/audio/hindi-demo.wav',
    description: '从天城文常用音节、问候和生活短句开始，适合印度电商、旅行和日常沟通场景。'
  },
  tamil: {
    id: 'tamil',
    name: '泰米尔语',
    englishName: 'Tamil',
    shortName: '泰米尔语',
    locale: 'ta-IN',
    previewAudio: '/assets/audio/tamil-demo.wav',
    description: '从泰米尔语核心元音、卷舌音和高频表达开始，适合南印度生活与商务沟通。'
  }
};
const LEVEL_ORDER = ['beginner', 'elementary', 'intermediate'];
const CONTENT_FIELDS = ['id', 'type', 'text', 'translation', 'hint', 'demoAudio', 'segments'];
const CONTENT_TYPES = ['syllable', 'word', 'sentence'];

const LEVEL_CONTENT_POLICY = {
  beginner: {
    id: 'beginner',
    name: '零基础',
    focus: '音节 / 单词 / 极短句',
    allowedTypes: ['syllable', 'word', 'sentence'],
    requiredTypeCoverage: ['syllable', 'word', 'sentence'],
    ratioGuide: {
      syllable: '35%~45%',
      word: '35%~45%',
      sentence: '10%~30%'
    }
  },
  elementary: {
    id: 'elementary',
    name: '初级',
    focus: '高频短句 / 固定表达',
    allowedTypes: ['word', 'sentence'],
    requiredTypeCoverage: ['sentence'],
    ratioGuide: {
      word: '20%~40%',
      sentence: '60%~80%'
    }
  },
  intermediate: {
    id: 'intermediate',
    name: '中等',
    focus: '场景句 / 连续表达',
    allowedTypes: ['sentence'],
    requiredTypeCoverage: ['sentence'],
    ratioGuide: {
      sentence: '100%'
    }
  }
};

const MIRROR_RULES = {
  levelOrder: '北越与南越必须保持相同的等级顺序',
  lessonCount: '同一等级下的课时数量必须一致',
  lessonSkeleton: '镜像课时的 lesson id 去掉 north/south 前缀后必须一致',
  itemCount: '镜像课时的 item 数量必须一致',
  itemTypeSequence: '镜像课时的 item type 序列必须一致',
  itemSkeleton: '镜像 item 的 id 去掉 north/south 前缀后必须一致'
};

function normalizeDialect(dialect) {
  return DIALECTS.includes(dialect) ? dialect : 'north';
}

function getLanguageMeta(dialect) {
  return LANGUAGE_META[normalizeDialect(dialect)] || LANGUAGE_META.north;
}

function getDemoAudioByDialect(dialect) {
  return getLanguageMeta(dialect).previewAudio;
}

function stripDialectPrefix(value) {
  return String(value || '').replace(/^(north|south|thai|malay|indo|tagalog|hindi|tamil)-/, '');
}

function createItemTemplate(options = {}) {
  const dialect = normalizeDialect(options.dialect);
  const levelId = options.levelId || 'beginner';
  const lessonKey = options.lessonKey || `${levelId}-lesson-1`;
  const itemIndex = options.itemIndex || 1;
  const type = CONTENT_TYPES.includes(options.type) ? options.type : 'syllable';

  return {
    id: `${dialect}-${lessonKey}-item-${itemIndex}`,
    type,
    text: options.text || '[待补充越南语文本]',
    translation: options.translation || '待补充中文释义',
    hint: options.hint || '待补充入门提示',
    demoAudio: getDemoAudioByDialect(dialect),
    segments: [
      {
        text: options.segmentText || '[待补充分段]',
        tip: options.segmentTip || '待补充纠音提示'
      }
    ]
  };
}

function createLessonTemplate(options = {}) {
  const dialect = normalizeDialect(options.dialect);
  const levelId = options.levelId || 'beginner';
  const lessonKey = options.lessonKey || `${levelId}-lesson-1`;
  const typeSequence = Array.isArray(options.typeSequence) && options.typeSequence.length
    ? options.typeSequence
    : LEVEL_CONTENT_POLICY[levelId].allowedTypes;

  return {
    id: `${dialect}-${lessonKey}`,
    title: options.title || '待补充标题',
    summary: options.summary || '待补充摘要',
    items: typeSequence.map((type, index) => createItemTemplate({
      dialect,
      levelId,
      lessonKey,
      itemIndex: index + 1,
      type
    }))
  };
}

function createMirroredLessonPair(options = {}) {
  const levelId = options.levelId || 'beginner';
  const lessonKey = options.lessonKey || `${levelId}-lesson-1`;
  const typeSequence = options.typeSequence || LEVEL_CONTENT_POLICY[levelId].allowedTypes;

  return {
    north: createLessonTemplate({
      dialect: 'north',
      levelId,
      lessonKey,
      title: options.northTitle || '北越待补充标题',
      summary: options.northSummary || '北越待补充摘要',
      typeSequence
    }),
    south: createLessonTemplate({
      dialect: 'south',
      levelId,
      lessonKey,
      title: options.southTitle || '南越待补充标题',
      summary: options.southSummary || '南越待补充摘要',
      typeSequence
    })
  };
}

module.exports = {
  DIALECTS,
  VIETNAMESE_DIALECTS,
  LANGUAGE_META,
  LEVEL_ORDER,
  CONTENT_FIELDS,
  CONTENT_TYPES,
  LEVEL_CONTENT_POLICY,
  MIRROR_RULES,
  normalizeDialect,
  getLanguageMeta,
  stripDialectPrefix,
  getDemoAudioByDialect,
  createItemTemplate,
  createLessonTemplate,
  createMirroredLessonPair
};
