const {
  LEVEL_CONTENT_POLICY,
  createItemTemplate,
  createLessonTemplate,
  createMirroredLessonPair
} = require('./content-standard');

function createLevelBlueprint(levelId) {
  const policy = LEVEL_CONTENT_POLICY[levelId];
  if (!policy) {
    throw new Error(`未知等级：${levelId}`);
  }

  return {
    id: policy.id,
    name: policy.name,
    focus: policy.focus,
    allowedTypes: policy.allowedTypes,
    ratioGuide: policy.ratioGuide
  };
}

module.exports = {
  LEVEL_CONTENT_POLICY,
  createLevelBlueprint,
  createItemTemplate,
  createLessonTemplate,
  createMirroredLessonPair
};
