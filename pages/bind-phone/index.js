const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { enqueueSyncTask } = require('../../utils/sync-queue');
const { attachShare } = require('../../utils/share');

function navigateNext(url) {
  if (url.indexOf('/pages/home/index') === 0) {
    wx.switchTab({ url: '/pages/home/index' });
  } else if (url.indexOf('/pages/profile/index') === 0) {
    wx.switchTab({ url: '/pages/profile/index' });
  } else if (url.indexOf('/pages/weakness/index') === 0) {
    wx.switchTab({ url: '/pages/weakness/index' });
  } else {
    wx.redirectTo({ url });
  }
}

Page(attachShare({
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
    if (this.data.loading) return;

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
      const userId = store.getUserId();
      if (userId) {
        enqueueSyncTask('bindPhone', { userId, phone });
      }
      wx.showToast({ title: '已保存，稍后自动同步', icon: 'none' });
    }

    this.setData({ loading: false });
    setTimeout(() => navigateNext(this.data.next), 300);
  },

  skip() {
    navigateNext(this.data.next || '/pages/home/index');
  }
}, { path: '/pages/landing/index?from=share' }));
