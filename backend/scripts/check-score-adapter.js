const assert = require('assert/strict');
const { config } = require('../../config/index');
const { buildRequestFormData, normalizeScorePayload } = require('../../services/score');

const previousMode = config.scoreApi.mode;
const previousProvider = config.scoreApi.provider;
const previousRequestMapping = JSON.parse(JSON.stringify(config.scoreApi.requestMapping));
const previousResponseMapping = JSON.parse(JSON.stringify(config.scoreApi.responseMapping));

try {
  config.scoreApi.mode = 'remote';
  config.scoreApi.provider = 'vendor-check';
  config.scoreApi.requestMapping = {
    fileFieldName: 'speechFile',
    fields: {
      dialect: 'accent',
      itemId: 'referenceId',
      transcript: 'referenceText',
      itemType: 'contentType',
      lessonId: 'chapterId',
      levelId: 'stageId',
      durationMs: 'audioDuration',
      attemptCount: 'retryCount'
    },
    dialectValues: {
      north: 'vi-VN-north',
      south: 'vi-VN-south'
    },
    itemTypeValues: {
      sentence: 'sent'
    },
    staticParams: {
      appId: 'mini-program-check'
    }
  };
  config.scoreApi.responseMapping = {
    root: 'result.metrics',
    total: 'overall',
    completeness: 'integrity',
    accuracy: 'accuracy',
    fluency: 'fluency',
    passed: 'passed',
    issueIndices: 'problemSegments',
    durationMs: 'audioDuration'
  };

  const formData = buildRequestFormData(
    {
      dialect: 'north',
      attemptCount: 2,
      item: {
        id: 'north-beginner-3',
        text: 'xin chao',
        type: 'sentence',
        lessonId: 'north-beginner-lesson-1',
        levelId: 'beginner'
      }
    },
    { durationMs: 2130 },
    config.scoreApi
  );

  assert.deepEqual(formData, {
    appId: 'mini-program-check',
    accent: 'vi-VN-north',
    referenceId: 'north-beginner-3',
    referenceText: 'xin chao',
    contentType: 'sent',
    chapterId: 'north-beginner-lesson-1',
    stageId: 'beginner',
    audioDuration: 2130,
    retryCount: 2
  });

  const normalized = normalizeScorePayload(
    {
      result: {
        metrics: {
          overall: 91,
          integrity: 89,
          accuracy: 94,
          fluency: 88,
          passed: true,
          problemSegments: [1],
          audioDuration: 2130
        }
      }
    },
    config.scoreApi
  );

  assert.equal(normalized.total, 91);
  assert.equal(normalized.completeness, 89);
  assert.equal(normalized.accuracy, 94);
  assert.equal(normalized.fluency, 88);
  assert.equal(normalized.passed, true);
  assert.deepEqual(normalized.issueIndices, [1]);
  assert.equal(normalized.durationMs, 2130);

  console.log('Score adapter mapping check passed.');
} finally {
  config.scoreApi.mode = previousMode;
  config.scoreApi.provider = previousProvider;
  config.scoreApi.requestMapping = previousRequestMapping;
  config.scoreApi.responseMapping = previousResponseMapping;
}
