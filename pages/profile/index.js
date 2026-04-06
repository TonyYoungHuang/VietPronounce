const store = require('../../utils/store');
const appApi = require('../../services/app-api');

Page({
  data: {
    auth: {},
    product: {},
    selectedDialect: 'north'
  },

  async onShow() {
    const userId = store.getUserId();
    if (userId) {
      try {
        const remoteUser = await appApi.fetchUserState(userId);
        store.hydrateFromRemoteUser(remoteUser);
      } catch (error) {
        // keep local fallback
      }
    }
    const state = store.getState();
    this.setData({ auth: state.auth, product: state.product, selectedDialect: state.selectedDialect });
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
        wx.showToast({ title: '后端暂不可用，仅在本地切换成功', icon: 'none' });
      }
    }

    this.setData({ selectedDialect: dialect });
    wx.showToast({ title: `已切到${dialect === 'south' ? '南越' : '北越'}`, icon: 'none' });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/index?next=/pages/profile/index' });
  },

  goRedeem() {
    wx.navigateTo({ url: '/pages/redeem/index' });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index?from=profile' });
  },

  goLevels() {
    wx.navigateTo({ url: '/pages/levels/index' });
  }
});
