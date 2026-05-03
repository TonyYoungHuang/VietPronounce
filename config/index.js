const PRODUCTION_API_BASE_URL = 'https://viet-api.pindoupicture.cn';
const RUNTIME_CONFIG_KEY = 'vi_coach_runtime_config_v1';

const ENV_PROFILES = {
  development: {
    appApiBaseUrl: PRODUCTION_API_BASE_URL,
    scoreApiBaseUrl: PRODUCTION_API_BASE_URL
  },
  trial: {
    appApiBaseUrl: PRODUCTION_API_BASE_URL,
    scoreApiBaseUrl: PRODUCTION_API_BASE_URL
  },
  production: {
    appApiBaseUrl: PRODUCTION_API_BASE_URL,
    scoreApiBaseUrl: PRODUCTION_API_BASE_URL
  }
};

const DEPLOY_ENV = 'development';

function getMiniProgramEnv() {
  try {
    if (typeof wx !== 'undefined' && wx.getAccountInfoSync) {
      const account = wx.getAccountInfoSync();
      return account && account.miniProgram && account.miniProgram.envVersion;
    }
  } catch (error) {}
  return '';
}

function getActiveEnv() {
  const miniProgramEnv = getMiniProgramEnv();
  if (miniProgramEnv === 'release') return 'production';
  if (miniProgramEnv === 'trial') return 'trial';
  return DEPLOY_ENV;
}

function getRuntimeConfig() {
  const globalConfig = typeof globalThis !== 'undefined' ? globalThis.__VI_COACH_CONFIG__ : null;
  if (globalConfig && typeof globalConfig === 'object') return globalConfig;
  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      const stored = wx.getStorageSync(RUNTIME_CONFIG_KEY);
      if (stored && typeof stored === 'object') return stored;
    }
  } catch (error) {}
  return {};
}

function getProfile() {
  const profile = ENV_PROFILES[getActiveEnv()] || ENV_PROFILES.development;
  const runtimeConfig = getRuntimeConfig();
  return {
    ...profile,
    appApiBaseUrl: runtimeConfig.appApiBaseUrl || profile.appApiBaseUrl,
    scoreApiBaseUrl: runtimeConfig.scoreApiBaseUrl || profile.scoreApiBaseUrl || runtimeConfig.appApiBaseUrl || profile.appApiBaseUrl
  };
}

const config = {
  appApi: {
    baseUrl: '',
    timeout: 12000,
    healthPath: '/health',
    friendlyError: '服务暂时不可用，请稍后再试'
  },
  scoreApi: {
    // remote | local
    mode: 'remote',
    provider: 'backend-proxy',
    baseUrl: '',
    scorePath: '/api/pronunciation/score',
    timeout: 12000,
    fileFieldName: 'audio',
    useLocalFallback: false,
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
        language: 'language',
        locale: 'locale',
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
        south: 'south',
        thai: 'thai',
        malay: 'malay',
        tagalog: 'tagalog'
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
      scoreSource: 'scoreSource',
      pronunciationDimensions: 'pronunciationDimensions',
      message: 'message'
    }
  }
};

function getScoreApiConfig() {
  const profile = getProfile();
  return {
    ...config.scoreApi,
    baseUrl: config.scoreApi.baseUrl || profile.scoreApiBaseUrl || config.appApi.baseUrl || profile.appApiBaseUrl
  };
}

function getAppApiConfig() {
  const profile = getProfile();
  return {
    ...config.appApi,
    environment: getActiveEnv(),
    baseUrl: config.appApi.baseUrl || profile.appApiBaseUrl
  };
}

module.exports = {
  PRODUCTION_API_BASE_URL,
  RUNTIME_CONFIG_KEY,
  ENV_PROFILES,
  config,
  getActiveEnv,
  getScoreApiConfig,
  getAppApiConfig
};
