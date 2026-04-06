const store = require('../../utils/store');
const appApi = require('../../services/app-api');

Page({
  data: {
    phone: '',
    next: '',
    loading: false
  },

  onLoad(query) {
    this.setData({ next: decodeURIComponent(query.next || '/pages/home/index') });
  },

  handleInput(event) {
    this.setData({ phone: event.detail.value });
  },

  async submit() {
    const phone = (this.data.phone || '').trim();
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      const userId = store.getUserId();
      if (userId) {
        const remoteUser = await appApi.bindPhone(userId, phone);
        store.hydrateFromRemoteUser(remoteUser);
      } else {
        store.bindPhone(phone);
      }
      wx.showToast({ title: '手机号已绑定', icon: 'none' });
    } catch (error) {
      store.bindPhone(phone);
      wx.showToast({ title: '后端暂不可用，已在本地保存手机号', icon: 'none' });
    }

    this.setData({ loading: false });
    setTimeout(() => {
      if (this.data.next.indexOf('/pages/home/index') === 0) {
        wx.switchTab({ url: '/pages/home/index' });
      } else if (this.data.next.indexOf('/pages/profile/index') === 0) {
        wx.switchTab({ url: '/pages/profile/index' });
      } else if (this.data.next.indexOf('/pages/weakness/index') === 0) {
        wx.switchTab({ url: '/pages/weakness/index' });
      } else {
        wx.redirectTo({ url: this.data.next });
      }
    }, 300);
  }
});
