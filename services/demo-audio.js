const { getAppApiConfig } = require('../config/index');
const { buildUrl } = require('./request');

function encodeQuery(params) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

function getDemoAudioUrl({ text, dialect, mode }) {
  const config = getAppApiConfig();
  const query = encodeQuery({
    text,
    dialect,
    mode: mode === 'slow' ? 'slow' : 'normal'
  });
  return buildUrl(config.baseUrl, `/api/audio/demo${query ? `?${query}` : ''}`);
}

module.exports = {
  getDemoAudioUrl
};
