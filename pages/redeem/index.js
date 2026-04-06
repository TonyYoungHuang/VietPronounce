const store = require('../../utils/store');
const appApi = require('../../services/app-api');

Page({
  data: {
    code: '',
    redeemed: false,
    message: ''
  },

  handleInput(event) {
    this.setData({ code: event.detail.value });
  },

  async submit() {
    if (!store.isLoggedIn()) {
      wx.navigateTo({ url: '/pages/login/index?next=/pages/redeem/index' });
      return;
    }
    if (!store.hasBoundPhone()) {
      wx.navigateTo({ url: '/pages/bind-phone/index?next=/pages/redeem/index' });
      return;
    }

    try {
      const userId = store.getUserId();
      if (userId) {
        await appApi.redeem(userId, this.data.code);
        const remoteUser = await appApi.fetchUserState(userId);
        store.hydrateFromRemoteUser(remoteUser);
        this.setData({ redeemed: true, message: '兑换成功，北越与南越体系都已解锁。' });
      } else {
        const result = store.redeem(this.data.code);
        this.setData({ redeemed: result.ok, message: result.message });
      }
    } catch (error) {
      this.setData({ redeemed: false, message: error.message || '兑换失败' });
    }

    wx.showToast({ title: this.data.message, icon: 'none' });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index?from=redeem' });
  }
});
