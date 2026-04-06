const store = require('../../utils/store');
const appApi = require('../../services/app-api');

Page({
  data: {
    next: '',
    loading: false
  },

  onLoad(query) {
    this.setData({ next: query.next || '/pages/home/index' });
  },

  async handleLogin() {
    this.setData({ loading: true });
    try {
      const remoteUser = await appApi.mockLogin('发音练习学员');
      store.hydrateFromRemoteUser(remoteUser);
    } catch (error) {
      store.mockLogin();
      wx.showToast({ title: '后端暂不可用，已切到本地登录', icon: 'none' });
    }

    this.setData({ loading: false });
    wx.navigateTo({ url: `/pages/bind-phone/index?next=${encodeURIComponent(this.data.next)}` });
  }
});
