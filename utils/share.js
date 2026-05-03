const DEFAULT_TITLE = '每天练一点，发音准一点';
const DEFAULT_PATH = '/pages/landing/index?from=share';
const DEFAULT_IMAGE = '';

function enableShareMenu() {
  if (typeof wx === 'undefined' || !wx.showShareMenu) return;
  try {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  } catch (error) {}
}

function buildSharePath(path) {
  return path || DEFAULT_PATH;
}

function buildShareMessage(options = {}) {
  return {
    title: options.title || DEFAULT_TITLE,
    path: buildSharePath(options.path),
    imageUrl: options.imageUrl || DEFAULT_IMAGE
  };
}

function buildShareTimeline(options = {}) {
  const path = buildSharePath(options.path);
  const query = path.includes('?') ? path.split('?').slice(1).join('?') : 'from=timeline';
  return {
    title: options.title || DEFAULT_TITLE,
    query,
    imageUrl: options.imageUrl || DEFAULT_IMAGE
  };
}

function attachShare(pageOptions, shareOptions = {}) {
  const originalOnLoad = pageOptions.onLoad;
  const originalOnShow = pageOptions.onShow;

  return {
    ...pageOptions,
    onLoad(query) {
      enableShareMenu();
      if (originalOnLoad) {
        return originalOnLoad.call(this, query);
      }
      return undefined;
    },
    onShow() {
      enableShareMenu();
      if (originalOnShow) {
        return originalOnShow.call(this);
      }
      return undefined;
    },
    onShareAppMessage() {
      return buildShareMessage(
        typeof shareOptions === 'function' ? shareOptions.call(this) : shareOptions
      );
    },
    onShareTimeline() {
      return buildShareTimeline(
        typeof shareOptions === 'function' ? shareOptions.call(this) : shareOptions
      );
    }
  };
}

module.exports = {
  DEFAULT_TITLE,
  DEFAULT_PATH,
  enableShareMenu,
  buildShareMessage,
  buildShareTimeline,
  attachShare
};
