const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { attachShare } = require('../../utils/share');

Page(attachShare({
  data: {
    next: '',
    loading: false
  },

  onLoad(query) {
    this.setData({ next: query.next || '/pages/home/index' });
  },

  async handleLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const remoteUser = await appApi.loginWithWechat('发音练习学员');
      store.hydrateFromRemoteUser(remoteUser);
    } catch (error) {
      store.createLocalSession();
      wx.showToast({ title: '已进入账号绑定流程', icon: 'none' });
    }

    this.setData({ loading: false });
    wx.navigateTo({ url: `/pages/bind-phone/index?next=${encodeURIComponent(this.data.next)}` });
  },

  skipBind() {
    wx.switchTab({ url: '/pages/home/index' });
  }
}, { path: '/pages/landing/index?from=share' }));
