const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const syncTabBar = require('../../utils/tab-bar');
const { attachShare } = require('../../utils/share');

Page(attachShare({
  data: {
    auth: {},
    product: {},
    selectedDialect: 'north',
    dialects: [],
    avatarText: 'V',
    nickName: '学习档案'
  },

  async onShow() {
    syncTabBar(this, 'pages/profile/index');
    const userId = store.getUserId();
    if (userId) {
      try {
        const remoteUser = await appApi.fetchUserState(userId);
        store.hydrateFromRemoteUser(remoteUser);
      } catch (error) {
        // Keep local state when the network is temporarily unavailable.
      }
    }
    const state = store.getState();
    const nickName = state.auth.nickName || '学习档案';
    this.setData({
      auth: state.auth,
      product: state.product,
      selectedDialect: state.selectedDialect,
      dialects: store.getDialectIds().map((dialect) => {
        const meta = store.getLanguageInfo(dialect);
        return {
          id: dialect,
          name: meta.name,
          meta: meta.englishName || meta.shortName || dialect,
          description: meta.description
        };
      }),
      avatarText: nickName.slice(0, 1).toUpperCase() || 'V',
      nickName
    });
  },

  async switchDialect(event) {
    const dialect = event.currentTarget.dataset.dialect;
    store.setSelectedDialect(dialect);
    const userId = store.getUserId();

    if (userId) {
      try {
        const remoteUser = await appApi.updateDialect(userId, dialect);
        store.hydrateFromRemoteUser(remoteUser);
      } catch (error) {
        wx.showToast({ title: '已切换，稍后自动同步', icon: 'none' });
      }
    }

    this.setData({ selectedDialect: dialect });
    wx.showToast({ title: `已切到${store.getDialectLabel(dialect)}`, icon: 'none' });
  },

  goRedeem() {
    wx.navigateTo({ url: '/pages/redeem/index' });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index?from=profile' });
  },

  goLevels() {
    wx.navigateTo({ url: '/pages/levels/index' });
  },

  goDialect() {
    wx.navigateTo({ url: '/pages/dialect/index' });
  }
}, { path: '/pages/landing/index?from=share' }));
