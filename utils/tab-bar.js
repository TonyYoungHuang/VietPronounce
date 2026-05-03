function syncTabBar(page, route) {
  if (!page || typeof page.getTabBar !== 'function') {
    return;
  }
  const tabBar = page.getTabBar();
  if (!tabBar || typeof tabBar.setData !== 'function') {
    return;
  }
  const list = tabBar.data.list || [];
  const selected = list.findIndex((item) => item.pagePath === route);
  if (selected > -1) {
    tabBar.setData({ selected });
  }
}

module.exports = syncTabBar;
