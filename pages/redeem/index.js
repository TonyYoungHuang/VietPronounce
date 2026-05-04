const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { attachShare } = require('../../utils/share');

function friendlyRedeemError(error) {
  const message = String((error && error.message) || '');
  if (message.includes('已被使用')) return '这个激活码已经使用过，请核对订单信息。';
  if (message.includes('无效') || message.includes('不存在')) return '激活码无效，请检查大小写和连接符。';
  if (message.includes('已经开通')) return '当前学习档案已经开通完整课程。';
  if (message.includes('请输入')) return message;
  return '暂时无法完成开通，请稍后重试或联系课程顾问。';
}

Page(attachShare({
  data: {
    code: '',
    redeemed: false,
    message: '',
    loading: false,
    benefits: [
      { title: '全部语种', subtitle: '激活对应语种或全部课程', icon: 'globe' },
      { title: '标准范读', subtitle: '按语种区分的标准示范', icon: 'voice' },
      { title: '细化反馈', subtitle: '声调、元音、尾音逐项纠正', icon: 'question' },
      { title: '学习档案', subtitle: '按设备保存进度与记录', icon: 'minus' }
    ]
  },

  handleInput(event) {
    this.setData({ code: String(event.detail.value || '').trim().toUpperCase(), message: '' });
  },

  async ensureRemoteUser() {
    const currentUserId = store.getUserId();
    if (currentUserId) return currentUserId;
    const remoteUser = await appApi.createAnonymousUser();
    store.hydrateFromRemoteUser(remoteUser);
    return store.getUserId();
  },

  async submit() {
    if (this.data.loading) return;
    const code = String(this.data.code || '').trim().toUpperCase();
    if (!code) {
      this.setData({ message: '请输入激活码。' });
      wx.showToast({ title: '请输入激活码', icon: 'none' });
      return;
    }

    this.setData({ loading: true, message: '' });
    try {
      const userId = await this.ensureRemoteUser();
      await appApi.redeem(userId, code);
      const remoteUser = await appApi.fetchUserState(userId);
      store.hydrateFromRemoteUser(remoteUser);
      this.setData({
        redeemed: true,
        message: '激活成功，课程已解锁。'
      });
      wx.showToast({ title: '激活成功', icon: 'none' });
    } catch (error) {
      const message = friendlyRedeemError(error);
      this.setData({ redeemed: false, message });
      wx.showToast({ title: message, icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    wx.switchTab({ url: '/pages/profile/index' });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  },

  goCourse() {
    wx.navigateTo({ url: '/pages/levels/index' });
  },

  goProfile() {
    wx.switchTab({ url: '/pages/profile/index' });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index?from=redeem' });
  }
}, { path: '/pages/landing/index?from=share' }));
