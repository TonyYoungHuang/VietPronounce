const { createMirroredLessonPair } = require('./content-template');

const beginnerMirrorRoadmap = [
  {
    status: 'existing',
    lessonIndex: 1,
    lessonKey: 'beginner-lesson-1',
    topic: '问候起步',
    typeSequence: ['syllable', 'word', 'sentence']
  },
  {
    status: 'existing',
    lessonIndex: 2,
    lessonKey: 'beginner-lesson-2',
    topic: '礼貌表达',
    typeSequence: ['word', 'sentence']
  },
  {
    status: 'planned',
    lessonIndex: 3,
    lessonKey: 'beginner-lesson-3',
    topic: '声调与尾音起步',
    typeSequence: ['syllable', 'syllable', 'word', 'word', 'sentence', 'sentence']
  },
  {
    status: 'planned',
    lessonIndex: 4,
    lessonKey: 'beginner-lesson-4',
    topic: '数字与数量起步',
    typeSequence: ['syllable', 'word', 'word', 'sentence', 'sentence', 'sentence']
  },
  {
    status: 'planned',
    lessonIndex: 5,
    lessonKey: 'beginner-lesson-5',
    topic: '称呼与自我介绍起步',
    typeSequence: ['word', 'word', 'sentence', 'sentence', 'sentence', 'sentence']
  },
  {
    status: 'planned',
    lessonIndex: 6,
    lessonKey: 'beginner-lesson-6',
    topic: '常见问句开口',
    typeSequence: ['word', 'word', 'sentence', 'sentence', 'sentence', 'sentence']
  },
  {
    status: 'planned',
    lessonIndex: 7,
    lessonKey: 'beginner-lesson-7',
    topic: '购物与价格短句',
    typeSequence: ['word', 'word', 'sentence', 'sentence', 'sentence', 'sentence']
  },
  {
    status: 'planned',
    lessonIndex: 8,
    lessonKey: 'beginner-lesson-8',
    topic: '点餐与礼貌请求',
    typeSequence: ['word', 'word', 'sentence', 'sentence', 'sentence', 'sentence']
  }
];

const beginnerExpansionSkeleton = beginnerMirrorRoadmap
  .filter((lesson) => lesson.status === 'planned')
  .map((lesson) => ({
    ...lesson,
    pair: createMirroredLessonPair({
      levelId: 'beginner',
      lessonKey: lesson.lessonKey,
      typeSequence: lesson.typeSequence,
      northTitle: `北越${lesson.topic}`,
      northSummary: `北越零基础第 ${lesson.lessonIndex} 课骨架：围绕“${lesson.topic}”补充音节、单词和极短句。`,
      southTitle: `南越${lesson.topic}`,
      southSummary: `南越零基础第 ${lesson.lessonIndex} 课骨架：围绕“${lesson.topic}”补充音节、单词和极短句。`
    })
  }));

module.exports = {
  beginnerMirrorRoadmap,
  beginnerExpansionSkeleton
};
