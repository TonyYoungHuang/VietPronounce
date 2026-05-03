const {
  DIALECTS,
  VIETNAMESE_DIALECTS,
  LEVEL_ORDER,
  CONTENT_FIELDS,
  CONTENT_TYPES,
  LEVEL_CONTENT_POLICY,
  stripDialectPrefix
} = require('../data/content-standard');

function assertString(value, message) {
  if (!String(value || '').trim()) {
    throw new Error(message);
  }
}

function assertArray(value, message) {
  if (!Array.isArray(value)) {
    throw new Error(message);
  }
}

function assertItemType(type, messagePrefix) {
  if (!CONTENT_TYPES.includes(type)) {
    throw new Error(`${messagePrefix} 的 type 必须是 ${CONTENT_TYPES.join(' / ')}`);
  }
}

function assertSegments(segments, messagePrefix) {
  assertArray(segments, `${messagePrefix} 的 segments 必须是数组`);
  if (!segments.length) {
    throw new Error(`${messagePrefix} 的 segments 至少要有 1 项`);
  }
  segments.forEach((segment, index) => {
    assertString(segment && segment.text, `${messagePrefix} 的第 ${index + 1} 个 segment 缺少 text`);
    assertString(segment && segment.tip, `${messagePrefix} 的第 ${index + 1} 个 segment 缺少 tip`);
  });
}

function assertCatalogItem(item, messagePrefix) {
  CONTENT_FIELDS
    .filter((field) => field !== 'segments')
    .forEach((field) => {
      assertString(item && item[field], `${messagePrefix} 缺少 ${field}`);
    });
  assertItemType(item && item.type, messagePrefix);
  assertSegments(item && item.segments, messagePrefix);
}

function assertLevelPolicy(level, dialect) {
  const policy = LEVEL_CONTENT_POLICY[level.id];
  if (!policy) {
    throw new Error(`${dialect} 等级 ${level.id} 不在标准等级清单中`);
  }

  const itemTypes = level.lessons.flatMap((lesson) => lesson.items.map((item) => item.type));
  itemTypes.forEach((type, index) => {
    if (!policy.allowedTypes.includes(type)) {
      throw new Error(
        `${dialect} 等级 ${level.id} 的第 ${index + 1} 个 item type=${type} 不符合“${policy.focus}”标准`
      );
    }
  });

  policy.requiredTypeCoverage.forEach((type) => {
    if (!itemTypes.includes(type)) {
      throw new Error(`${dialect} 等级 ${level.id} 至少需要包含 1 个 ${type} 类型内容`);
    }
  });
}

function assertMirrorStructure(catalog) {
  if (!VIETNAMESE_DIALECTS.every((dialect) => catalog[dialect])) {
    return;
  }
  const northLevels = catalog.north.levels;
  const southLevels = catalog.south.levels;

  if (northLevels.length !== southLevels.length) {
    throw new Error('北越与南越的等级数量必须一致');
  }

  northLevels.forEach((northLevel, levelIndex) => {
    const southLevel = southLevels[levelIndex];
    if (!southLevel) {
      throw new Error(`南越缺少第 ${levelIndex + 1} 个镜像等级`);
    }
    if (northLevel.id !== southLevel.id) {
      throw new Error(`北越/南越第 ${levelIndex + 1} 个等级 id 必须一致`);
    }
    if (northLevel.lessons.length !== southLevel.lessons.length) {
      throw new Error(`等级 ${northLevel.id} 的北越与南越课时数量必须一致`);
    }

    northLevel.lessons.forEach((northLesson, lessonIndex) => {
      const southLesson = southLevel.lessons[lessonIndex];
      if (!southLesson) {
        throw new Error(`等级 ${northLevel.id} 在南越缺少第 ${lessonIndex + 1} 个镜像课时`);
      }

      if (stripDialectPrefix(northLesson.id) !== stripDialectPrefix(southLesson.id)) {
        throw new Error(`等级 ${northLevel.id} 的第 ${lessonIndex + 1} 个课时 id 骨架必须镜像一致`);
      }
      if (northLesson.items.length !== southLesson.items.length) {
        throw new Error(`课时 ${northLesson.id} 与 ${southLesson.id} 的 item 数量必须一致`);
      }

      northLesson.items.forEach((northItem, itemIndex) => {
        const southItem = southLesson.items[itemIndex];
        if (!southItem) {
          throw new Error(`课时 ${southLesson.id} 缺少第 ${itemIndex + 1} 个镜像 item`);
        }
        if (northItem.type !== southItem.type) {
          throw new Error(`镜像 item ${northItem.id} / ${southItem.id} 的 type 序列必须一致`);
        }
        if (stripDialectPrefix(northItem.id) !== stripDialectPrefix(southItem.id)) {
          throw new Error(`镜像 item ${northItem.id} / ${southItem.id} 的 id 骨架必须一致`);
        }
      });
    });
  });
}

function assertCatalogShape(catalog) {
  if (!catalog || typeof catalog !== 'object') {
    throw new Error('课程目录必须是对象');
  }

  DIALECTS.filter((dialect) => catalog[dialect]).forEach((dialect) => {
    const dialectCatalog = catalog[dialect];
    if (!dialectCatalog || !Array.isArray(dialectCatalog.levels) || !dialectCatalog.levels.length) {
      throw new Error(`${dialect} 目录缺少 levels`);
    }

    const levelIds = dialectCatalog.levels.map((level) => level.id);
    if (levelIds.join('|') !== LEVEL_ORDER.join('|')) {
      throw new Error(`${dialect} 的等级顺序必须固定为 ${LEVEL_ORDER.join(' -> ')}`);
    }

    dialectCatalog.levels.forEach((level, levelIndex) => {
      assertString(level && level.id, `${dialect} 第 ${levelIndex + 1} 个等级缺少 id`);
      assertString(level && level.name, `${dialect} 等级 ${level.id || levelIndex + 1} 缺少 name`);
      assertArray(level && level.lessons, `${dialect} 等级 ${level.id || levelIndex + 1} 缺少 lessons`);
      if (!level.lessons.length) {
        throw new Error(`${dialect} 等级 ${level.id || levelIndex + 1} 至少要有 1 个 lesson`);
      }

      level.lessons.forEach((lesson, lessonIndex) => {
        assertString(lesson && lesson.id, `${dialect} 第 ${lessonIndex + 1} 个课时缺少 id`);
        assertString(lesson && lesson.title, `${dialect} 课时 ${lesson.id || lessonIndex + 1} 缺少 title`);
        assertString(lesson && lesson.summary, `${dialect} 课时 ${lesson.id || lessonIndex + 1} 缺少 summary`);
        assertArray(lesson && lesson.items, `${dialect} 课时 ${lesson.id || lessonIndex + 1} 缺少 items`);
        if (!lesson.items.length) {
          throw new Error(`${dialect} 课时 ${lesson.id || lessonIndex + 1} 至少要有 1 个 item`);
        }

        lesson.items.forEach((item, itemIndex) => {
          assertCatalogItem(item, `${dialect} / ${lesson.id || lessonIndex + 1} / item-${itemIndex + 1}`);
        });
      });

      assertLevelPolicy(level, dialect);
    });
  });

  assertMirrorStructure(catalog);
  return catalog;
}

function assertTrialShape(item, dialect, catalog) {
  CONTENT_FIELDS
    .filter((field) => field !== 'segments')
    .forEach((field) => {
      assertString(item && item[field], `${dialect} 试听内容缺少 ${field}`);
    });

  assertItemType(item && item.type, `${dialect} 试听内容`);
  assertSegments(item && item.segments, `${dialect} 试听内容`);

  if (!catalog || !catalog[dialect]) {
    return item;
  }

  const matchedLevel = catalog[dialect].levels.find((level) => level.id === item.levelId);
  if (!matchedLevel) {
    throw new Error(`${dialect} 试听内容引用了不存在的 levelId=${item.levelId}`);
  }

  const matchedLesson = matchedLevel.lessons.find((lesson) => lesson.id === item.lessonId);
  if (!matchedLesson) {
    throw new Error(`${dialect} 试听内容引用了不存在的 lessonId=${item.lessonId}`);
  }

  const policy = LEVEL_CONTENT_POLICY[item.levelId];
  if (policy && !policy.allowedTypes.includes(item.type)) {
    throw new Error(`${dialect} 试听内容的 type=${item.type} 不符合等级 ${item.levelId} 的内容标准`);
  }

  return item;
}

module.exports = {
  assertCatalogShape,
  assertTrialShape
};
