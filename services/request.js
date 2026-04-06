function buildUrl(baseUrl, path) {
  if (!baseUrl) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${String(baseUrl).replace(/\/$/, '')}${String(path).startsWith('/') ? path : `/${path}`}`;
}

function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (response) => resolve(response),
      fail: (error) => reject(error)
    });
  });
}

function uploadFile(options) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      ...options,
      success: (response) => resolve(response),
      fail: (error) => reject(error)
    });
  });
}

module.exports = {
  buildUrl,
  request,
  uploadFile
};
