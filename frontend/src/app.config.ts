export default defineAppConfig({
  pages: [
    'pages/wardrobe/index',
    'pages/wardrobe/upload',
    'pages/recommend/index',
    'pages/record/index',
    'pages/settings/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '穿搭助手',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#333',
    backgroundColor: '#fff',
    list: [
      { pagePath: 'pages/wardrobe/index', text: '衣橱' },
      { pagePath: 'pages/recommend/index', text: '推荐' },
      { pagePath: 'pages/record/index', text: '记录' },
      { pagePath: 'pages/settings/index', text: '设置' }
    ]
  }
});
