Page({
  copyWechat() {
    wx.setClipboardData({
      data: 'VIET-COACH-001',
      success: () => wx.showToast({ title: '客服微信已复制', icon: 'none' })
    });
  },

  copyTaobao() {
    wx.setClipboardData({
      data: '请咨询客服获取电商购买链接与兑换码',
      success: () => wx.showToast({ title: '购买说明已复制', icon: 'none' })
    });
  }
});
