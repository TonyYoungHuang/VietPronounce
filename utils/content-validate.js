function assertString(value, message) {
  if (!String(value || '').trim()) {
    throw new Error(message);
  }
}

function assertSegments(segments, message) {
  if (!Array.isArray(segments)) {
    throw new Error(message);
  }
}

function assertCatalogItem(item, messagePrefix) {
  ['id', 'type', 'text', 'translation', 'hint', 'demoAudio'].forEach((field) => {
    assertString(item && item[field], `${messagePrefix} 缺少 ${field}`);
  });
  assertSegments(item && item.segments, `${messagePrefix} 的 segments 必须是数组`);
}

function assertCatalogShape(catalog) {
  if (!catalog || typeof catalog !== 'object') {
    throw new Error('课程目录必须是对象');
  }

  ['north', 'south'].forEach((dialect) => {
    const dialectCatalog = catalog[dialect];
    if (!dialectCatalog || !Array.isArray(dialectCatalog.levels) || !dialectCatalog.levels.length) {
      throw new Error(`${dialect} 目录缺少 levels`);
    }

    dialectCatalog.levels.forEach((level, levelIndex) => {
      assertString(level && level.id, `${dialect} 第 ${levelIndex + 1} 个等级缺少 id`);
      assertString(level && level.name, `${dialect} 等级 ${level.id || levelIndex + 1} 缺少 name`);
      if (!Array.isArray(level.lessons) || !level.lessons.length) {
        throw new Error(`${dialect} 等级 ${level.id || levelIndex + 1} 缺少 lessons`);
      }

      level.lessons.forEach((lesson, lessonIndex) => {
        assertString(lesson && lesson.id, `${dialect} 第 ${lessonIndex + 1} 个课时缺少 id`);
        assertString(lesson && lesson.title, `${dialect} 课时 ${lesson.id || lessonIndex + 1} 缺少 title`);
        if (!Array.isArray(lesson.items) || !lesson.items.length) {
          throw new Error(`${dialect} 课时 ${lesson.id || lessonIndex + 1} 缺少 items`);
        }

        lesson.items.forEach((item, itemIndex) => {
          assertCatalogItem(item, `${dialect} / ${lesson.id || lessonIndex + 1} / item-${itemIndex + 1}`);
        });
      });
    });
  });

  return catalog;
}

function assertTrialShape(item, dialect) {
  ['id', 'lessonId', 'levelId', 'type', 'text', 'translation', 'hint', 'demoAudio'].forEach((field) => {
    assertString(item && item[field], `${dialect} 试听内容缺少 ${field}`);
  });
  assertSegments(item && item.segments, `${dialect} 试听内容的 segments 必须是数组`);
  return item;
}

module.exports = {
  assertCatalogShape,
  assertTrialShape
};
