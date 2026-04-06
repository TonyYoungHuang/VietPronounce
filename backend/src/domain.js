const crypto = require('crypto');
const { levels: levelMeta } = require('../../data/mock');
const store = require('./store');

const DIALECTS = ['north', 'south'];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeDialect(dialect) {
  return dialect === 'south' ? 'south' : 'north';
}

function inferDialectFromId(value, fallback = 'north') {
  if (typeof value !== 'string') return normalizeDialect(fallback);
  if (value.startsWith('south')) return 'south';
  if (value.startsWith('north')) return 'north';
  return normalizeDialect(fallback);
}

function sanitizeNickName(nickName) {
  const normalized = String(nickName || '').trim();
  if (!normalized || /^[?？]+$/.test(normalized)) {
    return '发音练习学员';
  }
  return normalized;
}

function assertNonEmptyString(value, message) {
  if (!String(value || '').trim()) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

function getCatalog() {
  return store.readCatalog();
}

function getTrialCollection() {
  return store.readTrial();
}

function getCatalogItemIndex(catalog) {
  const index = { north: {}, south: {} };
  for (const dialect of DIALECTS) {
    const dialectCatalog = catalog[dialect];
    for (const level of dialectCatalog.levels) {
      for (const lesson of level.lessons) {
        for (const item of lesson.items) {
          index[dialect][item.id] = {
            ...item,
            lessonId: lesson.id,
            levelId: level.id
          };
        }
      }
    }
  }
  return index;
}

function createDefaultDialectProgress(catalog, dialect) {
  const level = catalog[dialect].levels[0];
  const lesson = level.lessons[0];
  const item = lesson.items[0];
  return {
    lastLevelId: level.id,
    lastLessonId: lesson.id,
    lastItemId: item.id,
    itemResults: {}
  };
}

function createDefaultUser(userId, nickName) {
  const catalog = getCatalog();
  return {
    userId,
    selectedDialect: 'north',
    auth: {
      loggedIn: true,
      nickName: sanitizeNickName(nickName),
      phone: ''
    },
    product: {
      unlocked: false,
      redeemedCode: '',
      redeemedAt: ''
    },
    latestPracticeResult: null,
    dialects: {
      north: createDefaultDialectProgress(catalog, 'north'),
      south: createDefaultDialectProgress(catalog, 'south')
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function hydrateScoreResult(result, fallbackDialect) {
  if (!result) return null;
  const catalog = getCatalog();
  const index = getCatalogItemIndex(catalog);
  const dialect = normalizeDialect(result.dialect || inferDialectFromId(result.itemId, fallbackDialect));
  const catalogItem = result.itemId ? index[dialect][result.itemId] : null;
  const segments = catalogItem ? catalogItem.segments : Array.isArray(result.segments) ? result.segments : [];

  return {
    ...result,
    dialect,
    itemId: catalogItem ? catalogItem.id : result.itemId,
    itemText: catalogItem ? catalogItem.text : result.itemText,
    itemTranslation: catalogItem ? catalogItem.translation : result.itemTranslation,
    lessonId: catalogItem ? catalogItem.lessonId : result.lessonId,
    levelId: catalogItem ? catalogItem.levelId : result.levelId,
    demoAudio: catalogItem ? catalogItem.demoAudio : result.demoAudio,
    segments,
    issueIndices: Array.isArray(result.issueIndices) ? result.issueIndices.filter((indexValue) => Number.isInteger(indexValue) && indexValue >= 0 && indexValue < segments.length) : []
  };
}

function sanitizeDialectProgress(progress, dialect, catalog) {
  const fallback = createDefaultDialectProgress(catalog, dialect);
  const next = {
    ...fallback,
    ...(progress || {}),
    itemResults: {}
  };
  const results = (progress && progress.itemResults) || {};
  for (const [itemId, result] of Object.entries(results)) {
    next.itemResults[itemId] = hydrateScoreResult(result, dialect);
  }

  const itemExists = getCatalogItemIndex(catalog)[dialect][next.lastItemId];
  if (!itemExists) {
    return fallback;
  }
  return next;
}

function sanitizeUser(user) {
  const catalog = getCatalog();
  const fallbackUser = createDefaultUser(user.userId || crypto.randomUUID(), user?.auth?.nickName);
  const selectedDialect = normalizeDialect(user.selectedDialect || fallbackUser.selectedDialect);
  const nextUser = {
    ...fallbackUser,
    ...user,
    selectedDialect,
    auth: {
      ...fallbackUser.auth,
      ...(user.auth || {}),
      nickName: sanitizeNickName(user?.auth?.nickName || fallbackUser.auth.nickName)
    },
    product: {
      ...fallbackUser.product,
      ...(user.product || {})
    },
    latestPracticeResult: hydrateScoreResult(user.latestPracticeResult, selectedDialect),
    dialects: {
      north: sanitizeDialectProgress(user?.dialects?.north, 'north', catalog),
      south: sanitizeDialectProgress(user?.dialects?.south, 'south', catalog)
    },
    createdAt: user.createdAt || fallbackUser.createdAt,
    updatedAt: user.updatedAt || fallbackUser.updatedAt
  };
  return nextUser;
}

function readUsersMap() {
  return store.readUsers();
}

function writeUsersMap(usersMap) {
  return store.writeUsers(usersMap);
}

function saveUser(user) {
  const users = readUsersMap();
  const nextUser = sanitizeUser({
    ...user,
    updatedAt: new Date().toISOString()
  });
  users[nextUser.userId] = nextUser;
  writeUsersMap(users);
  return nextUser;
}

function getUser(userId) {
  if (!userId) return null;
  const users = readUsersMap();
  const user = users[userId];
  return user ? sanitizeUser(user) : null;
}

function requireUser(userId) {
  const user = getUser(userId);
  if (!user) {
    const error = new Error('找不到对应用户');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

function createUser(nickName) {
  const user = createDefaultUser(crypto.randomUUID(), nickName);
  return saveUser(user);
}

function mockLogin(nickName) {
  return createUser(nickName || '发音练习学员');
}

function bindPhone(userId, phone) {
  assertNonEmptyString(userId, '缺少用户 ID');
  assertNonEmptyString(phone, '请输入手机号');
  if (!/^1\d{10}$/.test(String(phone))) {
    const error = new Error('手机号格式不正确');
    error.statusCode = 400;
    throw error;
  }
  const user = requireUser(userId);
  user.auth.phone = phone;
  return saveUser(user);
}

function updateDialect(userId, dialect) {
  assertNonEmptyString(userId, '缺少用户 ID');
  const user = requireUser(userId);
  user.selectedDialect = normalizeDialect(dialect);
  return saveUser(user);
}

function getTrial(dialect) {
  const trials = getTrialCollection();
  return clone(trials[normalizeDialect(dialect)] || trials.north);
}

function redeemProduct(userId, code) {
  assertNonEmptyString(userId, '缺少用户 ID');
  assertNonEmptyString(code, '请输入兑换码');

  const normalizedCode = String(code || '').trim().toUpperCase();
  const user = requireUser(userId);
  if (user.product.unlocked) {
    const error = new Error('当前账号已经开通完整版，无需重复兑换');
    error.statusCode = 400;
    throw error;
  }

  const redeemCodes = store.readRedeemCodes();
  const entry = redeemCodes.find((item) => item.code === normalizedCode);
  if (!entry) {
    const error = new Error('兑换码无效，请核对后再试');
    error.statusCode = 400;
    throw error;
  }
  if (entry.used && entry.usedBy && entry.usedBy !== userId) {
    const error = new Error('兑换码已被使用');
    error.statusCode = 400;
    throw error;
  }

  const redeemedAt = new Date().toISOString();
  user.product.unlocked = true;
  user.product.redeemedCode = normalizedCode;
  user.product.redeemedAt = redeemedAt;
  entry.used = true;
  entry.usedBy = userId;
  entry.usedAt = redeemedAt;

  saveUser(user);
  store.writeRedeemCodes(redeemCodes);
  return requireUser(userId);
}

function getLevels(userId, dialect) {
  const user = requireUser(userId);
  const normalizedDialect = normalizeDialect(dialect || user.selectedDialect);
  const catalog = getCatalog();
  const results = user.dialects[normalizedDialect].itemResults;

  return catalog[normalizedDialect].levels.map((level) => {
    const itemIds = level.lessons.flatMap((lesson) => lesson.items.map((item) => item.id));
    const passed = itemIds.filter((itemId) => results[itemId] && results[itemId].passed).length;
    const meta = levelMeta.find((item) => item.id === level.id) || {};
    return {
      id: level.id,
      name: level.name,
      subtitle: meta.subtitle || '',
      accent: meta.accent || '',
      lessonCount: level.lessons.length,
      itemCount: itemIds.length,
      progress: {
        passed,
        total: itemIds.length,
        percent: itemIds.length ? Math.round((passed / itemIds.length) * 100) : 0
      }
    };
  });
}

function getLessons(userId, dialect, levelId) {
  assertNonEmptyString(levelId, '缺少等级 ID');
  const user = requireUser(userId);
  const normalizedDialect = normalizeDialect(dialect || user.selectedDialect);
  const catalog = getCatalog();
  const level = catalog[normalizedDialect].levels.find((item) => item.id === levelId);
  if (!level) {
    const error = new Error('找不到对应等级');
    error.statusCode = 404;
    throw error;
  }

  return level.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    items: lesson.items.map((item) => ({
      ...item,
      lessonId: lesson.id,
      levelId: level.id,
      result: user.dialects[normalizedDialect].itemResults[item.id] || null
    }))
  }));
}

function normalizeScore(score) {
  const numericFields = ['total', 'completeness', 'accuracy', 'fluency', 'attemptCount', 'durationMs'];
  const normalized = { ...(score || {}) };
  for (const field of numericFields) {
    if (normalized[field] !== undefined) {
      normalized[field] = Number(normalized[field]);
    }
  }
  if (['total', 'completeness', 'accuracy', 'fluency'].some((field) => Number.isNaN(normalized[field]))) {
    const error = new Error('评分数据不完整');
    error.statusCode = 400;
    throw error;
  }
  normalized.passed = typeof normalized.passed === 'boolean' ? normalized.passed : normalized.total >= 78;
  normalized.issueIndices = Array.isArray(normalized.issueIndices) ? normalized.issueIndices : [];
  normalized.attemptCount = Number.isNaN(normalized.attemptCount) ? 1 : normalized.attemptCount || 1;
  normalized.durationMs = Number.isNaN(normalized.durationMs) ? 0 : normalized.durationMs || 0;
  return normalized;
}

function saveScore(userId, dialect, itemId, score) {
  assertNonEmptyString(userId, '缺少用户 ID');
  assertNonEmptyString(itemId, '缺少练习项 ID');

  const user = requireUser(userId);
  const normalizedDialect = normalizeDialect(dialect || user.selectedDialect);
  const catalogIndex = getCatalogItemIndex(getCatalog());
  const catalogItem = catalogIndex[normalizedDialect][itemId];
  if (!catalogItem) {
    const error = new Error('找不到对应练习项');
    error.statusCode = 404;
    throw error;
  }

  const normalizedScore = normalizeScore(score);
  const payload = {
    ...normalizedScore,
    dialect: normalizedDialect,
    itemId: catalogItem.id,
    itemText: catalogItem.text,
    itemTranslation: catalogItem.translation,
    lessonId: catalogItem.lessonId,
    levelId: catalogItem.levelId,
    demoAudio: catalogItem.demoAudio,
    segments: catalogItem.segments,
    practicedAt: score.practicedAt || new Date().toISOString(),
    scoreSource: score.scoreSource || 'mock',
    rawScoreData: score.rawScoreData || null,
    recordAudio: score.recordAudio || ''
  };
  payload.issueIndices = payload.issueIndices.filter((indexValue) => Number.isInteger(indexValue) && indexValue >= 0 && indexValue < payload.segments.length);

  user.selectedDialect = normalizedDialect;
  user.latestPracticeResult = payload;
  user.dialects[normalizedDialect].itemResults[itemId] = payload;
  user.dialects[normalizedDialect].lastLevelId = catalogItem.levelId;
  user.dialects[normalizedDialect].lastLessonId = catalogItem.lessonId;
  user.dialects[normalizedDialect].lastItemId = itemId;

  return saveUser(user);
}

function getWeakness(userId, dialect) {
  const user = requireUser(userId);
  const normalizedDialect = normalizeDialect(dialect || user.selectedDialect);
  return Object.values(user.dialects[normalizedDialect].itemResults)
    .filter((item) => !item.passed || item.total < 82)
    .sort((left, right) => left.total - right.total)
    .slice(0, 12);
}

function listRedeemCodes() {
  return store.readRedeemCodes().slice().sort((left, right) => {
    if (left.used === right.used) {
      return left.code.localeCompare(right.code);
    }
    return left.used ? 1 : -1;
  });
}

function createRedeemCode(input = {}) {
  const codes = store.readRedeemCodes();
  const code = String(input.code || `VIET-${Date.now()}`).trim().toUpperCase();
  assertNonEmptyString(code, '兑换码不能为空');
  if (codes.some((item) => item.code === code)) {
    const error = new Error('兑换码已存在');
    error.statusCode = 400;
    throw error;
  }

  const next = {
    code,
    used: false,
    usedBy: '',
    usedAt: ''
  };
  codes.unshift(next);
  store.writeRedeemCodes(codes);
  return next;
}

function listUsers() {
  return Object.values(readUsersMap())
    .map((user) => sanitizeUser(user))
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
}

function validateCatalogItem(item, messagePrefix) {
  for (const field of ['id', 'type', 'text', 'translation', 'hint', 'demoAudio']) {
    assertNonEmptyString(item && item[field], `${messagePrefix} 缺少 ${field}`);
  }
  if (!Array.isArray(item.segments)) {
    const error = new Error(`${messagePrefix} 的 segments 必须是数组`);
    error.statusCode = 400;
    throw error;
  }
}

function validateCatalog(value) {
  if (!value || typeof value !== 'object') {
    const error = new Error('课程目录必须是对象');
    error.statusCode = 400;
    throw error;
  }

  for (const dialect of DIALECTS) {
    const dialectCatalog = value[dialect];
    if (!dialectCatalog || !Array.isArray(dialectCatalog.levels) || !dialectCatalog.levels.length) {
      const error = new Error(`${dialect} 目录缺少 levels`);
      error.statusCode = 400;
      throw error;
    }
    for (const level of dialectCatalog.levels) {
      assertNonEmptyString(level.id, `${dialect} 等级缺少 id`);
      assertNonEmptyString(level.name, `${dialect} 等级缺少 name`);
      if (!Array.isArray(level.lessons) || !level.lessons.length) {
        const error = new Error(`${dialect} 等级 ${level.id} 缺少 lessons`);
        error.statusCode = 400;
        throw error;
      }
      for (const lesson of level.lessons) {
        assertNonEmptyString(lesson.id, `${dialect} 课时缺少 id`);
        assertNonEmptyString(lesson.title, `${dialect} 课时缺少 title`);
        if (!Array.isArray(lesson.items) || !lesson.items.length) {
          const error = new Error(`${dialect} 课时 ${lesson.id} 缺少 items`);
          error.statusCode = 400;
          throw error;
        }
        lesson.items.forEach((item, itemIndex) => validateCatalogItem(item, `${dialect} / ${lesson.id} / item-${itemIndex + 1}`));
      }
    }
  }
}

function validateTrialItem(item, dialect) {
  const required = ['id', 'lessonId', 'levelId', 'type', 'text', 'translation', 'hint', 'demoAudio'];
  for (const field of required) {
    assertNonEmptyString(item && item[field], `${dialect} 试听内容缺少 ${field}`);
  }
  if (!Array.isArray(item.segments)) {
    const error = new Error(`${dialect} 试听内容的 segments 必须是数组`);
    error.statusCode = 400;
    throw error;
  }
}

function validateTrialCollection(value) {
  if (!value || typeof value !== 'object') {
    const error = new Error('试听内容必须是对象');
    error.statusCode = 400;
    throw error;
  }
  for (const dialect of DIALECTS) {
    validateTrialItem(value[dialect], dialect);
  }
}

function reconcileUsersWithCatalog() {
  const users = readUsersMap();
  const next = {};
  for (const [userId, user] of Object.entries(users)) {
    next[userId] = sanitizeUser(user);
  }
  writeUsersMap(next);
}

function saveCatalog(nextCatalog) {
  validateCatalog(nextCatalog);
  store.writeCatalog(nextCatalog, { backup: true });
  reconcileUsersWithCatalog();
  return clone(nextCatalog);
}

function saveTrial(nextTrial) {
  validateTrialCollection(nextTrial);
  store.writeTrial(nextTrial, { backup: true });
  return clone(nextTrial);
}

try {
  reconcileUsersWithCatalog();
} catch (error) {
  // Ignore startup repair failure; route handlers will surface actionable errors.
}

module.exports = {
  getCatalog,
  getTrial,
  mockLogin,
  getUser,
  requireUser,
  saveUser,
  bindPhone,
  updateDialect,
  redeemProduct,
  getLevels,
  getLessons,
  saveScore,
  getWeakness,
  listRedeemCodes,
  createRedeemCode,
  listUsers,
  saveCatalog,
  saveTrial,
  validateCatalog,
  validateTrialCollection
};
