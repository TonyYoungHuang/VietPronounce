const STATUS_KEY = 'vi_coach_network_status_v1';

function getDefaultStatus() {
  return {
    online: true,
    usingCache: false,
    message: '',
    checkedAt: ''
  };
}

function getNetworkStatus() {
  try {
    return {
      ...getDefaultStatus(),
      ...(wx.getStorageSync(STATUS_KEY) || {})
    };
  } catch (error) {
    return getDefaultStatus();
  }
}

function setNetworkStatus(status) {
  const next = {
    ...getNetworkStatus(),
    ...status,
    checkedAt: new Date().toISOString()
  };
  try {
    wx.setStorageSync(STATUS_KEY, next);
  } catch (error) {}
  return next;
}

function markOnline() {
  return setNetworkStatus({
    online: true,
    usingCache: false,
    message: ''
  });
}

function markUsingCache(message = '当前为离线缓存内容，恢复连接后会自动同步。') {
  return setNetworkStatus({
    online: false,
    usingCache: true,
    message
  });
}

function getOfflineNotice() {
  const status = getNetworkStatus();
  return status.usingCache ? status.message : '';
}

module.exports = {
  getNetworkStatus,
  setNetworkStatus,
  markOnline,
  markUsingCache,
  getOfflineNotice
};
