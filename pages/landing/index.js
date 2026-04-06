Page({
  goStart() {
    wx.navigateTo({ url: '/pages/dialect/index?entry=landing' });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/index?from=landing' });
  }
});
