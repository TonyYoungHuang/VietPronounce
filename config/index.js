const config = {
  appApi: {
    baseUrl: 'http://127.0.0.1:4100',
    timeout: 12000
  },
  scoreApi: {
    // remote | mock
    mode: 'mock',
    provider: 'generic',
    baseUrl: '',
    scorePath: '/pronunciation/score',
    timeout: 12000,
    fileFieldName: 'audio',
    useMockFallback: true,
    headers: {},
    auth: {
      type: 'none',
      headerName: 'Authorization',
      token: '',
      prefix: 'Bearer '
    },
    requestMapping: {
      fileFieldName: 'audio',
      fields: {
        dialect: 'dialect',
        itemId: 'itemId',
        transcript: 'text',
        itemType: 'type',
        lessonId: 'lessonId',
        levelId: 'levelId',
        durationMs: 'durationMs',
        attemptCount: 'attemptCount'
      },
      dialectValues: {
        north: 'north',
        south: 'south'
      },
      itemTypeValues: {
        syllable: 'syllable',
        word: 'word',
        sentence: 'sentence'
      },
      staticParams: {}
    },
    responseMapping: {
      root: 'data.score',
      total: 'total',
      completeness: 'completeness',
      accuracy: 'accuracy',
      fluency: 'fluency',
      passed: 'passed',
      issueIndices: 'issueIndices',
      durationMs: 'durationMs',
      message: 'message'
    }
  }
};

function getScoreApiConfig() {
  return config.scoreApi;
}

function getAppApiConfig() {
  return config.appApi;
}

module.exports = {
  config,
  getScoreApiConfig,
  getAppApiConfig
};
