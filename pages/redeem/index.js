const store = require('../../utils/store');
const appApi = require('../../services/app-api');
const { attachShare } = require('../../utils/share');

function friendlyRedeemError(error) {
  const message = String((error && error.message) || '');
  if (message.includes('已被使用')) return '这个兑换码已经使用过，请核对订单信息。';
  if (message.includes('无效') || message.includes('不存在')) return '兑换码无效，请检查大小写和连接符。';
  if (message.includes('已经开通')) return '当前账号已经开通完整课程。';
  if (message.includes('请输入')) return message;
  return '暂时无法完成开通，请稍后重试或联系课程顾问。';
}

Page(attachShare({
  data: {
    code: '',
    redeemed: false,
    message: '',
    loading: false,
    needLogin: false,
    needPhone: false,
    benefits: [
      { title: '全部课程', subtitle: '北越与南越两套路径', icon: 'globe' },
      { title: '真人范读', subtitle: '按方言区分的标准示范', icon: 'voice' },
      { title: '细化反馈', subtitle: '声调、元音、尾音逐项纠正', icon: 'question' },
      { title: '纯净学习', subtitle: '专注发音训练节奏', icon: 'minus' }
    ]
  },

  onShow() {
    this.refreshGate();
  },

  refreshGate() {
    this.setData({
      needLogin: !store.isLoggedIn(),
      needPhone: store.isLoggedIn() && !store.hasBoundPhone()
    });
  },

  handleInput(event) {
    this.setData({ code: event.detail.value.trim().toUpperCase(), message: '' });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/index?next=/pages/redeem/index' });
  },

  goBindPhone() {
    wx.navigateTo({ url: '/pages/bind-phone/index?next=/pages/redeem/index' });
  },

  async submit() {
    this.refreshGate();
    if (this.data.needLogin) {
      this.goLogin();
      return;
    }
    if (this.data.needPhone) {
      this.goBindPhone();
      return;
    }
    if (this.data.loading) return;

    const code = String(this.data.code || '').trim().toUpperCase();
    if (!code) {
      this.setData({ message: '请输入兑换码。' });
      wx.showToast({ title: '请输入兑换码', icon: 'none' });
      return;
    }

    this.setData({ loading: true, message: '' });
    try {
      const userId = store.getUserId();
      if (userId) {
        await appApi.redeem(userId, code);
        const remoteUser = await appApi.fetchUserState(userId);
        store.hydrateFromRemoteUser(remoteUser);
      } else {
        const result = store.redeem(code);
        if (!result.ok) throw new Error(result.message);
      }
      this.setData({
        redeemed: true,
        message: '开通成功，北越与南越课程均已解锁。'
      });
      wx.showToast({ title: '开通成功', icon: 'none' });
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
