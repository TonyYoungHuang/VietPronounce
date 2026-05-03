Component({
  data: {
    selected: 0,
    list: [
      { pagePath: 'pages/home/index', text: '首页', icon: 'home' },
      { pagePath: 'pages/weakness/index', text: '课程', icon: 'book' },
      { pagePath: 'pages/profile/index', text: '个人', icon: 'person' }
    ]
  },

  methods: {
    switchTab(event) {
      const { path, index } = event.currentTarget.dataset;
      if (index === this.data.selected) return;
      wx.switchTab({ url: `/${path}` });
    }
  }
});
