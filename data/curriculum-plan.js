const { DIALECTS, getLanguageMeta } = require('./content-standard');

const TARGET_ITEMS_PER_DIALECT = 180;
const TARGET_LESSONS_PER_DIALECT = 12;
const TARGET_ITEMS_PER_LESSON = 15;

const COMMON_LESSON_BLUEPRINT = [
  {
    id: 'pronunciation-lesson-01',
    levelId: 'beginner',
    title: '基础元音与口型',
    targetItems: 15,
    contentMix: { syllable: 6, word: 6, sentence: 3 },
    trainingGoal: '先建立稳定口型，避免把目标语元音读成中文或英语近似音。'
  },
  {
    id: 'pronunciation-lesson-02',
    levelId: 'beginner',
    title: '核心辅音入口',
    targetItems: 15,
    contentMix: { syllable: 5, word: 7, sentence: 3 },
    trainingGoal: '训练最常见声母和起音方式，让用户听得出、读得稳。'
  },
  {
    id: 'pronunciation-lesson-03',
    levelId: 'beginner',
    title: '难点辅音对比',
    targetItems: 15,
    contentMix: { syllable: 5, word: 7, sentence: 3 },
    trainingGoal: '集中练容易混淆的辅音对，建立最小对立感。'
  },
  {
    id: 'pronunciation-lesson-04',
    levelId: 'beginner',
    title: '尾音与收口',
    targetItems: 15,
    contentMix: { syllable: 4, word: 8, sentence: 3 },
    trainingGoal: '纠正尾音拖长、漏读、送气或过度释放的问题。'
  },
  {
    id: 'pronunciation-lesson-05',
    levelId: 'beginner',
    title: '声调 / 重音 / 节奏',
    targetItems: 15,
    contentMix: { syllable: 4, word: 5, sentence: 6 },
    trainingGoal: '把单音节读准升级为自然的词重音、声调或音节节奏。'
  },
  {
    id: 'pronunciation-lesson-06',
    levelId: 'elementary',
    title: '最小对立组',
    targetItems: 15,
    contentMix: { word: 10, sentence: 5 },
    trainingGoal: '用一组组相近词训练辨音和发音边界。'
  },
  {
    id: 'pronunciation-lesson-07',
    levelId: 'elementary',
    title: '问候与礼貌表达',
    targetItems: 15,
    contentMix: { word: 4, sentence: 11 },
    trainingGoal: '覆盖开口就会用的问候、感谢、道歉、确认。'
  },
  {
    id: 'pronunciation-lesson-08',
    levelId: 'elementary',
    title: '购物、点餐与出行',
    targetItems: 15,
    contentMix: { word: 3, sentence: 12 },
    trainingGoal: '用高频生活场景训练短句节奏和关键词清晰度。'
  },
  {
    id: 'pronunciation-lesson-09',
    levelId: 'elementary',
    title: '工作、电商与客服',
    targetItems: 15,
    contentMix: { word: 3, sentence: 12 },
    trainingGoal: '面向真实售卖场景，练商品、订单、物流、价格和售后表达。'
  },
  {
    id: 'pronunciation-lesson-10',
    levelId: 'intermediate',
    title: '情绪、态度与自然语气',
    targetItems: 15,
    contentMix: { sentence: 15 },
    trainingGoal: '训练更自然的语气，不只读对字，还要读得像真实交流。'
  },
  {
    id: 'pronunciation-lesson-11',
    levelId: 'intermediate',
    title: '长句分段跟读',
    targetItems: 15,
    contentMix: { sentence: 15 },
    trainingGoal: '用分段、高亮和复读训练长句断句、气口和节奏。'
  },
  {
    id: 'pronunciation-lesson-12',
    levelId: 'intermediate',
    title: '综合复练与易错混合',
    targetItems: 15,
    contentMix: { sentence: 15 },
    trainingGoal: '混合复练前 11 课难点，形成结课检测和薄弱项入口。'
  }
];

const LANGUAGE_CURRICULUM = {
  north: {
    id: 'north',
    title: '北越发音训练包',
    marketPosition: '越南北部标准音入门与纠音，适合河内标准音、商务和系统学习。',
    pronunciationCore: [
      '六个声调的走势、起点、终点和稳定度',
      '单元音、复合元音和开口度',
      '鼻音尾音 -m / -n / -ng / -nh',
      '塞音尾音 -p / -t / -c / -ch 的短促收口',
      '北越声母 d / gi / r、tr / ch、s / x 的标准差异',
      '单音节语言的音节边界和短句节奏'
    ],
    difficultPoints: [
      '问声和跌声容易被读平或混在一起',
      '尾音 -t / -c 容易读出明显送气',
      '复合元音容易被简化成单元音',
      '中文母语者容易把每个音节读得一样重',
      '北越声母细分比南越更严格，需要单独训练'
    ],
    scoringDimensions: ['toneContour', 'vowelShape', 'finalClosure', 'initialContrast', 'syllableRhythm'],
    lessonFocus: {
      'pronunciation-lesson-01': ['a / ă / â', 'e / ê', 'o / ô / ơ', 'u / ư'],
      'pronunciation-lesson-02': ['b / m / ph', 'đ / t / th', 'n / l'],
      'pronunciation-lesson-03': ['d / gi / r', 'tr / ch', 's / x'],
      'pronunciation-lesson-04': ['-m / -n / -ng / -nh', '-p / -t / -c / -ch'],
      'pronunciation-lesson-05': ['ngang', 'huyền', 'sắc', 'hỏi', 'ngã', 'nặng'],
      'pronunciation-lesson-06': ['tone minimal pairs', 'vowel minimal pairs', 'final minimal pairs']
    }
  },
  south: {
    id: 'south',
    title: '南越发音训练包',
    marketPosition: '越南南部日常交流音，适合胡志明市生活、电商、客服和口语沟通。',
    pronunciationCore: [
      '南越实际口语中的声调合并和更平顺的调型',
      '更开放、更松弛的元音口型',
      '南越尾音弱化和未完全释放的收口方式',
      'v / d / gi、tr / ch、s / x 等南越常见合流',
      '南越语流中的自然连贯感',
      '和北越标准音的同句对照'
    ],
    difficultPoints: [
      '南越不是随意读平，调型仍要稳定',
      '尾音不能完全丢掉，只是更轻更短',
      '学习者容易把北越规则套进南越口语',
      '元音开口过大时会影响词义辨识',
      '快速短句里容易漏掉功能词'
    ],
    scoringDimensions: ['southernToneFlow', 'vowelOpenness', 'softFinals', 'regionalInitials', 'phraseFlow'],
    lessonFocus: {
      'pronunciation-lesson-01': ['open vowels', 'southern vowel glide', 'a / ă / â'],
      'pronunciation-lesson-02': ['b / m / ph', 'đ / t / th', 'n / l'],
      'pronunciation-lesson-03': ['v / d / gi', 'tr / ch', 's / x'],
      'pronunciation-lesson-04': ['soft -n / -ng', 'soft -t / -c', 'unreleased stops'],
      'pronunciation-lesson-05': ['southern tone mergers', 'hỏi / ngã handling', 'sentence melody'],
      'pronunciation-lesson-06': ['north-south paired items', 'final contrast', 'tone contrast']
    }
  },
  thai: {
    id: 'thai',
    title: '泰语发音训练包',
    marketPosition: '泰国旅行、生活和销售场景的实用发音训练，重点解决声调和长短音。',
    pronunciationCore: [
      '五个声调：中、低、降、高、升',
      '长短元音对比和元音长度稳定度',
      '不送气 / 送气塞音对比，如 p / ph、t / th、k / kh',
      '词尾 -p / -t / -k 的短促闭塞',
      '活音节 / 死音节对声调的影响',
      '常见辅音连缀和弱化读法'
    ],
    difficultPoints: [
      '声调方向对词义影响很大，不能只靠音高高低',
      '长短元音会区别词义，中文母语者容易忽略时长',
      '送气音容易读得不够明显或过度夸张',
      '词尾塞音不能读出英语式爆破',
      '泰语短句需要更平稳的音节节奏'
    ],
    scoringDimensions: ['toneContour', 'vowelLength', 'aspiration', 'finalStop', 'syllableTiming'],
    lessonFocus: {
      'pronunciation-lesson-01': ['short vowels', 'long vowels', 'vowel length pairs'],
      'pronunciation-lesson-02': ['p / ph', 't / th', 'k / kh'],
      'pronunciation-lesson-03': ['r / l', 'ng initial', 'ch / j'],
      'pronunciation-lesson-04': ['-p', '-t', '-k', 'nasal finals'],
      'pronunciation-lesson-05': ['mid tone', 'low tone', 'falling tone', 'high tone', 'rising tone'],
      'pronunciation-lesson-06': ['tone minimal pairs', 'long-short pairs', 'aspiration pairs']
    }
  },
  malay: {
    id: 'malay',
    title: '马来语发音训练包',
    marketPosition: '马来西亚生活、客服和电商场景发音，重点做清晰、稳定、自然。',
    pronunciationCore: [
      'a / i / u / e / o 的稳定读法',
      'e taling 和 e pepet 的区别',
      '清晰不卷舌的 r 和自然 l',
      '词尾 -k、-h、-ng 的收口',
      '双元音 ai / au / oi',
      '马来语轻重音和句子语调'
    ],
    difficultPoints: [
      'e 的两种读法容易混',
      '词尾 -k 常带喉塞感，不能读成完整爆破',
      '英语习惯会让元音漂移',
      'r 不能读成中文儿化音',
      '句子语调要自然，不能逐字硬读'
    ],
    scoringDimensions: ['vowelStability', 'schwaControl', 'finalClosure', 'rSound', 'phraseIntonation'],
    lessonFocus: {
      'pronunciation-lesson-01': ['a / i / u / e / o', 'e pepet', 'e taling'],
      'pronunciation-lesson-02': ['b / p', 'd / t', 'g / k'],
      'pronunciation-lesson-03': ['r / l', 'ny / ng', 'sy'],
      'pronunciation-lesson-04': ['-k', '-h', '-ng', '-n'],
      'pronunciation-lesson-05': ['word stress', 'question intonation', 'polite phrase rhythm'],
      'pronunciation-lesson-06': ['e minimal pairs', 'final pairs', 'r-l pairs']
    }
  },
  indo: {
    id: 'indo',
    title: '印尼语发音训练包',
    marketPosition: '印尼生活、跨境电商和客服沟通发音，重点是元音清晰和短句自然。',
    pronunciationCore: [
      '五个主要元音和 e / ə 的区分',
      'c / j / ny / ng 等印尼语常见辅音',
      '词尾 -k 的喉塞式收口',
      '鼻音 ng 在词首、词中和词尾的位置',
      '轻重音和句子自然语调',
      '高频生活、电商、订单表达'
    ],
    difficultPoints: [
      'e 和 schwa 容易混读',
      'ng 词首对中文母语者较难',
      'c 不能读成英语 k 或 s',
      '词尾 -k 不能爆破',
      '印尼语要避免英语化重音'
    ],
    scoringDimensions: ['vowelClarity', 'schwaControl', 'nasalPlacement', 'finalGlottalStop', 'phraseRhythm'],
    lessonFocus: {
      'pronunciation-lesson-01': ['a / i / u / e / o', 'schwa', 'diphthongs'],
      'pronunciation-lesson-02': ['c', 'j', 'ny', 'ng'],
      'pronunciation-lesson-03': ['r / l', 'sy', 'kh'],
      'pronunciation-lesson-04': ['-k glottal', '-ng', '-n', '-h'],
      'pronunciation-lesson-05': ['penultimate stress', 'question intonation', 'polite tone'],
      'pronunciation-lesson-06': ['e minimal pairs', 'ng pairs', 'final -k pairs']
    }
  },
  tagalog: {
    id: 'tagalog',
    title: '菲律宾语 / Tagalog 发音训练包',
    marketPosition: '菲律宾生活、客服和社交场景发音，重点是重音、喉塞音和音节节奏。',
    pronunciationCore: [
      'a / e / i / o / u 的稳定元音',
      '重音位置和元音延长',
      '词尾和元音前的喉塞音',
      'ng 作为独立鼻音的读法',
      '不送气的 p / t / k',
      '音节计时节奏和自然短句'
    ],
    difficultPoints: [
      '重音位置会区别词义',
      '喉塞音不明显时容易变成另一个词',
      'ng 不能读成 n + g',
      '英语习惯会造成元音弱化',
      'p / t / k 不能读成英语强送气'
    ],
    scoringDimensions: ['stressPlacement', 'glottalStop', 'vowelStability', 'ngSound', 'syllableTiming'],
    lessonFocus: {
      'pronunciation-lesson-01': ['stable vowels', 'no vowel reduction', 'vowel length'],
      'pronunciation-lesson-02': ['p / t / k', 'b / d / g', 'm / n / ng'],
      'pronunciation-lesson-03': ['ng', 'r / l', 'y / w'],
      'pronunciation-lesson-04': ['final glottal stop', 'final consonants', 'vowel ending'],
      'pronunciation-lesson-05': ['penultimate stress', 'final stress', 'syllable-timed rhythm'],
      'pronunciation-lesson-06': ['stress minimal pairs', 'glottal minimal pairs', 'ng pairs']
    }
  },
  hindi: {
    id: 'hindi',
    title: '印地语发音训练包',
    marketPosition: '印度电商、旅行和日常交流发音，重点解决送气、卷舌和齿音。',
    pronunciationCore: [
      '短元音和长元音对比',
      '送气 / 不送气塞音，如 ka / kha、ta / tha',
      '清浊对比和浊送气',
      '卷舌音和齿音的舌位区别',
      '鼻化元音和鼻音连接',
      '印地语短句的自然重音和连读'
    ],
    difficultPoints: [
      '中文母语者容易忽略送气强度',
      '卷舌和齿音容易混成普通 t / d',
      '长短元音会影响词义',
      '浊送气音需要气流和声带同步',
      '鼻化元音不能简单读成 n'
    ],
    scoringDimensions: ['aspiration', 'retroflexPosition', 'dentalPosition', 'vowelLength', 'nasalization'],
    lessonFocus: {
      'pronunciation-lesson-01': ['short vowels', 'long vowels', 'ai / au'],
      'pronunciation-lesson-02': ['ka / kha', 'pa / pha', 'ta / tha'],
      'pronunciation-lesson-03': ['retroflex vs dental', 'voiced aspirates', 'r / l'],
      'pronunciation-lesson-04': ['nasal finals', 'anusvara', 'nasalized vowels'],
      'pronunciation-lesson-05': ['word rhythm', 'phrase stress', 'linking'],
      'pronunciation-lesson-06': ['aspiration pairs', 'retroflex-dental pairs', 'vowel length pairs']
    }
  },
  tamil: {
    id: 'tamil',
    title: '泰米尔语发音训练包',
    marketPosition: '南印度生活、商务和课程发音，重点训练卷舌、多种 r/l/n 和长短元音。',
    pronunciationCore: [
      '短元音和长元音的时长对比',
      '卷舌音 ṭ / ṇ / ḷ / ẓ 的舌位',
      '多种 r、l、n 的区别',
      '不依赖送气的塞音系统',
      '词中清浊变化和重辅音',
      '泰米尔语短句的音节节奏'
    ],
    difficultPoints: [
      'ழ / ḻ 类音对学习者非常难',
      '长短元音必须拉开时长',
      '多个 l / r / n 容易合并',
      '不能把泰米尔塞音读成印地语式送气',
      '重辅音需要停顿和时长感'
    ],
    scoringDimensions: ['vowelLength', 'retroflexControl', 'lateralContrast', 'rhoticContrast', 'gemination'],
    lessonFocus: {
      'pronunciation-lesson-01': ['short vowels', 'long vowels', 'ai / au'],
      'pronunciation-lesson-02': ['k / c / t / p', 'm / n', 'y / v'],
      'pronunciation-lesson-03': ['ṭ / t', 'ṇ / n', 'ḷ / l', 'ḻ'],
      'pronunciation-lesson-04': ['geminate consonants', 'nasal endings', 'vowel endings'],
      'pronunciation-lesson-05': ['syllable timing', 'phrase rhythm', 'spoken Tamil flow'],
      'pronunciation-lesson-06': ['retroflex pairs', 'long-short pairs', 'l-r-n pairs']
    }
  }
};

function buildLessonsForDialect(dialect) {
  const plan = LANGUAGE_CURRICULUM[dialect];
  return COMMON_LESSON_BLUEPRINT.map((lesson, index) => ({
    ...lesson,
    id: `${dialect}-${lesson.id}`,
    order: index + 1,
    focus: plan.lessonFocus[lesson.id] || [],
    generationGuidance: {
      includeFunSentences: index >= 6,
      includeBusinessScenario: index === 8,
      includeContrastPairs: index === 5 || index === 11,
      avoidPlaceholderText: true
    }
  }));
}

function buildCurriculumPlan() {
  return DIALECTS.reduce((accumulator, dialect) => {
    const meta = getLanguageMeta(dialect);
    const plan = LANGUAGE_CURRICULUM[dialect];
    accumulator[dialect] = {
      ...plan,
      locale: meta.locale,
      languageName: meta.name,
      englishName: meta.englishName,
      targetItems: TARGET_ITEMS_PER_DIALECT,
      targetLessons: TARGET_LESSONS_PER_DIALECT,
      targetItemsPerLesson: TARGET_ITEMS_PER_LESSON,
      lessons: buildLessonsForDialect(dialect)
    };
    return accumulator;
  }, {});
}

const curriculumPlan = buildCurriculumPlan();

function getCurriculumPlan(dialect) {
  return dialect ? curriculumPlan[dialect] : curriculumPlan;
}

module.exports = {
  TARGET_ITEMS_PER_DIALECT,
  TARGET_LESSONS_PER_DIALECT,
  TARGET_ITEMS_PER_LESSON,
  COMMON_LESSON_BLUEPRINT,
  LANGUAGE_CURRICULUM,
  curriculumPlan,
  getCurriculumPlan
};
