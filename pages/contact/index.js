const { attachShare } = require('../../utils/share');
Page(attachShare({
  copyConsult() {
    wx.setClipboardData({
      data: '您好，我想了解越南语发音课程，请介绍北越/南越课程内容、购买方式和开通流程。',
      success: () => wx.showToast({ title: '咨询说明已复制', icon: 'none' })
    });
  },

  copyPurchaseFlow() {
    wx.setClipboardData({
      data: '购买后请保存订单信息和兑换码，回到小程序「个人」页面输入兑换码即可开通完整课程。',
      success: () => wx.showToast({ title: '开通流程已复制', icon: 'none' })
    });
  },

  goRedeem() {
    wx.navigateTo({ url: '/pages/redeem/index' });
  }
}, { path: '/pages/landing/index?from=share' }));
